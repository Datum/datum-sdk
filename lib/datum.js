/*!
 * datum.js - Datum javascript API
 *
 * javascript api for datum blockchain
 * 
 * @license 
 * @see 
*/

var Web3Manager = require('./web3/web3Manager');
var Web3RinkebyManager = require('./web3/web3RinkebyManager');
var StorageManager = require('./web3/storage');
var Settings = require('./web3/settings');
var utils = require('./utils/utils');
var crypto = require('./utils/crypto');
var version = require('./version.json');
var merkle = require('./utils/merkle');


function Datum () {
    this.settings = new Settings();
    this.version = {
        api: version.version
    };
}


Datum.prototype.initialize = function (config) {
    if(config.network === undefined) config.network = "https://node-us-west.datum.org/api";
    if(config.storage === undefined) config.storage = "https://node-eu-west.datum.org/storage";

    this.web3 = new Web3Manager(config.network, config.privateKey);
    this.web3Rinkeby = new Web3RinkebyManager(this.settings.RinkebyHttpEndpoint, config.privateKey);
    this.storageManager = new StorageManager(this.web3, config.storage);
};

Datum.prototype.setNamespace = function (namespace) {
    this.namespace = namespace;
};

/**
 * Sets the developers private key 
 *
 * @method setDeveloperKey
 * @param {string} privateKey the private key 
 */
Datum.prototype.setDeveloperKey = function (privateKey) {
    this.web3.setPrivateKey(privateKey);
    this.web3Rinkeby.setPrivateKey(privateKey);
};


Datum.prototype.sha3 = function(string, options) {
    return '0x' + sha3(string, options);
};

/**
 * Convert Wei to DAT
 *
 * @method toDAT
 * @param {BigInteger} amount amount in wei
 * @return {int} amount in DAT
 */
Datum.prototype.toDAT = function(amount) {
    return this.web3.web3.utils.fromWei(amount);
};


/**
 * Caluclate the storage costs for given size and duration
 *
 * @method getStorageCosts
 * @param {int} size size of data in bytes
 * @param {int} duration duration to store data in days
 * @return {BigInteger} costs in wei
 */
Datum.prototype.getStorageCosts = function(size, duration) {
    return this.storageManager.getStorageCosts(size,duration);
};

/**
 * Transfer DAT's from Etherereum to datum blockchain
 *
 * @method transfer
 * @param {BigInteger} amount amount in wei to transfer
 * @return {Promise} 
 */
Datum.prototype.transfer = function(amount) {
    return this.web3Rinkeby.transfer(amount);
};

/**
 * Deposit DAT tokens to storage contract
 *
 * @method deposit
 * @param {int} amount amount in DAT to deposit
 * @return {Promise} 
 */
Datum.prototype.deposit = function(amount) {
    return this.storageManager.deposit(amount);
};


Datum.prototype.getIdsForKey = function (key) {
    return this.storageManager.getIdsForKey(key);
}

/**
 * Prepares the data for datum, creating randon secert, encrypting the data
 *
 * @method prepareData
 * @param {object} data data to prepare
 * @return {object} prepared data with hash, encryptedSecret and encryptedData
 */
Datum.prototype.prepareData = function(data) {
    return this.storageManager.prepareData(data);
};

/**
 * Updates a data object with new data, but using same encryption configuration
 *
 * @method updateData
 * @param {object} data existsing data object
 * @param {object} newData new data to import in existsing data object
 * @return {object} prepared data with hash, encryptedSecret and encryptedData
 */
Datum.prototype.updateData = function(data, newData) {
    return this.storageManager.updateData(data, newData);
};


/**
 * Init contract for new storage
 *
 * @method initStorage
 * @param {object} data data object with hash and crypted secret
 * @param {string} key optional key name for the data, can be empty
 * @param {string} category the category for the data
 * @param {int} replicationMode the active replication mode for the data, default 1
 * @param {int} pricacyLevel the pricacy level of the data, default 1
 * @param {int} duration amount of days the data should be stored
 * @param {string} secret encrypted secret for this data
 * @param {string} metadata the metadata for the data item
 * @return {promise} promise of web3 sendSignedTransaction
 */
Datum.prototype.initStorage = function(data, key, category, replicationMode, pricacyLevel, duration) {
    return this.storageManager.initStorage(data, key, category, replicationMode, pricacyLevel, duration);
};


/**
 * Upload Data to storage node and init contract in same turn
 *
 * @method setAndInit
 * @param {object} data data object with hash and crypted secret
 * @param {string} key optional key name for the data, can be empty
 * @param {string} category the category for the data
 * @param {int} replicationMode the active replication mode for the data, default 1
 * @param {int} pricacyLevel the pricacy level of the data, default 1
 * @param {int} duration amount of days the data should be stored
 * @param {string} secret encrypted secret for this data
 * @param {string} metadata the metadata for the data item
 * @return {promise} promise of web3 sendSignedTransaction
 */
Datum.prototype.setAndInit = function(data, key, category, replicationMode, pricacyLevel, duration) {
    return this.storageManager.setAndInit(data, key, category, replicationMode, pricacyLevel, duration);
}

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
Datum.prototype.set = function(data, key, category, metadata, replicationMode, pricacyLevel, duration, deposit) {
    return this.storageManager.set(data, key, category, metadata, replicationMode, pricacyLevel, duration, deposit);
};

/**
 * Gets the encrypted secret for given data hash
 *
 * @method getSecret
 * @param {string} id hash of the data
 * @return {promise} promise with encrypted secret or null of no access to data
 */
Datum.prototype.getSecret = function(id) {
    return this.storageManager.getSecret(id);
}


/**
 * Get/Download the data with given id
 *
 * @method get
 * @param {string} id hash of the data
 * @return {promise} promise with data already decrypted with private key if have access
 */
Datum.prototype.get = function(id) {
    return this.storageManager.get(id);
};

/**
 * Get/Download the data with given key name
 *
 * @method getWithKey
 * @param {string} key key name of the data
 * @return {promise} promise with data already decrypted with private key if have access
 */
Datum.prototype.getWithKey = function(key) {
    return this.storageManager.getWithKey(key);
};

/**
 * Add another public key to access list for this given data hash
 *
 * @method addKeyToAccessList
 * @param {string} id hash of the data
 * @param {string} key public key address to add to
 * @param {string} secret encrypted secret for public address
 * @return {promise} promise 
 */
Datum.prototype.addKeyToAccessList = function(id, key, secret) {
    return this.storageManager.addKeyToAccessList(id, key, secret);
};


/**
 * Remove some data from storage
 *
 * @method remove
 * @param {string} id hash of the data
 * @return {promise} promise 
 */
Datum.prototype.remove = function(id) {
    return this.storageManager.delete(id);
};

Datum.prototype.events = function() {
    return this.storageManager.events;
};




//STATIC METHODS

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
 * Creates a hash of given data
 *
 * @method hash
 * @param {object} data data to hash
 * @return {string} sha256 hash of the object
 */
Datum.hash = function(obj) {
    return utils.hash(obj);
} 

/**
 * Creates a merkle tree with the given data/object
 *
 * @method merkle
 * @param {object} data data create a merkle tree for
 * @return {object} merkle tree object
 */
Datum.merkle = merkle.createMerkle;


Datum.privateToPublic = utils.privateToPublic;

Datum.prototype.crypt = crypto;

module.exports = Datum;