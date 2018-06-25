const Settings = require('./settings');
const crypto = require('../utils/crypto');
const utils = require('../utils/utils');
const request = require('request');
const EventEmitter = require('events').EventEmitter;
const Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }





var StorageManager = function (web3, endpoint) {
    this.settings = new Settings();
    this.web3 = web3;
    this._events = new EventEmitter;
    this.endpoint = endpoint;
    this.storageCostsContract = new this.web3.web3.eth.Contract(this.settings.StorageCostsContractABI, this.settings.StorageCostsContractAddress);
    this.storageContract = new this.web3.web3.eth.Contract(this.settings.StorageContractABI, this.settings.StorageContractAddress);
    this.sender = web3.publicAddress;
    if (web3.privateKey !== undefined) {
        web3.getNonce().then(nonce => this.nonce = nonce);
    }
};


Object.defineProperty(StorageManager.prototype, 'events', {
    get: function () { return this._events; }
})



/**
 * Calculate storage costs based on size and storage duration
 *
 * @method getStorageCosts
 * @param {int} size size in bytes
 * @param {int} duration duration in days
 * @return {BigInt} costs in DATCoins (wei)
 */
StorageManager.prototype.getStorageCosts = function (size, duration) {
    return this.storageCostsContract.methods.getStorageCosts(size, duration)
        .call({ from: this.sender });
};

/**
 * Calculate traffic costs based on size and estimated downloads
 *
 * @method getStorageCosts
 * @param {int} size size in bytes
 * @param {int} downloads downloads excepted
 * @return {BigInt} costs in DATCoins (wei)
 */
StorageManager.prototype.getTrafficCosts = function (size, downloads) {
    return this.storageCostsContract.methods.getTrafficCosts(size, downloads)
        .call({ from: this.sender });
};


/**
 * Calculate traffic costs based on estimated volume
 *
 * @method getStorageCosts
 * @param {int} volume volume in GB estimated
 * @return {BigInt} costs in DATCoins (wei)
 */
StorageManager.prototype.getTrafficCostsGB = function (volume) {
    return this.storageCostsContract.methods.getTrafficCostsGB(volume)
        .call({ from: this.sender });
};



/**
 * Get data id for a given key
 *
 * @method getIdForKey
 * @param {string} keyname name of the key
 * @return {string} id of the data item if exists
 */
StorageManager.prototype.getIdForKey = function (keyname) {
    return this.storageContract.methods.getIdForKey(this.web3.utils.toHex(keyname))
        .call({ from: this.sender });
};


/**
 * Get list of public keys that have access to this item
 *
 * @method getKeysAccessList
 * @param {string} id if of the data tiem
 * @return {array} array of public keys that have access to this item
 */
StorageManager.prototype.getKeysAccessList = function (id) {
    return this.storageContract.methods.getAccessKeysForData(this.web3.utils.toHex(id))
        .call({ from: this.sender });
};

/**
 * Get the encrypted secret for a data tiem
 *
 * @method getSecret
 * @param {string} id if of the data item
 * @return {string} encrypted secret for data item
 */
StorageManager.prototype.getSecret = function (id) {
    return this.storageContract.methods.getEncryptedSecret(this.web3.web3.utils.toHex(id))
        .call({ from: this.sender });
};



/**
 * Check if given signature has access to data tiem
 *
 * @method canKeyAccessData
 * @param {string} id if of the data item
 * @param {object} signature signature object with (v,r,s) values included
 * @return {string} encrypted secret for data item
 */
StorageManager.prototype.canKeyAccessData = function (id) {
    return this.storageContract.methods.canKeyAccessData(
        this.web3.utils.toHex(id),
        this.web3.utils.toHex(signature.signature),
        v,
        this.web3.utils.toHex(signature.r),
        this.web3.utils.toHex(signature.s)
    )
        .call({ from: this.sender });
};


/**
 * Init a new storage item deal
 *
 * @method initStorage
 * @param {object} data data object with hash and crypted secret
 * @param {string} key optional key name for the data, can be empty
 * @param {string} merkleRoot the merkle root hash of the data
 * @param {string} category the category for the data
 * @param {int} replicationMode the active replication mode for the data, default 1
 * @param {int} pricacyLevel the pricacy level of the data, default 1
 * @param {int} duration amount of days the data should be stored
 * @param {string} secret encrypted secret for this data
 * @param {string} metadata the metadata for the data item
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.initStorage = function (data, key, category, replicationMode, pricacyLevel, duration, metadata) {
    if (metadata === undefined) metadata = '';

    var self = this;

    return this.web3.getNonce()
        .then(nonce => {
            //create trans
            var rawTransaction = this.getNewRawTranscation(this.sender, this.nonce, 9000000000, 600000);
            var dataTransactions = this.storageContract.methods.initStorage(
                data.id,
                this.web3.web3.utils.toHex(key),
                category,
                metadata,
                replicationMode,
                pricacyLevel,
                duration
            ).encodeABI();

            //set data
            rawTransaction.data = dataTransactions;
            rawTransaction.value = '0x0';

            //sign and broadcast transaction
            return this.sendTransaction(rawTransaction);

        });



};


/**
 * Sign and broadcast a transaction to network
 *
 * @method sendTransaction
 * @param {object} tx signed transaction
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.sendTransaction = function (tx) {
    var self = this;

    //fire event
    self._events.emit("beforeSignTransaction", tx);

    //sign transaction
    var signedSerializedTx = this.web3.signTransaction(tx);

    var signed = '0x' + signedSerializedTx.toString('hex');

    //fire event
    self._events.emit("afterSignTransaction", signed);

    return this.web3.web3.eth.sendSignedTransaction(signed)
        .on('transactionHash', function (hash) {
            self._events.emit("transactionHash", hash);
        })
        .on('receipt', function (receipt) {
            self._events.emit("receipt", receipt);
        })
        .on('confirmation', function (confirmationNumber, receipt) {
            self._events.emit("confirmation", confirmationNumber, receipt);
        })
};


/**
 * Add another public key to access list
 *
 * @method addKeyToAccessList
 * @param {string} id if of the data item
 * @param {string} key the public key of the 3rd party
 * @param {string} secret encrypted secret for 3rd party
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.addKeyToAccessList = function (id, key, secret) {
    return this.web3.getNonce()
        .then(nonce => {
            //create trans
            var rawTransaction = this.getNewRawTranscation(this.sender, nonce, 9000000000, 600000);
            var data = this.storageContract.methods.addStorageAccessKey(id, key, secret).encodeABI();
            rawTransaction.data = data;
            rawTransaction.value = '0x0';

            //sign and broadcast transaction
            return this.sendTransaction(rawTransaction);
        });
};



/**
 * Claim the storage rewards for a given item, called from storage node
 *
 * @method addKeyToAccessList
 * @param {string} id if of the data item
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.claimStorageReward = function (id, key, secret) {
    return this.web3.getNonce()
        .then(nonce => {
            //create trans
            var rawTransaction = this.getNewRawTranscation(this.sender, nonce);
            var data = this.storageContract.methods.claimStorageReward(this.web3.web3.utils.toHex(id)).encodeABI();
            rawTransaction.data = data;
            rawTransaction.value = '0x0';

            //sign and broadcast transaction
            return this.sendTransaction(rawTransaction);
        });
};


/**
 * Adds a storage proof from node to the contract
 *
 * @method addStorageProof
 * @param {string} id if of the data item
 * @param {object} signature signature object with (v,r,s) values included
 * @param {object} stats stats object where e.g. downloads are logged
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.addStorageProof = function (id, signature, stats) {
    return this.web3.getNonce()
        .then(nonce => {
            //create trans
            var rawTransaction = this.getNewRawTranscation(this.sender, nonce);
            var data = this.storageContract.methods.addStorageProof(
                this.web3.web3.utils.toHex(id),
                this.web3.web3.utils.toHex(signature.signature),
                this.web3.web3.utils.toHex(signature.v),
                this.web3.web3.utils.toHex(signature.r),
                this.web3.web3.utils.toHex(signature.s),
                stats.downloaded
            ).encodeABI();

            rawTransaction.data = data;
            rawTransaction.value = '0x0';

            //sign and broadcast transaction
            return this.sendTransaction(rawTransaction);
        });
};


/**
 * Deposit money to storage space
 *
 * @method deposit
 * @param {amount} amount amount in DATCoins to send
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.deposit = function (amount) {
    return this.web3.getNonce()
        .then(nonce => {
            //create trans
            var rawTransaction = this.getNewRawTranscation(this.sender, nonce);
            var data = this.storageContract.methods.deposit().encodeABI();
            rawTransaction.data = data;
            rawTransaction.value = this.web3.web3.utils.toHex(this.web3.web3.utils.toWei(amount.toString()));

            //sign and broadcast transaction
            return this.sendTransaction(rawTransaction);
        });
};


/**
 * Get new empty transaction
 *
 * @method getNewRawTranscation
 */
StorageManager.prototype.getNewRawTranscation = function (from, nonce, gasPrice = 9000000000, gasLimit = 90000) {
    console.log(this.nonce);

    var tx = {
        "to": this.settings.StorageContractAddress,
        "from": from,
        "nonce": this.web3.web3.utils.toHex(this.nonce),
        "gasPrice": this.web3.web3.utils.toHex(gasPrice),
        "gasLimit": this.web3.web3.utils.toHex(gasLimit),
        "chainID": this.web3.web3.utils.toHex(this.settings.NetworkId)
    };

    this.nonce = this.nonce + 1;

    return tx;

};





/**
 * Upload Data to storage node and init contract in same turn
 *
 * @method setAndInit
 * @param {object} data data object with hash and crypted secret
 * @param {string} key optional key name for the data, can be empty
 * @param {string} merkleRoot the merkle root hash of the data
 * @param {string} category the category for the data
 * @param {int} replicationMode the active replication mode for the data, default 1
 * @param {int} pricacyLevel the pricacy level of the data, default 1
 * @param {int} duration amount of days the data should be stored
 * @param {string} secret encrypted secret for this data
 * @param {string} metadata the metadata for the data item
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.setAndInit = function (data, key, merkle, category, replicationMode, pricacyLevel, duration) {
    var self = this;

    return new Promise((resolve, reject) => {
        try {

            return this.initStorage(data, key, merkle, category, replicationMode, pricacyLevel, duration)
                .then(tx => {
                    self._events.emit("storageDone");
                    return this.addKeyToAccessList(data.id, utils.privateToAddress(this.web3.privateKey), data.encryptedSecret);
                })
                .then(tx => {
                    self._events.emit("accessListDone");
                    let msg = new Date().getTime().toString();
                    var signedMessage = this.web3.sign(utils.hash(msg));

                    request.post({
                        headers: { 'content-type': 'application/x-www-form-urlencoded' },
                        url: this.endpoint + '/v1/storage/store',
                        body: "id=" + data.id + "&signature=" + signedMessage.message + "#" + signedMessage.signature + "&data=" + data.encryptedData + "&msg=" + msg
                    }, function (error, response, body) {
                        if (error) {
                            reject('Error uploading data :' + error.message);
                        } else {
                            resolve(response.body);
                        }
                    });
                })
                .catch(error => {
                    reject('Error init storage:' + error.message);
                })
        } catch (error) {
            reject('Error hashing and signing data :' + error.message);
        }
    })

};




/**
 * Upload Data to storage node
 *
 * @method set
 * @param {object} data data object with id / secret / crypted data
 * @param {string} key the key name used for this data
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.set = function (data, key) {
    return new Promise((resolve, reject) => {
        try {

            let msg = new Date().getTime().toString();
            var signedMessage = this.web3.sign(utils.hash(msg));

            var id;
            if (key !== undefined) {
                //get id for given key from contractv
                var idList = this.getIdForKey(key);
                id = idList[idList.length - 1];
            } else {
                id = data.id;
            }

            this.addKeyToAccessList(data.id, utils.privateToAddress(this.web3.privateKey), data.encryptedSecret)
                .then(result => {
                    request.post({
                        headers: { 'content-type': 'application/x-www-form-urlencoded' },
                        url: this.endpoint + '/v1/storage/store',
                        body: "id=" + id + "&signature=" + signedMessage.message + "#" + signedMessage.signature + "&data=" + data.encryptedData + "&msg=" + msg // + "&metadata=" + metadata + "&category=" + category + "&duration=" + duration + "&replicationMode=" + replicationMode + "&privacy=" + pricacyLevel
                    }, function (error, response, body) {
                        if (error) {
                            reject('Error uploading data :' + error.message);
                        } else {
                            if (response.statusCode == 200) {
                                resolve(response.body);
                            } else {
                                reject(response.body);
                            }
                        }
                    });
                })
        } catch (error) {
            reject('Error hashing and signing data :' + error.message);
        }
    })

};


/**
 * Upload Data to storage node
 *
 * @method setWithKey
 * @param {object} data data object with id / secret / crypted data
  * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.setWithKey = function (data, key) {
    return new Promise((resolve, reject) => {
        try {

            var id;
            if (key != undefined) {
                //get id for given key from contractv
                var idList = this.getIdForKey(key);
                id = idList[idList.length - 1];
            } else {
                id = data.id;
            }

            let msg = new Date().getTime().toString();
            var signedMessage = this.web3.sign(msg);

            request.post({
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                url: this.endpoint + '/v1/storage/store',
                body: "id=" + id + "&signature=" + signedMessage.message + "#" + signedMessage.signature + "&data=" + data.encryptedData
            }, function (error, response, body) {
                if (error) {
                    reject('Error uploading data :' + error.message);
                } else {
                    resolve(response.body);
                }
            });
        } catch (error) {
            reject('Error hashing and signing data :' + error.message);
        }
    })

};





/**
 * Download Data to storage node
 *
 * @method get
 * @param {id} id id of data to download
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.get = function (id, key) {
    return new Promise((resolve, reject) => {
        try {
            let msg = new Date().getTime().toString();
            var signedMessage = this.web3.sign(utils.hash(msg));


            this.getSecret(id)
                .then(secret => {
                    if (secret == null) {
                        reject('Access denied');
                    }
                    var plaintextSecret = crypto.ethDecrypt(secret, this.web3.privateKey);

                    request.post({
                        headers: { 'content-type': 'application/x-www-form-urlencoded' },
                        url: this.endpoint + '/v1/storage/download',
                        body: "id=" + id + "&signature=" + signedMessage.message + "#" + signedMessage.signature + "&msg=" + msg
                    }, function (error, response, body) {
                        if (error) {
                            reject('Error downlading data :' + error.message);
                        } else {
                            var decrypted = crypto.decrypt(Base64.decode(response.body), plaintextSecret);
                            resolve(decrypted);
                        }
                    });
                })
                .catch(error => {
                    reject('Error :' + error.message);
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
        try {
            var id;
            if (key != undefined) {
                //get id for given key from contractv
                var idList = this.getIdForKey(key);
                id = idList[idList.length - 1];
            }

            let msg = new Date().getTime().toString();
            var signedMessage = this.web3.sign(msg);

            this.getSecret(id)
                .then(secret => {
                    var plaintextSecret = crypto.ethDecrypt(secret, this.web3.privateKey);

                    request.post({
                        headers: { 'content-type': 'application/x-www-form-urlencoded' },
                        url: this.endpoint + '/v1/storage/download',
                        body: "id=" + id + "&signature=" + signedMessage.message + "#" + signedMessage.signature + "&msg=" + msg
                    }, function (error, response, body) {
                        if (error) {
                            reject('Error downlading data :' + error.message);
                        } else {
                            //console.log(Base64.decode(response.body));
                            var decrypted = crypto.decrypt(Base64.decode(response.body), plaintextSecret);
                            resolve(decrypted);
                        }
                    });
                })
                .catch(error => {
                    reject('Error :' + error.message);
                });


        } catch (error) {
            reject('Error hashing and signing data :' + error.message);
        }
    })

};



/**
 * Delete Data to storage node
 *
 * @method delete
 * @param {id} id id of data to delete
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.delete = function (id) {
    return new Promise((resolve, reject) => {
        try {
            let msg = new Date().getTime().toString();
            var signedMessage = this.web3.sign(msg);

            request.post({
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                url: this.endpoint + '/v1/storage/remove',
                body: "id=" + id + "&signature=" + signedMessage.message + "#" + signedMessage.signature
            }, function (error, response, body) {
                if (error) {
                    reject('Error downlading data :' + error.message);
                } else {
                    resolve(response.body);
                }
            });
        } catch (error) {
            reject('Error hashing and signing data :' + error.message);
        }
    })

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
    var randomSecret = Math.random().toString(36).substr(0, 12);
    var encryptedSecret = crypto.ethEncrypt(randomSecret, utils.privateToPublic(this.web3.privateKey));
    var encryptedData = Base64.encode(crypto.encrypt(data, randomSecret));
    var id = utils.hash(encryptedData);

    return { id, encryptedSecret, encryptedData };
};

/* local methods */
StorageManager.prototype.updateData = function (data, newData) {

    var plaintextSecret = crypto.ethDecrypt(data.encryptedSecret, this.web3.privateKey);
    var encryptedSecret = crypto.ethEncrypt(plaintextSecret, utils.privateToPublic(this.web3.privateKey));
    var encryptedData = Base64.encode(crypto.encrypt(newData, plaintextSecret));
    return { id: data.id, encryptedSecret, encryptedData };
};



module.exports = StorageManager;