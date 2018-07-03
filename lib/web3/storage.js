const settings = require('./settings');
const crypto = require('../utils/crypto');
const utils = require('../utils/utils');
const merkle = require('../utils/merkle');
const request = require('request');
const Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }
const Web3PromiEvent = require('web3-core-promievent');
const Web3 = require('web3');


var StorageManager = function (web3Endpoint, storageEndpoint, privateKey, developerKey) {
    this.web3 = new Web3(new Web3.providers.HttpProvider(web3Endpoint));
    this.endpoint = storageEndpoint;
    this.lastNonce = -1;
    this.storageCostsContract = new this.web3.eth.Contract(settings.contracts.storageCostsABI, settings.contracts.storageCostsAddress);
    this.storageContract = new this.web3.eth.Contract(settings.contracts.storageABI, settings.contracts.storageAddress);
    this.privateKey = privateKey;
    this.sender = utils.privateToAddress(privateKey);
    this.developerPublicKey = developerKey;
};



/* START - BLOCKCHAIN METHODS */

/**
 * Get the encrypted secret for a data item
 *
 * @method getDepositBalance
 * @param {string} wallet if of the data item
 * @return {string} encrypted secret for data item
 */
StorageManager.prototype.getDepositBalance = function (wallet) {
    return this.storageContract.methods.getDepositBalance(wallet).call({ from: this.sender });
};

StorageManager.prototype.getStorageCosts = function (size, duration) {
    return this.storageCostsContract.methods.getStorageCosts(size, duration)
        .call({ from: this.sender });
};

StorageManager.prototype.getNonce = function () {
    return this.web3.eth.getTransactionCount(this.sender, "pending");
};

/**
 * Get all items for given wallet address under given keyname
 *
 * @method getLastIdForKey
 * @param {string} wallet wallet address
 * @param {string} keyname key name to looup for
 * @return {Promise} Promise with balance in Wei
 */
StorageManager.prototype.getIdForKey = function (keyname) {
    return this.storageContract.methods.getActualIdForKey(this.sender, this.web3.utils.toHex(keyname))
        .call({ from: this.sender });
}

/**
 * Get all items for given wallet address under given keyname
 *
 * @method getIdsForKey
 * @param {string} keyname key name to looup for
 * @return {Promise} Promise with balance in Wei
 */
StorageManager.prototype.getIdsForKey = function (keyname) {
    return this.storageContract.methods.getIdsForAccountByKey(this.sender, this.web3.utils.toHex(keyname))
        .call({ from: this.sender });
}

/**
 * Get the encrypted secret for a data item
 *
 * @method getSecret
 * @param {string} id if of the data item
 * @return {string} encrypted secret for data item
 */
StorageManager.prototype.getSecret = function (id) {
    return this.storageContract.methods.getEncryptedSecret(id)
        .call({ from: this.sender });
};


/**
 * Add another public key to access list
 *
 * @method addKeyToAccessList
 * @param {string} id if of the data item
 * @param {string} key the publicKey of the 3rd party, not the wallet address
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.addKeyToAccessList = function (id, key) {
    var promiEvent = Web3PromiEvent();

    this.getSecret(id).then(secret => {
        //reencrypt secret
        var plaintextSecret = crypto.ethDecrypt(secret, this.privateKey);
        var encryptedSecret = crypto.ethEncrypt(plaintextSecret, '0x' + key);

        //get raw transaction
        this.getTx("addAccess", id, utils.publicToAddress(key), secret).then(tx => {
            promiEvent.eventEmitter.emit('transactionRaw', tx);

            this.send(tx).once('transactionHash', function (hash) {
                promiEvent.eventEmitter.emit('transaction', hash);
            }).then(mined => {
                promiEvent.eventEmitter.emit('mined', mined);
                promiEvent.resolve(encryptedSecret);
            }).catch(error => {
                promiEvent.reject(error);
            });
        });
    }).catch(error => {
        promiEvent.reject(error);
    });

    return promiEvent.eventEmitter;
}




/**
 * Remove another public key to access list
 *
 * @method removeKeyToAccessList
 * @param {string} id if of the data item
 * @param {string} wallet wallet address
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.removeKeyToAccessList = function (id, wallet) {
    var promiEvent = Web3PromiEvent();

    //get raw transaction
    this.getTx("removeAccess", id, wallet).then(tx => {
        promiEvent.eventEmitter.emit('transactionRaw', tx);
        this.send(tx).once('transactionHash', function (hash) {
            promiEvent.eventEmitter.emit('transaction', hash);
        }).then(mined => {
            promiEvent.eventEmitter.emit('mined', mined);
            promiEvent.resolve(encryptedSecret);
        }).catch(error => {
            promiEvent.reject(error);
        });
    });
    return promiEvent.eventEmitter;
}


/**
 * Add another public key to access list
 *
 * @method addKeyToAccessListForKey
 * @param {string} keyname keyname to give access
 * @param {string} key the publicKey of the 3rd party, not the wallet address
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.addKeyToAccessListForKey = function (keyname, key) {
    var promiEvent = Web3PromiEvent();

    this.getIdsForKey(keyname).then(ids => {
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];

            this.getSecret(id).then(secret => {
                //reencrypt secret
                var plaintextSecret = crypto.ethDecrypt(secret, this.privateKey);
                var encryptedSecret = crypto.ethEncrypt(plaintextSecret, '0x' + key);

                //get raw transaction
                this.getTx("addAccess", id, utils.publicToAddress(key), secret).then(tx => {
                    promiEvent.eventEmitter.emit('transactionRaw', tx);

                    this.send(tx).once('transactionHash', function (hash) {
                        promiEvent.eventEmitter.emit('transaction', hash);
                    }).then(mined => {
                        promiEvent.eventEmitter.emit('mined', mined);
                        promiEvent.resolve(encryptedSecret);
                    }).catch(error => {
                        promiEvent.reject(error);
                    });
                });
            }).catch(error => {
                promiEvent.reject(error);
            });
        }

    });



    return promiEvent.eventEmitter;
}



StorageManager.prototype.send = function (tx) {
    //sign transaction
    var signedTx = utils.signTransaction(tx, this.privateKey);
    var signedHex = '0x' + signedTx.toString('hex');

    //broadcast
    return this.web3.eth.sendSignedTransaction(signedHex);
}


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
StorageManager.prototype.set = function (data, key = "_default_", category = "", metadata = "", replicationMode = 1, pricacyLevel = 1, duration = 30, deposit = 0) {

    var promiEvent = Web3PromiEvent();

    var dataObject = this.prepareData(data);
    promiEvent.eventEmitter.emit('encrypted', dataObject);


    let prom = deposit > 0 ? this.deposit(deposit) : Promise.resolve(true);
    Promise.all([prom, this.getDepositBalance(this.sender), this.getStorageCosts(dataObject.encryptedData.length, duration)]).then(args => {

        if (parseInt(args[1]) < parseInt(args[2])) throw Error('insufficient balance, please make a deposit first');

        this.getTx("set", dataObject.id, dataObject.merkle, key, dataObject.encryptedData.length, duration, replicationMode, pricacyLevel, dataObject.encryptedSecret).then(tx => {

            promiEvent.eventEmitter.emit('transactionRaw', tx);

            this.send(tx).once('transactionHash', function (hash) {
                promiEvent.eventEmitter.emit('transaction', hash);
            }).then(mined => {
                promiEvent.eventEmitter.emit('mined', mined);
                //wait until node syced
                return new Promise(function (resolve) {
                    setTimeout(resolve.bind(null, true), 3000)
                });
            }).then(synced => {
                let msg = new Date().getTime().toString();
                var signedMessage = this.sign(utils.hash(msg));

                let postParams = {
                    id: dataObject.id,
                    signature: signedMessage.message + "#" + signedMessage.signature,
                    data: dataObject.encryptedData,
                    msg: msg,
                    category: category,
                    metadata: metadata,
                    replicationMode: replicationMode,
                    duration: duration,
                    privacy: pricacyLevel,
                    key: key

                };

                let postParamsString = serialize(postParams);
                let endpoint = this.endpoint;

                return postData(this.endpoint, postParamsString.substr(1));
            }).then(result => {
                promiEvent.resolve(result);
            });
        });
    }).catch(error => {
        promiEvent.reject(error);
    })

    return promiEvent.eventEmitter;
}




/* get transactions */
StorageManager.prototype.getTx = function (method, ...args) {
    return this.getNonce().then(nonce => {

        //nonce fix
        if (nonce <= this.lastNonce) {
            nonce = this.lastNonce + 1;
        }

        var rawTransaction = {
            "to": settings.contracts.storageAddress,
            "from": this.sender,
            "nonce": this.web3.utils.toHex(nonce),
            "gasPrice": Web3.utils.toHex(9000000000),
            "gasLimit": Web3.utils.toHex(600000),
            "chainID": Web3.utils.toHex(settings.network.network_id)
        };

        this.lastNonce = nonce;

        switch (method) {
            case "set":
                rawTransaction.data = this.storageContract.methods.setStorage(
                    args[0],
                    args[1],
                    this.web3.utils.toHex(args[2]),
                    args[3],
                    args[4],
                    args[5],
                    args[6],
                    args[7]
                ).encodeABI();
                break;
            case "delete":
                rawTransaction.data = this.storageContract.methods.removeDataItem(
                    args[0]
                ).encodeABI();
                break;
            case "deleteKey":
                rawTransaction.data = this.storageContract.methods.removeKey(
                    this.web3.utils.toHex(args[0])
                ).encodeABI();
                break;
            case "addAccess":
                rawTransaction.data = this.storageContract.methods.addAccess(
                    args[0],
                    args[1],
                    this.web3.utils.toHex(args[2])
                ).encodeABI();
                break;
            case "removeAccess":
                rawTransaction.data = this.storageContract.methods.removeStorageAccessKey(
                    args[0],
                    args[1],
                    this.web3.utils.toHex(args[2])
                ).encodeABI();
                break;
            case "deposit":
                rawTransaction.data = this.storageContract.methods.deposit().encodeABI();
                rawTransaction.value = this.web3.utils.toHex(this.web3.utils.toWei(args[0].toString()));
                break;
            case "withdrawal":
                rawTransaction.data = this.storageContract.methods.withdrawal(this.web3.utils.toWei(args[0].toString())).encodeABI();
                break;
            default:
        };
        return rawTransaction;
    });
}


/**
 * Deposit money to storage space
 *
 * @method deposit
 * @param {amount} amount amount in DATCoins to send
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.deposit = function (amount) {
    var promiEvent = Web3PromiEvent();
    //get raw transaction
    this.getTx("deposit", amount).then(tx => {
        promiEvent.eventEmitter.emit('transactionRaw', tx);

        this.send(tx).once('transactionHash', function (hash) {
            promiEvent.eventEmitter.emit('transaction', hash);
        }).then(mined => {
            promiEvent.eventEmitter.emit('mined', mined);
            promiEvent.resolve(this.sender, amount);
        }).catch(error => {
            promiEvent.reject(error);
        });
    })

    return promiEvent.eventEmitter;
};



/**
 * Withdrawal money from storage space
 *
 * @method withdrawal
 * @param {amount} amount amount in DATCoins to send
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.withdrawal = function (amount) {
    var promiEvent = Web3PromiEvent();
    //get raw transaction
    this.getTx("withdrawal", amount).then(tx => {
        promiEvent.eventEmitter.emit('transactionRaw', tx);

        this.send(tx).once('transactionHash', function (hash) {
            promiEvent.eventEmitter.emit('transaction', hash);
        }).then(mined => {
            promiEvent.eventEmitter.emit('mined', mined);
            promiEvent.resolve(amount);
        }).catch(error => {
            promiEvent.reject(error);
        });
    });

    return promiEvent.eventEmitter;
};



function postData(endpoint, bodyContent) {
    return new Promise((resolve, reject) => {
        request.post({
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            url: endpoint + '/v1/storage/store',
            body: bodyContent
        }, function (error, response, body) {
            if (error) {
                reject('Error uploading data :' + error.message);
            } else {
                resolve(response.body);
            }
        });
    });
}


/**
 * Download Data to storage node
 *
 * @method get
 * @param {id} id id of data to download
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.get = function (id) {
    return new Promise((resolve, reject) => {
        try {
            let msg = new Date().getTime().toString();
            var signedMessage = this.sign(utils.hash(msg));

            this.getSecret(id).then(secret => {
                if (secret == null) {
                    reject('Access denied');
                }
                var plaintextSecret = crypto.ethDecrypt(secret, this.privateKey);

                request.post({
                    headers: { 'content-type': 'application/x-www-form-urlencoded' },
                    url: this.endpoint + '/v1/storage/download',
                    body: "id=" + id + "&signature=" + signedMessage.message + "#" + signedMessage.signature + "&msg=" + msg
                }, function (error, response, body) {
                    if (error) {
                        reject('Error downlading data :' + error.message);
                    } else {


                        if (response.statusCode == 404) {
                            reject('Not found!');
                        }

                        if (response.statusCode == 403) {
                            reject('Access denied!');
                        }

                        var ret = Base64.decode(response.body);
                        if (ret == typeof object) {
                            ret = JSON.parse(ret);
                        }

                        var decrypted = crypto.decrypt(ret, plaintextSecret);
                        resolve(Base64.decode(decrypted));
                    }
                });
            });
        } catch (error) {
            reject('Error hashing and signing data :' + error.message);
        }
    })

};


/**
 * Download Data from storage node with given key
 *
 * @method getWithKey
 * @param {string} key the name of the the datda
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.getWithKey = function (key) {
    return new Promise((resolve, reject) => {

        let msg = new Date().getTime().toString();
        var signedMessage = this.sign(utils.hash(msg));

        //get id from key name
        this.getIdForKey(key).then(id => {
            return this.getSecret(id).then(secret => {
                if (secret == null) {
                    reject('Access denied');
                }
                var plaintextSecret = crypto.ethDecrypt(secret, this.privateKey);

                request.post({
                    headers: { 'content-type': 'application/x-www-form-urlencoded' },
                    url: this.endpoint + '/v1/storage/download',
                    body: "id=" + id + "&signature=" + signedMessage.message + "#" + signedMessage.signature + "&msg=" + msg
                }, function (error, response, body) {
                    if (error) {
                        reject('Error downlading data :' + error.message);
                    } else {

                        if (response.statusCode == 404) {
                            reject('Not found!');
                        }

                        if (response.statusCode == 403) {
                            reject('Access denied!');
                        }

                        var ret = Base64.decode(response.body);
                        if (ret == typeof object) {
                            ret = JSON.parse(ret);
                        }

                        var decrypted = crypto.decrypt(ret, plaintextSecret);
                        resolve(Base64.decode(decrypted));
                    }
                });
            });
        }).catch(error => {
            reject('Error :' + error.message);
        });
    });
}



/**
 * Add another public key to access list for this given data hash
 *
 * @method addKeyToAccessList
 * @param {string} id hash of the data
 * @param {string} key public key address to add to
 * @return {promise} promise 
 */
StorageManager.prototype.addPublicKeyForData = function (id) {

};




/**
 * Delete Data from storage node
 *
 * @method delete
 * @param {id} id id of data to delete
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.delete = function (id) {

    var promiEvent = Web3PromiEvent();

    //get raw transaction
    this.getTx("delete", id).then(tx => {
        promiEvent.eventEmitter.emit('transactionRaw', tx);
        this.send(tx).once('transactionHash', function (hash) {
            promiEvent.eventEmitter.emit('transaction', hash);
        }).then(mined => {
            promiEvent.eventEmitter.emit('mined', mined);

            let msg = new Date().getTime().toString();
            var signedMessage = this.sign(msg);

            request.post({
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                url: this.endpoint + '/v1/storage/delete',
                body: "id=" + id + "&signature=" + signedMessage.message + "#" + signedMessage.signature + "&msg=" + msg
            }, function (error, response, body) {
                if (error) {
                    promiEvent.reject('Error deleting data :' + error.message);
                } else {
                    promiEvent.resolve(response.body);
                }
            });

        })
            .catch(error => {
                promiEvent.reject('Cant delete item. Already deleted ?');
            })
    })
        .catch(error => {
            promiEvent.reject(error);
        })


    return promiEvent.eventEmitter;
};


/**
 * Delete Data to storage node by given keyname
 *
 * @method deletByKey
 * @param {string} key keyname of the data
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.deleteByKey = function (key) {
    var promiEvent = Web3PromiEvent();

    this.getIdsForKey(key).then(ids => {
        this.getTx("deleteKey", key).then(tx => {
            promiEvent.eventEmitter.emit('transactionRaw', tx);
            this.send(tx).once('transactionHash', function (hash) {
                promiEvent.eventEmitter.emit('transaction', hash);
            }).then(mined => {
                promiEvent.eventEmitter.emit('mined', mined);

                let msg = new Date().getTime().toString();
                var signedMessage = this.sign(msg);

                for (var i = 0; i < ids.length; i++) {
                    var id = ids[i];
                    request.post({
                        headers: { 'content-type': 'application/x-www-form-urlencoded' },
                        url: this.endpoint + '/v1/storage/delete',
                        body: "id=" + id + "&signature=" + signedMessage.message + "#" + signedMessage.signature + "&msg=" + msg
                    }, function (error, response, body) {
                        if (error) {
                            promiEvent.reject('Error deleting data :' + error.message);
                        } else {
                            promiEvent.resolve(response.body);
                        }
                    });
                }
            })
                .catch(error => {
                    console.log(error);
                    promiEvent.reject('Cant delete item. Already deleted ?');
                })
        })
            .catch(error => {
                promiEvent.reject(error);
            })

    });

    return promiEvent.eventEmitter;
};


StorageManager.prototype.sign = function (data) {
    if (!this.privateKey) {
        console.error('private key not set');
        return null;
    }

    return this.web3.eth.accounts.sign(data, this.privateKey);
};


/* admin, works only from owner  */
StorageManager.prototype.setStorageDepositAmount = function (amount) {
    return this.web3.getNonce()
        .then(nonce => {
            var rawTransaction = this.getNewRawTranscation(this.sender, nonce);
            var data = this.storageContract.methods.setStorageDepositAmount(amount).encodeABI();
            rawTransaction.data = data;
            rawTransaction.value = '0x0';

            //sign and broadcast transaction
            return this.sendTransaction(rawTransaction);

        });
};




/* local methods */
StorageManager.prototype.prepareData = function (data) {
    var dataString = (toType(data) == "string") ? Base64.encode(data) : toType(data) == "object" ? Base64.encode(JSON.stringify(data)) : data.toString("base64");
    var randomSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    var encryptedSecret = crypto.ethEncrypt(randomSecret, utils.privateToPublic(this.privateKey));
    var encryptedData = Base64.encode(crypto.encrypt(dataString, randomSecret));
    var id = utils.hash(encryptedData);
    var merkleObj = merkle.createMerkle(encryptedData);
    var encryptedSecretDeveloper = '';

    //if developerPublicKey is set, create encrypted secret for developer too
    if (this.developerPublicKey != '') {
        encryptedSecretDeveloper = crypto.ethEncrypt(randomSecret, '0x' + this.developerPublicKey);
    }

    return { id, encryptedSecret, encryptedSecretDeveloper, encryptedData, merkle: merkleObj.root };
};


function serialize(obj) {
    return '?' + Object.keys(obj).reduce(function (a, k) { a.push(k + '=' + encodeURIComponent(obj[k])); return a }, []).join('&')
}

function toType(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}




module.exports = StorageManager;