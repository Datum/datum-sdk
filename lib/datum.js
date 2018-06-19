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

Datum.prototype.prepareData = function(data) {
    return this.storageManager.prepareData(data);
};

Datum.prototype.initStorage = function(data, key, merkle, category, replicationMode, pricacyLevel, duration) {
    return this.storageManager.initStorage(data, key, merkle, category, replicationMode, pricacyLevel, duration);
};

Datum.prototype.set = function(data) {
    return this.storageManager.set(data);
};

Datum.prototype.setWithKey = function(data, key) {
    return this.storageManager.set(data, key);
};

Datum.prototype.get = function(id) {
    return this.storageManager.get(id);
};

Datum.prototype.getWithKey = function(key) {
    return this.storageManager.getWithKey(key);
};


Datum.prototype.remove = function(id) {
    return this.storageManager.delete(id);
};


Datum.prototype.createIdentity = utils.createIdentity;
Datum.prototype.hash = utils.hash;
Datum.prototype.merkle = merkle.createMerkle;

Datum.prototype.crypt = crypto;


//Datum.prototype.web3 = this.web3;
//Datum.prototype.storageManager = this.storageManager;


module.exports = Datum;