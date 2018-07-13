/*!
 * datum.js - Datum javascript API
 *
 * javascript api for datum blockchain
 * 
 * @license 
 * @see 
*/

var StorageManager = require('./web3/storage');
var settings = require('./web3/settings');
var utils = require('./utils/utils');
var crypto = require('./utils/crypto');
var version = require('./version.json');
var merkle = require('./utils/merkle');


//init static web3 manager
const Web3 = require('web3');
let web3Static = new Web3(new Web3.providers.HttpProvider("https://node-us-west.datum.org/api"));
let storageCostsContract = new web3Static.eth.Contract(settings.contracts.storageCostsABI, settings.contracts.storageCostsAddress);
let storageContract = new web3Static.eth.Contract(settings.contracts.storageABI, settings.contracts.storageAddress);
const Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }
const lightwallet = require('eth-lightwallet');
var signing = lightwallet.signing;

function Datum() {
    this.version = {
        api: version.version
    };
}


Datum.prototype.initialize = function (config) {
    if (config.network === undefined) config.network = "https://node-us-west.datum.org/api";
    if (config.storage === undefined) config.storage = "https://node-eu-west.datum.org/storage";
    if (config.developerPublicKey === undefined) config.developerPublicKey = "";

    this.storageManager = new StorageManager(config.network, config.storage, config.privateKey, config.developerPublicKey);
};


Datum.prototype.encryptNetwork = function (obj) {
    return this.storageManager.prepareData(obj);
}



/**
 * Deposit DAT tokens to storage contract
 *
 * @method deposit
 * @param {int} amount amount in DAT to deposit
 * @return {Promise} 
 */
Datum.prototype.deposit = function (amount) {
    return this.storageManager.deposit(amount);
};

/**
 * Withdrawal DAT tokens to storage contract
 *
 * @method withdrawal
 * @param {int} amount amount in DAT to withdraawal
 * @return {Promise} 
 */
Datum.prototype.withdrawal = function (amount) {
    return this.storageManager.withdrawal(amount);
};


/**
 * Set some data
 *
 * @method set
 * @param {object} data data you wanna store
 * @param {string} key optional key name for the data, can be empty
 * @param {string} category the category for the data
 * @param {string} metadata the metadata for the data item
 * @param {int} replicationMode the active replication mode for the data, default 1
 * @param {int} pricacyLevel the pricacy level of the data, default 1
 * @param {int} duration amount of days the data should be stored
 * @param {bool} deposit flag if deposit should be done with same transcation
 * @return {promise} promise of web3 sendSignedTransaction
 */
Datum.prototype.set = function (data, key, category, metadata, replicationMode, pricacyLevel, duration, deposit) {
    return this.storageManager.set(data, key, category, metadata, replicationMode, pricacyLevel, duration, deposit);
};

/**
 * Get/Download the data with given id
 *
 * @method get
 * @param {string} id hash of the data
 * @return {promise} promise with data already decrypted with private key if have access
 */
Datum.prototype.get = function (id) {
    return this.storageManager.get(id);
};

/**
 * Get/Download the data with given key name
 *
 * @method getWithKey
 * @param {string} key key name of the data
 * @return {promise} promise with data already decrypted with private key if have access
 */
Datum.prototype.getWithKey = function (key) {
    return this.storageManager.getWithKey(key);
};


/**
 * Get all items for given wallet address under given keyname
 *
 * @method getIdsForKey
 * @param {string} keyname key name to looup for
 * @return {Promise} Promise with balance in Wei
 */
Datum.prototype.getIdsForKey = function (key) {
    return this.storageManager.getIdsForKey(key);
};



/**
 * Add another public key to access list for this given data hash
 *
 * @method addPublicKeyForData
 * @param {string} id hash of the data
 * @param {string} key public key address to add to
 * @return {promise} promise 
 */
Datum.prototype.addPublicKeyForData = function (id, key) {
    return this.storageManager.addKeyToAccessList(id, key);
};


/**
 * Remove another public key to access list for this given data hash
 *
 * @method removePublicKeyForData
 * @param {string} id hash of the data
 * @param {string} key public key address to add to
 * @return {promise} promise 
 */
Datum.prototype.removePublicKeyForData = function (id, key) {
    return this.storageManager.removeKeyToAccessList(id, key);
};



/**
 * Add another public key to access list for this given key name
 *
 * @method addPublicKeyForDataByKey
 * @param {string} keyname key name of data
 * @param {string} key public key address to add to
 * @return {promise} promise 
 */
Datum.prototype.addPublicKeyForDataByKey = function (keyname, key) {
    return this.storageManager.addKeyToAccessListForKey(keyname, key);
}

/**
 * Remove some data from storage
 *
 * @method remove
 * @param {string} id hash of the data
 * @return {promise} promise 
 */
Datum.prototype.remove = function (id) {
    return this.storageManager.delete(id);
};

/**
 * Remove some data from storage
 *
 * @method removeByKey
 * @param {string} key keyname
 * @return {promise} promise 
 */
Datum.prototype.removeByKey = function (key) {
    return this.storageManager.deleteByKey(key);
};






//STATIC METHODS, no private key needed


/* START STORAGE COSTS */


/**
 * Calculate storage costs based on size and storage duration
 *
 * @method getStorageCosts
 * @param {int} size size in bytes
 * @param {int} duration duration in days
 * @return {BigInt} costs in DATCoins (wei)
 */
Datum.getStorageCosts = function (size, duration) {
    return storageCostsContract.methods.getStorageCosts(size, duration)
        .call({ from: this.sender });
};


/**
 * Calculate traffic costs based on estimated volume
 *
 * @method getTrafficCostsGB
 * @param {int} volume volume in GB estimated
 * @return {BigInt} costs in DATCoins (wei)
 */
Datum.getTrafficCostsGB = function (volume) {
    return storageCostsContract.methods.getTrafficCostsGB(volume)
        .call({ from: this.sender });
};


/**
 * Calculate traffic costs based on size and estimated downloads
 *
 * @method getTrafficCosts
 * @param {int} size size in bytes
 * @param {int} downloads downloads excepted
 * @return {BigInt} costs in DATCoins (wei)
 */
Datum.getTrafficCosts = function (size, downloads) {
    return storageCostsContract.methods.getTrafficCosts(size, downloads)
        .call({ from: this.sender });
};



/* END STORAGE COSTS */

/**
 * Creates a new basic identity with a address, private/public key pair
 *
 * @method createIdentity
 * @return {object} object with a address, private/public key pair
 */
Datum.createIdentity = function () {
    return utils.createIdentity();
};


/**
 * Get the Balance for given address in Datum Network
 *
 * @method getBalance
 * @param {string} wallet wallet address
 * @return {Promise} Promise with balance in Wei
 */
Datum.getBalance = function (wallet, toDat = false) {
    return web3Static.eth.getBalance(wallet).then(balance => {
        return toDat ? web3Static.utils.fromWei(balance) : balance;
    });
}

/**
 * Get the locked balance in contract for the given address in Datum Network
 *
 * @method getLockedBalance
 * @param {string} wallet wallet address
 * @return {Promise} Promise with balance in Wei
 */
Datum.getLockedBalanceForId = function (wallet, id) {
    return storageContract.methods.getLockedBalanceForId(wallet, id)
        .call({ from: this.sender });
}

/**
 * Get the locked balance in contract for the given address in Datum Network
 *
 * @method getLockedBalance
 * @param {string} wallet wallet address
 * @return {Promise} Promise with balance in Wei
 */
Datum.getLockedBalance = function (wallet) {
    return storageContract.methods.getTotalLockedBalance(wallet)
        .call({ from: this.sender });
}

/**
 * Get the deposited balance in contract for the given address in Datum Network
 *
 * @method getDepositBalance
 * @param {string} wallet wallet address
 * @return {Promise} Promise with balance in Wei
 */
Datum.getDepositBalance = function (wallet, toDat = false) {
    return storageContract.methods.getDepositBalance(wallet)
        .call({ from: this.sender })
        .then(balance => {
            return toDat ? web3Static.utils.fromWei(balance) : balance;
        });
}

/**
 * Get all items for given wallet address
 *
 * @method getIds
 * @param {string} wallet wallet address
 * @return {Promise} Promise with balance in Wei
 */
Datum.getIds = function (wallet) {
    return storageContract.methods.getIdsForAccount(wallet)
        .call({ from: this.sender });
}


/**
 * Get all items for given wallet address under given keyname
 *
 * @method getLastIdForKey
 * @param {string} wallet wallet address
 * @param {string} keyname key name to looup for
 * @return {Promise} Promise with balance in Wei
 */
Datum.getLastIdForKey = function (wallet, keyname) {
    return storageContract.methods.getActualIdForKey(wallet, web3Static.toHex(keyname))
        .call({ from: this.sender });
}

/**
 * Get all items for given wallet address under given keyname
 *
 * @method getIdsForKey
 * @param {string} wallet wallet address
 * @param {string} keyname key name to looup for
 * @return {Promise} Promise with balance in Wei
 */
Datum.getIdsForKey = function (wallet, keyname) {
    return storageContract.methods.getIdsForAccountByKey(wallet, web3Static.utils.toHex(keyname))
        .call({ from: this.sender });
}


/**
 * Get the encrypted secret for a data item
 *
 * @method getSecret
 * @param {string} id if of the data item
 * @return {string} encrypted secret for data item
 */
Datum.getSecret = function (id) {
    return storageContract.methods.getEncryptedSecret(web3Static.toHex(id))
        .call({ from: this.sender });
};


/**
 * Get count of all storage items in the contract
 *
 * @method totalItemsCount
 * @return {int} number of storage items in the contract
 */
Datum.totalItemsCount = function () {
    return storageContract.methods.getStorageItemCount()
        .call({ from: this.sender });
};


/**
 * Get the item with given hash
 *
 * @method getItem
 * @param {string} hash hash/if of item
 * @return {Promise} Promise with data item object that stored in blockchain
 */
Datum.getItem = function (hash) {
    return storageContract.methods.getItemForId(hash)
        .call({ from: this.sender });
}


/**
 * Check if given address has access to item
 *
 * @method canAccess
 * @param {string} id if of the data item
 * @param {string} address wallet address
 * @return {bool} true|false
 */
Datum.canAccess = function (id, address) {
    return storageContract.methods.canKeyAccessData(id, address)
        .call({ from: this.sender });
};


Datum.merkle = function (obj) {
    return merkle.createMerkle(obj)
}

Datum.encrypt = function (data, password, authData = "________should_be_signer_address__________") {
    var dataString = (toType(data) == "object") ? Base64.encode(JSON.stringify(data)) : Base64.encode(data);
    return Base64.encode(crypto.encrypt(dataString, password, authData));
}

Datum.decrypt = function (obj, password, authData = "________should_be_signer_address__________") {
    var result = crypto.decrypt(Base64.decode(obj), password, authData);
    var ret = Base64.decode(result);
    if (ret == typeof object) {
        ret = JSON.parse(ret);
    }
    return ret;
}

Datum.encryptWithPublicKey = function (data, publicKey) {
    var dataString = (toType(data) == "object") ? JSON.stringify(data) : data;
    if (publicKey.length > 2 && publicKey.substr(0, 2) != '0x') {
        publicKey = '0x' + publicKey;
    }
    return crypto.ethEncrypt(dataString, publicKey);
}

Datum.decryptWithPrivateKey = function (obj, privateKey) {
    var result = crypto.ethDecrypt(obj, privateKey);
    return result;
}

Datum.creatVault = function (password, amount = 5) {
    return new Promise((resolve, reject) => {

        // generate a new BIP32 12-word seed
        var seed = lightwallet.keystore.generateRandomSeed();

        lightwallet.keystore.createVault(
            {
                hdPathString: "m/44'/60'/0'/0",
                seedPhrase: seed,
                password: password
            },
            function (err, keystore) {
                if (err) {
                    reject('Error creating vault:' + err.message);
                }

                lw = keystore
                lw.keyFromPassword(password, async function (e, k) {
                    keyFromPw = k

                    lw.generateNewAddress(keyFromPw, amount)
                    let acct = lw.getAddresses();

                    resolve({seed : seed, accounts: acct});
                });
            }
        );
    });
}

Datum.recoverVault = function (seed, amount = 5) {
    return new Promise((resolve, reject) => {


        let password = "123123123123";

        lightwallet.keystore.createVault(
            {
                hdPathString: "m/44'/60'/0'/0",
                seedPhrase: seed,
                password: password
            },
            function (err, keystore) {
                if (err) {
                    reject('Error creating vault:' + err.message);
                }

                lw = keystore
                lw.keyFromPassword(password, async function (e, k) {
                    keyFromPw = k

                    lw.generateNewAddress(keyFromPw, amount)
                    let acct = lw.getAddresses();

                    resolve({seed : seed, accounts: acct});
                });
            }
        );
    });
}

Datum.recoverVault = function (seed, amount = 5) {
    return new Promise((resolve, reject) => {


        let password = "123123123123";

        lightwallet.keystore.createVault(
            {
                hdPathString: "m/44'/60'/0'/0",
                seedPhrase: seed,
                password: password
            },
            function (err, keystore) {
                if (err) {
                    reject('Error creating vault:' + err.message);
                }

                lw = keystore
                lw.keyFromPassword(password, async function (e, k) {
                    keyFromPw = k

                    lw.generateNewAddress(keyFromPw, amount)
                    let acct = lw.getAddresses();

                    resolve({seed : seed, accounts: acct});
                });
            }
        );
    });
}

var toType = function (obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

module.exports = Datum;