/*!
 * datum.js - Datum javascript API
 *
 * @license 
 * @see 
*/

var Web3Manager = require('./web3/web3manager');
var Web3RinkebyManager = require('./web3/web3RinkebyManager');
var StorageManager = require('./web3/storage');
var Settings = require('./web3/settings');
var utils = require('./utils/utils');
var crypto = require('./utils/crypto');
var version = require('./version.json');
var merkle = require('./utils/merkle');


function Datum (network, storage, privateKey) {
    this.settings = new Settings();
    this.web3 = new Web3Manager(network, privateKey);
    this.web3Rinkeby = new Web3RinkebyManager(this.settings.RinkebyHttpEndpoint, privateKey);
    this.storageManager = new StorageManager(this.web3, storage);
    this.network = network;
    this.storage = storage;
    this.version = {
        api: version.version
    };
}

Datum.prototype.setNamespace = function (namespace) {
    this.namespace = namespace;
};

Datum.prototype.setDeveloperKey = function (privateKey) {
    this.web3.setPrivateKey(privateKey);
    this.web3Rinkeby.setPrivateKey(privateKey);
};

Datum.prototype.sha3 = function(string, options) {
    return '0x' + sha3(string, options);
};

Datum.prototype.toDAT = function(amount) {
    return this.web3.web3.utils.fromWei(amount);
};


//Storage methods
Datum.prototype.getStorageCosts = function(size, duration) {
    return this.storageManager.getStorageCosts(size,duration);
};

Datum.prototype.transfer = function(amount) {
    return this.web3Rinkeby.transfer(amount);
};

Datum.prototype.deposit = function(amount) {
    return this.storageManager.deposit(amount);
};

Datum.prototype.prepareData = function(data) {
    return this.storageManager.prepareData(data);
};


/**
 * Init contract for new storage
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
Datum.prototype.initStorage = function(data, key, merkle, category, replicationMode, pricacyLevel, duration) {
    return this.storageManager.initStorage(data, key, merkle, category, replicationMode, pricacyLevel, duration);
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
Datum.prototype.setAndInit = function(data, key, merkle, category, replicationMode, pricacyLevel, duration) {
    return this.storageManager.setAndInit(data, key, merkle, category, replicationMode, pricacyLevel, duration);
}

Datum.prototype.set = function(data) {
    return this.storageManager.set(data);
};

Datum.prototype.setWithKey = function(data, key) {
    return this.storageManager.setWithKey(data, key);
};

Datum.prototype.getSecret = function(id) {
    return this.storageManager.getSecret(id);
}

Datum.prototype.get = function(id) {
    return this.storageManager.get(id);
};

Datum.prototype.getWithKey = function(key) {
    return this.storageManager.getWithKey(key);
};

Datum.prototype.addKeyToAccessList = function(id, key, secret) {
    return this.storageManager.addKeyToAccessList(id, key, secret);
};


Datum.prototype.remove = function(id) {
    return this.storageManager.delete(id);
};

Datum.prototype.events = function() {
    return this.storageManager.events;
};




Datum.prototype.createIdentity = utils.createIdentity;
Datum.prototype.hash = utils.hash;
Datum.prototype.merkle = merkle.createMerkle;
Datum.prototype.privateToPublic = utils.privateToPublic;

Datum.prototype.crypt = crypto;



//Datum.prototype.web3 = this.web3;
//Datum.prototype.storageManager = this.storageManager;


module.exports = Datum;