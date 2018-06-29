const Settings = require('./settings');
const crypto = require('../utils/crypto');
const utils = require('../utils/utils');
const request = require('request');
const EventEmitter = require('events').EventEmitter;
const Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }
const Web3PromiEvent = require('web3-core-promievent');


var StorageManager = function (web3, endpoint) {
    this.settings = new Settings();
    this.web3 = web3;
    this._events = new EventEmitter;
    this.endpoint = endpoint;
    this.lastNonce = -1;
    this.storageCostsContract = new this.web3.web3.eth.Contract(this.settings.StorageCostsContractABI, this.settings.StorageCostsContractAddress);
    this.storageContract = new this.web3.web3.eth.Contract(this.settings.StorageContractABI, this.settings.StorageContractAddress);
    this.sender = web3.publicAddress;
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
    return this.storageContract.methods.getActualIdForKey(this.web3.web3.utils.toHex(keyname))
        .call({ from: this.sender });
};


/**
 * Checks if the actual account can store data on network (if deposit is locked in contract)
 *
 * @method canStoreData
 * @return {bool} yes/no
 */
StorageManager.prototype.canStoreData = function () {
    return this.storageContract.methods.canStoreData()
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
 * Get count of all storage items in the contract
 *
 * @method getCount
 * @return {int} number of storage items in the contract
 */
StorageManager.prototype.getCount = function () {
    return this.storageContract.methods.getStorageItemCount()
        .call({ from: this.sender });
};


/**
 * Get locked amount of tokens in contract
 *
 * @method getCount
 * @return {BigInteger} amount of tokens locked in contract
 */
StorageManager.prototype.getLockedBalance = function () {
    return this.storageContract.methods.getLockedBalance()
        .call({ from: this.sender });
};

/**
 * Get list of all id's for given keyname 
 *
 * @method getIdsForKey
 * @param {string} key get array of all id's behind this key name for given account
 * @return {array} array with all id's behind this key name
 */
StorageManager.prototype.getIdsForKey = function (key) {
    return this.storageContract.methods.getIdsForKey(this.web3.web3.utils.toHex(key))
        .call({ from: this.sender });
};


/**
 * Get last id for given keyname 
 *
 * @method getLastIdForKey
 * @param {string} key get array of all id's behind this key name for given account
 * @return {bytes32} id of the data tiem
 */
StorageManager.prototype.getLastIdForKey = function (key) {
    return this.storageContract.methods.getLastIdForKey(this.web3.web3.utils.toHex(key))
        .call({ from: this.sender });
};


/**
 * Get all ids for senders account
 *
 * @method getIdsForAccount
 * @return {array} array with all id's for account
 */
StorageManager.prototype.getIdsForAccount = function () {
    return this.storageContract.methods.getIdsForAccount()
        .call({ from: this.sender });
};


/**
 * Get all ids in contract
 *
 * @method getIdsForAccount
 * @return {array} array with all id's
 */
StorageManager.prototype.getAllIds = function () {
    return this.storageContract.methods.getAllIds()
        .call({ from: this.sender });
};



/**
 * Get the storage item behind the id
 *
 * @method getItemForId
 * @return {object} storage item object
 */
StorageManager.prototype.getItemForId = function (id) {
    return this.storageContract.methods.getItemForId(id)
        .call({ from: this.sender });
};


/**
 * Get the storage item behind the id
 *
 * @method getItemForId
 * @param {string} wallet wallet address
 * @return {object} storage item object
 */
StorageManager.prototype.getItems = function (wallet) {
    return this.storageContract.methods.getIdsForAccount(wallet)
        .call({ from: this.sender });
};


/**
 * Get the storage item behind the id
 *
 * @method getItemsByKey
 * @param {string} wallet wallet address
 * @param {string} keyname key name to lookup for
 * @return {object} storage item object
 */
StorageManager.prototype.getItemsByKey = function (wallet, keyname) {
    return this.storageContract.methods.getIdsForAccountByKey(wallet, keyname)
        .call({ from: this.sender });
};


/**
 * Get the all storage items where the wallet has access to
 *
 * @method getAccessibleItems
 * @param {string} wallet wallet address
 * @return {object} storage item object
 */
StorageManager.prototype.getAccessibleItems = function (wallet) {
    return this.storageContract.methods.getAccessibleItems(wallet)
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
 * @param {string} metadata the metadata for the data item
 * @param {string} category the category for the data
 * @param {int} replicationMode the active replication mode for the data, default 1
 * @param {int} pricacyLevel the pricacy level of the data, default 1
 * @param {int} duration amount of days the data should be stored
 * @param {bool} deposit flag if a deposit should be done with initStorage
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.initStorage = function (data, key, category, metadata, replicationMode, pricacyLevel, duration, deposit) {
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

            //if deposit was set, add value to msg
            if (deposit) {
                rawTransaction.value = this.web3.web3.utils.toHex(this.web3.web3.utils.toWei('10', 'ether'));
            } else {
                rawTransaction.value = '0x0';
            }

            //sign and broadcast transaction
            return this.sendTransaction(rawTransaction);
        });
};


/**
 * Sign and broadcast a transaction to network
 *
 * @method sendTransaction
 * @param {object} tx transaction
 * @return {promise} promise of with addtional events
 */
StorageManager.prototype.sendTransaction = function (tx) {

    var promiEvent = Web3PromiEvent();

    this.web3.getNonce()
        .then(nonce => {

            if (nonce < this.lastNonce)
                nonce = this.lastNonce + 1;

            //set actual nonce
            tx.nonce = this.web3.web3.utils.toHex(nonce);

            //set last nonce
            this.lastNonce = nonce;

            //fire event
            promiEvent.eventEmitter.emit('beforeSigning', tx);

            //sign transaction
            var signedSerializedTx = this.web3.signTransaction(tx);
            var signed = '0x' + signedSerializedTx.toString('hex');

            //fire event
            promiEvent.eventEmitter.emit('afterSigning', signed);

            this.web3.web3.eth.sendSignedTransaction(signed)
                .on('transactionHash', function (hash) {
                    promiEvent.eventEmitter.emit('transactionHash', signed);
                })
                .on('receipt', function (receipt) {
                    promiEvent.eventEmitter.emit('receipt', receipt);
                })
                .on('confirmation', function (confirmationNumber, receipt) {
                    promiEvent.eventEmitter.emit('confirmation', confirmationNumber, receipt);
                })
                .then(mined => {
                    promiEvent.resolve(mined);
                });
        })

    return promiEvent.eventEmitter;
};


/**
 * Add another public key to access list
 *
 * @method addKeyToAccessList
 * @param {string} id if of the data item
 * @param {string} key the public address of the 3rd party
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
 * Add another public key to access list based on key name
 *
 * @method addPublicKeyForDataByKey
 * @param {string} key_name name of the key
 * @param {string} key the public address of the 3rd party
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.addPublicKeyForDataByKey = function (keyname, key) {
    return this.web3.getNonce()
        .then(nonce => {
            return this.getIdForKey(keyname);
        })
        .then(id => {
            return this.addPublicKeyForData(id, key);
        });
};

/**
 * Add another public key to access list
 *
 * @method addPublicKeyForData
 * @param {string} id if of the data item
 * @param {string} key the public address of the 3rd party
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.addPublicKeyForData = function (id, key) {
    return this.web3.getNonce()
        .then(nonce => {
            return this.getSecret(id)
                .then(secret => {
                    //recover secret
                    var plaintextSecret = crypto.ethDecrypt(secret, this.web3.privateKey);

                    //reencrypt for public key
                    var encryptedSecret = crypto.ethEncrypt(plaintextSecret, '0x' + key);

                    //create trans
                    var rawTransaction = this.getNewRawTranscation(this.sender, nonce, 9000000000, 600000);
                    var data = this.storageContract.methods.addStorageAccessKey(id, utils.publicToAddress(key), encryptedSecret).encodeABI();
                    rawTransaction.data = data;
                    rawTransaction.value = '0x0';

                    //sign and broadcast transaction
                    return this.sendTransaction(rawTransaction);
                });
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
 * Adds new data id to a given key
 *
 * @method addIdForKey
 * @param {string} id if of the data item
 * @param {string} key key name
 * @param {bool} clear clear history
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.addIdForKey = function (id, key, clear) {

    if (clear === undefined) clear = false;

    return this.web3.getNonce()
        .then(nonce => {
            //create trans
            var rawTransaction = this.getNewRawTranscation(this.sender, nonce);
            var data = this.storageContract.methods.setIdForKey(id, this.web3.web3.utils.toHex(key), clear).encodeABI();
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
    //create trans
    var rawTransaction = this.getNewRawTranscation(this.sender, this.nonce);
    var data = this.storageContract.methods.deposit().encodeABI();
    rawTransaction.data = data;
    rawTransaction.value = this.web3.web3.utils.toHex(this.web3.web3.utils.toWei(amount.toString()));

    //sign and broadcast transaction
    return this.sendTransaction(rawTransaction);
};


/**
 * Get new empty transaction
 *
 * @method getNewRawTranscation
 */
StorageManager.prototype.getNewRawTranscation = function (from, nonce, gasPrice = 9000000000, gasLimit = 90000) {

    var tx = {
        "to": this.settings.StorageContractAddress,
        "from": from,
        "gasPrice": this.web3.web3.utils.toHex(gasPrice),
        "gasLimit": this.web3.web3.utils.toHex(gasLimit),
        "chainID": this.web3.web3.utils.toHex(this.settings.NetworkId)
    };

    return tx;

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
 * @param {bool} deposit if the deposit should make in same transaction
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.set = function (data, key, category, metadata, replicationMode, pricacyLevel, duration, deposit) {
    var self = this;

    return new Promise((resolve, reject) => {
        try {

            //encrypt data with random secret, returns encrypted data with encrypted secret
            var dataObject = this.prepareData(data);

            return this.canStoreData()
                .then(canStore => {
                    if (!canStore && !deposit) {
                        reject('You have to make a deposit first, before storing any data or add flag to deposit');
                    } else {
                        return this.initStorage(dataObject, key, category, metadata, replicationMode, pricacyLevel, duration, deposit)
                            .then(tx => {
                                self._events.emit("storageInitialized");
                                return this.addKeyToAccessList(dataObject.id, utils.privateToAddress(this.web3.privateKey), dataObject.encryptedSecret);
                            })
                            .then(tx => {
                                if (this.web3.developerPublicKey == '') {
                                    return Promise.resolve(true);
                                } else {
                                    return this.addKeyToAccessList(dataObject.id, utils.publicToAddress(this.web3.developerPublicKey), dataObject.encryptedSecretDeveloper);
                                }
                            })
                            .then(ok => {
                                self._events.emit("accesssListAdded");

                                let msg = new Date().getTime().toString();
                                var signedMessage = this.web3.sign(utils.hash(msg));

                                request.post({
                                    headers: { 'content-type': 'application/x-www-form-urlencoded' },
                                    url: this.endpoint + '/v1/storage/store',
                                    body: "id=" + dataObject.id + "&signature=" + signedMessage.message + "#" + signedMessage.signature + "&data=" + dataObject.encryptedData + "&msg=" + msg
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
                    }
                })


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
StorageManager.prototype.get = function (id) {
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
            let msg = new Date().getTime().toString();
            var signedMessage = this.web3.sign(utils.hash(msg));

            //get id from key name
            this.getIdForKey(key)
                .then(id => {
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
                })




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



/**
 * Delete Data to storage node by given keyname
 *
 * @method deletByKey
 * @param {string} key keyname of the data
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.deleteByKey = function (key) {
    return new Promise((resolve, reject) => {
        try {

            this.getIdForKey(key)
                .then(id => {
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
    var encryptedSecretDeveloper = '';

    //if developerPublicKey is set, create encrypted secret for developer too
    if (this.web3.developerPublicKey != '') {
        encryptedSecretDeveloper = crypto.ethEncrypt(randomSecret, '0x' + this.web3.developerPublicKey);
    }

    return { id, encryptedSecret, encryptedSecretDeveloper, encryptedData };
};

/* local methods */
StorageManager.prototype.updateData = function (data, newData) {

    var plaintextSecret = crypto.ethDecrypt(data.encryptedSecret, this.web3.privateKey);
    var encryptedSecret = crypto.ethEncrypt(plaintextSecret, utils.privateToPublic(this.web3.privateKey));
    var encryptedData = Base64.encode(crypto.encrypt(newData, plaintextSecret));
    return { id: data.id, encryptedSecret, encryptedData };
};



module.exports = StorageManager;