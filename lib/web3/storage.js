const fetch = require('node-fetch');
const { Base64 } = require('js-base64');

const Web3PromiEvent = require('web3-core-promievent');
const Web3 = require('web3');
const merkle = require('../utils/merkle');
const utils = require('../utils/utils');
const crypto = require('../utils/crypto');

/**
 * sendRequest - Send post request useing node-fetch
 *
 * @param  {string} endpoint Target url string
 * @param  {string} body     data in quesry string format
 * @param  {object} [headers]  Object containing headers configuraiton
 * @return {promise}  Promise containing connection results.
 */
function sendRequest(endpoint, body, headers, method = 'POST') {
  let opts = {
    method,
    headers: typeof (headers) === 'undefined' ? { 'content-type': 'application/x-www-form-urlencoded' } : headers,
    body,
  };
  if (method.toLowerCase() === 'get' || method.toLowerCase() === 'head') {
    delete opts['body'];
  }
  return fetch(endpoint, opts);
}


function serialize(obj) {
  return `?${Object.keys(obj).reduce((a, k) => { a.push(`${k}=${encodeURIComponent(obj[k])}`); return a; }, []).join('&')}`;
}

function toType(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

const StorageManager = function StorageManager(web3Endpoint, storageEndpoint, settings) {
  this.web3 = new Web3(new Web3.providers.HttpProvider(web3Endpoint));
  this.endpoint = storageEndpoint;
  this.settings = settings;
  this.storageCostsContract = new this.web3.eth.Contract(
    this.settings.contracts.storageCostsABI,
    this.settings.contracts.storageCostsAddress
  );
  this.storageContract = new this.web3.eth.Contract(
    this.settings.contracts.storageABI,
    this.settings.contracts.storageAddress
  );
};

StorageManager.prototype.getDepositBalance = function getDepositBalance(wallet) {
  return this.storageContract.methods.getDepositBalance(wallet).call();
};

StorageManager.prototype.getStorageCosts = function getStorageCosts(size, duration) {
  return this.storageCostsContract.methods.getStorageCosts(size, duration).call();
};

StorageManager.prototype.getIdForKey = function getIdForKey(keyname, address) {
  return this.storageContract.methods
    .getActualIdForKey(address, this.web3.utils.toHex(keyname))
    .call();
};

StorageManager.prototype.getIdsForKey = function getIdsForKey(keyname, address) {
  return this.storageContract.methods
    .getIdsForAccountByKey(address, this.web3.utils.toHex(keyname))
    .call();
};

StorageManager.prototype.getEncryptionForId = function getEncryptionForId(id) {
  return this.storageContract.methods.getEncryptedSecret(id).call();
};
StorageManager.prototype.sendDeleteRequest = function sendDeleteRequest(
  endpoint,
  route,
  requestObj
) {
  return this.sendRequestToNode(endpoint, route, requestObj, 'DELETE');
};

StorageManager.prototype.sendGetRequest = function sendGetRequest(
  endpoint,
  route,
  requestObj
) {
  return this.sendRequestToNode(endpoint, route, requestObj, 'GET');
};

StorageManager.prototype.postStorageNode = function postStorageNode(route, requestObj) {
  return this.sendRequestToNode(this.endpoint, route, requestObj, 'POST');
};

StorageManager.prototype.sendUpdateRequest = function sendUpdateRequest(
  endpoint,
  route,
  requestObj
) {
  return this.sendRequestToNode(endpoint, route, requestObj, 'PUT');
};

StorageManager.prototype.postCustomStorageNode = function postCustomStorageNode(
  endpoint,
  route,
  postObj
) {
  return this.sendRequestToNode(endpoint, route, postObj, 'POST');
};

StorageManager.prototype.sendRequestToNode = function sendRequestToNode(
  endpoint,
  route,
  postObj,
  method
) {
  let requestPromise;
  if (method.toLowerCase() === 'get' || method.toLowerCase() === 'head') {
      let reqParam = '?';
      Object.keys(postObj).forEach(function (k) {
          reqParam += (k + '=' + encodeURIComponent(postObj[k]) + '&');
      });
      reqParam = reqParam.substring(0, reqParam.length-1);
      requestPromise = sendRequest(endpoint + route + reqParam, '', undefined, method);
  } else {
      const postParams = `?${Object.keys(postObj).reduce((a, k) => { a.push(`${k}=${encodeURIComponent(postObj[k])}`); return a; }, []).join('&')}`;
      requestPromise = sendRequest(endpoint + route, postParams.substr(1), undefined, method);
  }
  return requestPromise.then((response) => {
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`error ${method} for storage node ${endpoint + route}: ${response.text}`);
      }
      return response.text();
    });
};


StorageManager.prototype.sendSequentialGetRequest = function sendSequentialGetRequest(
  endpoints,
  route,
  postObj
) {
  return new Promise(async (resolve, reject) => {
    const errors = [];
    for (let i = 0; i < endpoints.length; i += 1) {
      try {
        const data = await this.sendGetRequest(endpoints[i], route, postObj);
        resolve({ errors, data });
        break;
      } catch (ex) {
        errors.push(ex);
        if (errors.length === endpoints.length) {
          reject(errors);
        }
      }
    }
  });
};
// eslint-disable-next-line max-len
StorageManager.prototype.postCustomStorageNodeSequentiallyIfFail = function postCustomStorageNodeSequentiallyIfFail(
  endpoints,
  route,
  postObj,
  index = 0
) {
  return this.postCustomStorageNode(endpoints[index], route, postObj).catch((e) => {
    console.error(e);
    if (endpoints.length > index + 1) {
      return this.postCustomStorageNodeSequentiallyIfFail(endpoints, route, postObj, index + 1);
    }
    throw e;
  });
};

/**
 * Upload Data to storage node and init contract in same turn
 *
 * @method set
 * @param {object} data data you wanna store
 * @param {string} key optional key name for the data, can be empty
 * @param {string} category the category for the data
 * @param {string} metadata the metadata for the data item
 * @param {int} replicationMode the active replication mode for the data, default 1
 * @param {int} pricacyLevel the pricacy level of the data, default 1
 * @param {int} duration amount of days the data should be stored
 * @param {number} deposit if the deposit should make in same transaction
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.set = function set(
  data,
  key = '_default_',
  category = '',
  metadata = '',
  replicationMode = 1,
  pricacyLevel = 1,
  duration = 30,
  deposit = 0
) {
  const promiEvent = Web3PromiEvent();

  const dataObject = this.prepareData(data);
  promiEvent.eventEmitter.emit('encrypted', dataObject);

  const prom = deposit > 0 ? this.deposit(deposit) : Promise.resolve(true);
  Promise.all([
    prom,
    this.getDepositBalance(this.sender),
    this.getStorageCosts(dataObject.encryptedData.length, duration),
  ]).then((args) => {
    if (parseInt(args[1], 10) < parseInt(args[2], 10)) throw Error('insufficient balance, please make a deposit first');

    this.getTx('set', this.sender, dataObject.id, dataObject.merkle, key, dataObject.encryptedData.length, duration, replicationMode, pricacyLevel, dataObject.encryptedSecret)
      .then((tx) => {
        // set storage node if selected as from address
        const transaction = {
          ...tx,
          from: '0x61ae403158018fc8eb77be5e4be2b57e9143412f',
        };

        const signedTx = utils.signTransaction(transaction, this.privateKey);
        const signedHex = `0x${signedTx.toString('hex')}`;

        const signature = this.sign(signedHex);

        const postParams = {
          id: dataObject.id,
          signature: signature.signature,
          msg: signature.message,
          data: dataObject.encryptedData,
          category,
          merkle: dataObject.merkle,
          metadata,
          replicationMode,
          duration,
          privacy: pricacyLevel,
          key,
        };

        const postParamsString = serialize(postParams);

        return sendRequest(this.endpoint, postParamsString.substr(1))
          .then((result) => {
            promiEvent.resolve(result);
          }).catch((error) => {
            promiEvent.reject(error);
          });

        /*
            this.send(tx).once('transactionHash', function (hash) {
                promiEvent.eventEmitter.emit('transaction', hash);
            }).then(mined => {
                promiEvent.eventEmitter.emit('mined', mined);
  //wait until node syced
                return new Promise(function (resolve) {
                    setTimeout(resolve.bind(null, true), 3000)
                });
            }).then(synced => {

            }).then(result => {
                promiEvent.resolve(result);
            }).catch(error => {
                promiEvent.reject(error);
            });
            */
      });
  }).catch((error) => {
    promiEvent.reject(error);
  });

  return promiEvent.eventEmitter;
};


/* get transactions */
StorageManager.prototype.getTx = function getTx(method, ...args) {
  return this.getNonce()
    .then(nonce => this.getGasPrice()
      .then((price) => {
        const newNonce = nonce > this.lastNonce ? nonce : this.lastNonce + 1;
        this.lastNonce = newNonce;

        const rawTransaction = {
          to: this.settings.contracts.storageAddress,
          from: this.sender,
          nonce: this.web3.utils.toHex(newNonce),
          gasPrice: Web3.utils.toHex(price),
          chainID: Web3.utils.toHex(this.settings.network.network_id)
        };

        let m;

        switch (method) {
          case 'set':
            m = this.storageContract.methods.setStorage(
              args[0],
              args[1],
              args[2],
              this.web3.utils.toHex(args[3]),
              args[4],
              args[5],
              args[6],
              args[7],
              args[8]
            );
            break;
          case 'delete':
            m = this.storageContract.methods.removeDataItem(
              args[0]
            );
            break;
          case 'deleteKey':
            m = this.storageContract.methods.removeKey(
              this.web3.utils.toHex(args[0])
            );
            break;
          case 'addAccess':
            m = this.storageContract.methods.addAccess(
              args[0],
              args[1],
              this.web3.utils.toHex(args[2])
            );
            break;
          case 'removeAccess':
            m = this.storageContract.methods.removeStorageAccessKey(
              args[0],
              args[1],
              this.web3.utils.toHex(args[2])
            );
            break;
          case 'deposit':
            m = this.storageContract.methods.deposit();
            rawTransaction.value = this.web3.utils.toHex(this.web3.utils.toWei(args[0].toString()));
            break;
          case 'withdrawal':
            m = this.storageContract.methods
              .withdrawal(this.web3.utils.toWei(args[0].toString()))
              .encodeABI();
            break;
          default:
        }


        return m.estimateGas({ from: this.sender }).then((costs) => {
          console.log(costs);
          const gasLimit = costs + parseInt((costs / 5), 10);
          console.log(gasLimit);
          rawTransaction.data = m.encodeABI();
          rawTransaction.gasLimit = Web3.utils.toHex(gasLimit);
          console.log(rawTransaction);
          return rawTransaction;
        });
      })
      .catch((error) => {
        console.log(error);
      }));
};


/**
 * Deposit money to storage space
 *
 * @method deposit
 * @param {amount} amount amount in DATCoins to send
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.deposit = function deposit(amount) {
  const promiEvent = Web3PromiEvent();
  // get raw transaction
  this.getTx('deposit', amount).then((tx) => {
    promiEvent.eventEmitter.emit('transactionRaw', tx);

    this.send(tx).once('transactionHash', (hash) => {
      promiEvent.eventEmitter.emit('transaction', hash);
    }).then((mined) => {
      promiEvent.eventEmitter.emit('mined', mined);
      promiEvent.resolve(this.sender, amount);
    }).catch((error) => {
      promiEvent.reject(error);
    });
  });

  return promiEvent.eventEmitter;
};


/**
 * Withdrawal money from storage space
 *
 * @method withdrawal
 * @param {amount} amount amount in DATCoins to send
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.withdrawal = function withdrawal(amount) {
  const promiEvent = Web3PromiEvent();
  // get raw transaction
  this.getTx('withdrawal', amount).then((tx) => {
    promiEvent.eventEmitter.emit('transactionRaw', tx);

    this.send(tx).once('transactionHash', (hash) => {
      promiEvent.eventEmitter.emit('transaction', hash);
    }).then((mined) => {
      promiEvent.eventEmitter.emit('mined', mined);
      promiEvent.resolve(amount);
    }).catch((error) => {
      promiEvent.reject(error);
    });
  });

  return promiEvent.eventEmitter;
};


/**
 * Download Data to storage node
 *
 * @method get
 * @param {id} id id of data to download
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.get = function get(id) {
  return new Promise((resolve, reject) => {
    try {
      const msg = new Date().getTime().toString();
      const signedMessage = this.sign(utils.hash(msg));

      this.getSecret(id).then((secret) => {
        if (secret == null) {
          reject(new Error('Access denied'));
        }
        const plaintextSecret = crypto.ethDecrypt(secret, this.privateKey);
        sendRequest((`${this.endpoint}/v1/storage/download`), (`id=${id}&signature=${signedMessage.message}#${signedMessage.signature}&msg=${msg}`))
          .then((response) => {
            if (response.statusCode === 404) {
              reject(new Error('Not found!'));
            }

            if (response.statusCode === 403) {
              reject(new Error('Access denied!'));
            }

            let ret = Base64.decode(response.body);
            if (ret === 'undefined') {
              ret = JSON.parse(ret);
            }

            const decrypted = crypto.decrypt(ret, plaintextSecret);
            resolve(Base64.decode(decrypted));
          })
          .catch((error) => {
            reject(new Error(`Error downlading data :${error.message}`));
          });
      });
    } catch (error) {
      reject(new Error(`Error hashing and signing data :${error.message}`));
    }
  });
};


/**
 * Download Data from storage node with given key
 *
 * @method getWithKey
 * @param {string} key the name of the the datda
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.getWithKey = function getWithKey(key) {
  return new Promise((resolve, reject) => {
    const msg = new Date().getTime().toString();
    const signedMessage = this.sign(utils.hash(msg));

    // get id from key name
    this.getIdForKey(key).then(id => this.getSecret(id).then((secret) => {
      if (secret == null) {
        reject(new Error('Access denied'));
      }
      const plaintextSecret = crypto.ethDecrypt(secret, this.privateKey);
      sendRequest((`${this.endpoint}/v1/storage/download`), (`id=${id}&signature=${signedMessage.message}#${signedMessage.signature}&msg=${msg}`))
        .then((response) => {
          if (response.statusCode === 404) {
            reject(new Error('Not found!'));
          }

          if (response.statusCode === 403) {
            reject(new Error('Access denied!'));
          }

          let ret = Base64.decode(response.body);
          if (ret === 'undefined') {
            ret = JSON.parse(ret);
          }

          const decrypted = crypto.decrypt(ret, plaintextSecret);
          resolve(Base64.decode(decrypted));
        })
        .catch((error) => {
          reject(new Error(`Error downlading data :${error.message}`));
        });
    })).catch((error) => {
      reject(new Error(`Error :${error.message}`));
    });
  });
};


/**
 * Add another public key to access list for this given data hash
 *
 * @method addKeyToAccessList
 * @param {string} id hash of the data
 * @param {string} key public key address to add to
 * @return {promise} promise
 */
StorageManager.prototype.addPublicKeyForData = function addPublicKeyForData() {

};


/**
 * Delete Data from storage node
 *
 * @method delete
 * @param {id} id id of data to delete
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.delete = function deleteData(id) {
  const promiEvent = Web3PromiEvent();

  // get raw transaction
  this.getTx('delete', id).then((tx) => {
    promiEvent.eventEmitter.emit('transactionRaw', tx);
    this.send(tx).once('transactionHash', (hash) => {
      promiEvent.eventEmitter.emit('transaction', hash);
    }).then((mined) => {
      promiEvent.eventEmitter.emit('mined', mined);

      const msg = new Date().getTime().toString();
      const signedMessage = this.sign(msg);

      sendRequest((`${this.endpoint}/v1/storage/delete`), (`id=${id}&signature=${signedMessage.message}#${signedMessage.signature}&msg=${msg}`))
        .then((response) => {
          promiEvent.resolve(response.body);
        })
        .catch((error) => {
          promiEvent.reject(`Error deleting data :${error.message}`);
        });
    })
      .catch(() => {
        promiEvent.reject('Cant delete item. Already deleted ?');
      });
  })
    .catch((error) => {
      promiEvent.reject(error);
    });


  return promiEvent.eventEmitter;
};


/**
 * Delete Data to storage node by given keyname
 *
 * @method deletByKey
 * @param {string} key keyname of the data
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.deleteByKey = function deleteByKey(key) {
  const promiEvent = Web3PromiEvent();

  this.getIdsForKey(key).then((ids) => {
    this.getTx('deleteKey', key).then((tx) => {
      promiEvent.eventEmitter.emit('transactionRaw', tx);
      this.send(tx).once('transactionHash', (hash) => {
        promiEvent.eventEmitter.emit('transaction', hash);
      }).then((mined) => {
        promiEvent.eventEmitter.emit('mined', mined);

        const msg = new Date().getTime().toString();
        const signedMessage = this.sign(msg);

        for (let i = 0; i < ids.length; i += 1) {
          const id = ids[i];
          sendRequest((`${this.endpoint}/v1/storage/delete`), (`id=${id}&signature=${signedMessage.message}#${signedMessage.signature}&msg=${msg}`))
            .then((response) => {
              promiEvent.resolve(response.body);
            })
            .catch((error) => {
              promiEvent.reject(`Error deleting data :${error.message}`);
            });
        }
      })
        .catch((error) => {
          console.log(error);
          promiEvent.reject('Cant delete item. Already deleted ?');
        });
    })
      .catch((error) => {
        promiEvent.reject(error);
      });
  });

  return promiEvent.eventEmitter;
};


StorageManager.prototype.sign = function sign(data) {
  if (!this.privateKey) {
    console.error('private key not set');
    return null;
  }

  return this.web3.eth.accounts.sign(data, this.privateKey);
};


/* admin, works only from owner  */
StorageManager.prototype.setStorageDepositAmount = function setStorageDepositAmount(amount) {
  return this.web3.getNonce()
    .then((nonce) => {
      const rawTransaction = this.getNewRawTranscation(this.sender, nonce);
      const data = this.storageContract.methods.setStorageDepositAmount(amount).encodeABI();
      rawTransaction.data = data;
      rawTransaction.value = '0x0';

      // sign and broadcast transaction
      return this.sendTransaction(rawTransaction);
    });
};


/* local methods */
StorageManager.prototype.prepareData = function prepareData(data) {
  let dataString;
  if (toType(data) === 'string') {
    dataString = Base64.encode(data);
  } else if (toType(data) === 'object') {
    dataString = Base64.encode(JSON.stringify(data));
  } else {
    dataString = data.toString('base64');
  }

  const randomSecret = Math.random().toString(36).substring(2, 15)
    + Math.random().toString(36).substring(2, 15);
  const encryptedSecret = crypto.ethEncrypt(randomSecret, utils.privateToPublic(this.privateKey));
  const encryptedData = Base64.encode(crypto.encrypt(dataString, randomSecret, this.sender));
  const id = utils.hash(encryptedData);
  const merkleObj = merkle.createMerkle(encryptedData);
  let encryptedSecretDeveloper = '';

  // if developerPublicKey is set, create encrypted secret for developer too
  if (this.developerPublicKey !== '') {
    encryptedSecretDeveloper = crypto.ethEncrypt(randomSecret, `0x${this.developerPublicKey}`);
  }

  return {
    id,
    encryptedSecret,
    encryptedSecretDeveloper,
    encryptedData,
    merkle: merkleObj.root,
    proofs: merkleObj.proofs,
  };
};

module.exports = StorageManager;
