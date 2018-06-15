const Settings = require('./settings');
const crypto = require('../utils/crypto');
const utils = require('../utils/utils');
const request = require('request');
const EventEmitter = require('events').EventEmitter;




var StorageManager = function (web3, endpoint) {
    this.settings = new Settings();
    this.web3 = web3;
    this._events = new EventEmitter;
    this.endpoint = endpoint;
    this.storageCostsContract = new this.web3.web3.eth.Contract(this.settings.StorageCostsContractABI, this.settings.StorageCostsContractAddress);
    this.storageContract = new this.web3.web3.eth.Contract(this.settings.StorageContractABI, this.settings.StorageContractAddress);
    this.sender = web3.publicAddress;
    web3.getNonce().then(nonce => this.nonce = nonce);
};


Object.defineProperty( StorageManager.prototype, 'events', {
    get:function(){ return this._events; }
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
    return this.storageContract.methods.getEncryptedSecret(this.web3.utils.toHex(id))
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
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.initStorage = function (data, key, merkle, category, replicationMode, pricacyLevel, duration) {
    return this.web3.getNonce()
    .then(nonce => {
        //create trans
        var rawTransaction = this.getNewRawTranscation(this.sender, this.nonce);
        var data = this.storageContract.methods.initStorage(
            this.web3.web3.utils.toHex(data.id), 
            this.web3.web3.utils.toHex(key), 
            this.web3.web3.utils.toHex(hash),
            category,
            replicationMode,
            pricacyLevel,
            duration,
            this.web3.web3.utils.toHex(data.encryptedSecret)
        ).encodeABI();

        rawTransaction.to = this.settings.StorageContractAddress;
        rawTransaction.data = data;
        rawTransaction.value = '0x0';

        var signedSerializedTx = this.web3.signTransaction(rawTransaction);

        //send transactions
        return this.web3.web3.eth.sendSignedTransaction('0x' + signedSerializedTx.toString('hex'));
      
    });
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
        var rawTransaction = this.getNewRawTranscation(this.sender, nonce);
        var data = this.storageContract.methods.addStorageAccessKey(this.web3.web3.utils.toHex(id), key, this.web3.web3.utils.toHex(secret)).encodeABI();
        rawTransaction.to = this.settings.StorageContractAddress;
        rawTransaction.data = data;
        rawTransaction.value = '0x0';

        var signedSerializedTx =this.web3.signTransaction(rawTransaction);

        //send transactions
        return this.web3.web3.eth.sendSignedTransaction('0x' + signedSerializedTx.toString('hex'));
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
        rawTransaction.to = this.settings.StorageContractAddress;
        rawTransaction.data = data;
        rawTransaction.value = '0x0';

        var signedSerializedTx =this.web3.signTransaction(rawTransaction);

        //send transactions
        return this.web3.web3.eth.sendSignedTransaction('0x' + signedSerializedTx.toString('hex'));
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

        rawTransaction.to = this.settings.StorageContractAddress;
        rawTransaction.data = data;
        rawTransaction.value = '0x0';

        var signedSerializedTx =this.web3.signTransaction(rawTransaction);

        //send transactions
        return this.web3.web3.eth.sendSignedTransaction('0x' + signedSerializedTx.toString('hex'));
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
        rawTransaction.to = this.settings.StorageContractAddress;
        rawTransaction.data = data;
        rawTransaction.value = this.web3.web3.utils.toHex(this.web3.web3.utils.toWei(amount));

        var signedSerializedTx =this.web3.signTransaction(rawTransaction);

        //send transactions
        return this.web3.web3.eth.sendSignedTransaction('0x' + signedSerializedTx.toString('hex'));
    });
};


/**
 * Get new empty transaction
 *
 * @method getNewRawTranscation
 */
StorageManager.prototype.getNewRawTranscation = function (from, nonce, gasPrice = 9000000000, gasLimit = 90000) {
    return {
        "from": from,
        "nonce": this.web3.web3.utils.toHex(nonce),
        "gasPrice": this.web3.web3.utils.toHex(gasPrice),
        "gasLimit": this.web3.web3.utils.toHex(gasLimit),
        "chainID": this.web3.web3.utils.toHex(this.settings.NetworkId)
    };
};





/**
 * Upload Data to storage node and init contract in same turn
 *
 * @method setAndInit
 * @param {object} data data object with id / secret / crypted data
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.setAndInit = function (data, key, merkle, category, replicationMode, pricacyLevel, duration) {
    return new Promise((resolve, reject) => {
        try
        {

            this.initStorage(data, key, merkle, category, replicationMode, pricacyLevel, duration)
            .then(tx => {
                let msg = new Date().getTime().toString();
                var signedMessage = this.web3.sign(msg);
    
                request.post({
                    headers: { 'content-type': 'application/x-www-form-urlencoded' },
                    url: this.endpoint + '/store',
                    body: "id=" + data.id + "&signature=" + signedMessage.message + "#" + signedMessage.signature + "&data=" + data.encryptedData
                }, function (error, response, body) {
                    if(error) {
                        reject('Error uploading data :' + error.message);
                    } else {
                        resolve(response.body);
                    }
                });
            })
            .catch(error => {
                reject('Error init storage:' + error.message);    
            })
        } catch(error) {
            reject('Error hashing and signing data :' + error.message);
        }
    })

};




/**
 * Upload Data to storage node
 *
 * @method set
 * @param {object} data data object with id / secret / crypted data
  * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.set = function (data) {
    return new Promise((resolve, reject) => {
        try
        {

            let msg = new Date().getTime().toString();
            var signedMessage = this.web3.sign(msg);

            request.post({
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                url: this.endpoint + '/store',
                body: "id=" + data.id + "&signature=" + signedMessage.message + "#" + signedMessage.signature + "&data=" + data.encryptedData
            }, function (error, response, body) {
                if(error) {
                    reject('Error uploading data :' + error.message);
                } else {
                    resolve(response.body);
                }
            });
        } catch(error) {
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
        try
        {

            var id ;
            if(key != undefined) {
                //get id for given key from contractv
                id = this.getIdForKey(key);
            }

            let msg = new Date().getTime().toString();
            var signedMessage = this.web3.sign(msg);

            request.post({
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                url: this.endpoint + '/store',
                body: "id=" + id + "&signature=" + signedMessage.message + "#" + signedMessage.signature + "&data=" + data.encryptedData
            }, function (error, response, body) {
                if(error) {
                    reject('Error uploading data :' + error.message);
                } else {
                    resolve(response.body);
                }
            });
        } catch(error) {
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
        try
        {
            let msg = new Date().getTime().toString();
            var signedMessage = this.web3.sign(msg);

            request.post({
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                url: this.endpoint + '/download',
                body: "id=" + id + "&signature=" + signedMessage.message + "#" + signedMessage.signature
            }, function (error, response, body) {
                if(error) {
                    reject('Error downlading data :' + error.message);
                } else {
                    resolve(response.body);
                }
            });
        } catch(error) {
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
        try
        {

            var id;

            if(key != undefined) {
                //get id for given key from contractv
                id = this.getIdForKey(key);
            }

            let msg = new Date().getTime().toString();
            var signedMessage = this.web3.sign(msg);

            request.post({
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                url: this.endpoint + '/download',
                body: "id=" + id + "&signature=" + signedMessage.message + "#" + signedMessage.signature
            }, function (error, response, body) {
                if(error) {
                    reject('Error downlading data :' + error.message);
                } else {
                    resolve(response.body);
                }
            });
        } catch(error) {
            reject('Error hashing and signing data :' + error.message);
        }
    })

};



/**
 * Delete Data to storage node
 *
 * @method deposit
 * @param {id} id id of data to delete
 * @return {promise} promise of web3 sendSignedTransaction
 */
StorageManager.prototype.delete = function (id) {
    return new Promise((resolve, reject) => {
        try
        {
            let msg = new Date().getTime().toString();
            var signedMessage = this.web3.sign(msg);

            request.post({
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                url: this.endpoint + '/remove',
                body: "id=" + id + "&signature=" + signedMessage.message + "#" + signedMessage.signature
            }, function (error, response, body) {
                if(error) {
                    reject('Error downlading data :' + error.message);
                } else {
                    resolve(response.body);
                }
            });
        } catch(error) {
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
        rawTransaction.to = this.settings.StorageContractAddress;
        rawTransaction.data = data;
        rawTransaction.value = '0x0';

        var signedSerializedTx =this.web3.signTransaction(rawTransaction);

        //send transactions
        return this.web3.web3.eth.sendSignedTransaction('0x' + signedSerializedTx.toString('hex'))
        
    });
};



/* local methods */
StorageManager.prototype.prepareData = function (data) {
    var randomSecret = Math.random().toString(36);
    var encryptedSecret = crypto.ethEncrypt(randomSecret, utils.privateToPublic(this.web3.privateKey));
    var encryptedData = crypto.encrypt(data, randomSecret);
    var id = utils.hash(data);

    return { id, encryptedSecret, encryptedData };
};



module.exports = StorageManager;