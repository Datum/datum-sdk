/*!
 * datum.js - Datum javascript API
 *
 * javascript api for datum blockchain
 * 
 * @license 
 * @see 
*/

var lightwallet = require('eth-lightwallet');
var signing = lightwallet.signing;


var Web3Provider = require('./web3/web3provider');
var StorageManager = require('./web3/storage');
var settings = require('./web3/settings');
var utils = require('./utils/utils');
var crypto = require('./utils/crypto');
var version = require('./version.json');
var merkle = require('./utils/merkle');
var DatumIdentity = require('./datumIdentity');
var TxDataProvider = require('./web3/txDataProvider.js')

const Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }
const fetch = require('node-fetch');



const Web3 = require('web3');
let web3Static = new Web3(new Web3.providers.HttpProvider("https://node-us-west.datum.org/api"));
let storageCostsContract = new web3Static.eth.Contract(settings.contracts.storageCostsABI, settings.contracts.storageCostsAddress);
let storageContract = new web3Static.eth.Contract(settings.contracts.storageABI, settings.contracts.storageAddress);
let claimsContract = new web3Static.eth.Contract(settings.contracts.registryContractABI, settings.contracts.registryContractAddress);


function Datum() {
    this.version = {
        api: version.version
    };
}


/**
 * Initialize the datum client given configuration
 *
 * @method initialize
 * @param {object} config configuration object with "network","storage","useFuelingServer"
 */
Datum.prototype.initialize = function (config) {
    if (config.network === undefined) config.network = "https://node-us-west.datum.org/api";
    if (config.storage === undefined) config.storage = "https://node-eu-west.datum.org/storage";
    if (config.defaultPublicKeys === undefined) config.defaultPublicKeys = [];

    if (config.useFuelingServer === false) {
        this.useFuelingServer = false
    } else {
        this.useFuelingServer = true
    }

    this.identity = new DatumIdentity(config.defaultPublicKeys);

    if (config.identity !== undefined) {
        this.identity.import(config.identity);
    }

    this.nodeSentMode = false;
    this.web3Manager = new Web3Provider(config.network, this.identity, config.useFuelingServer);
    this.storage = new StorageManager(config.network, config.storage);
};


//#region Identity

/**
 * Import a serialized keystore to identity instance
 *
 * @method importIdentity
 * @param {string} serialized_identity the serialized keystore that was exported 
 */
Datum.prototype.importIdentity = function (serialized_identity) {
    this.identity.import(serialized_identity);
}

/**
 * Export the actual keystore as serialized string
 *
 * @method exportIdentity
 * @return {string} the actual keystore serialized
 */
Datum.prototype.exportIdentity = function () {
    return this.identity.export();
}


/**
 * Set an DatumIdentity instance as actual identity 
 *
 * @method setIdentity
 * @param {DatumIdentity} Datum identity instance
 */
Datum.prototype.setIdentity = function (identity) {
    this.identity = identity;
}


/**
 * Create a new identity/keystore with given password, default 1 address is created in keystore
 *
 * @method createIdentity
 * @param {string} password password to encrypt the keystore
 * @param {number} addressCount [Optional] amount of address created, default = 1
 * @return {Promise} 
 */
Datum.prototype.createIdentity = function (password, addressCount = 1) {
    return this.identity.new(password, addressCount);
}


//return new instance
Datum.prototype.Identity = function() {
    return new DatumIdentity();
}

/**
 * Recover a keystore from given seed words
 *
 * @method recoverIdentity
 * @param {string} seed 12 seeds words from where the account was created
 * @param {string} password new password to encrypt the keystore
 * @param {number} addressCount [Optional] amount of address created, default = 1* 
 * @return {Promise} 
 */
Datum.prototype.recoverIdentity = function (seed, password, addressCount = 1) {
    return this.identity.recover(seed, password, addressCount);
}


/**
 * Gets the public key for given address index
 *
 * @method getIdentityPublicKey
 * @param {number} accountIndex address to use, default = 0
 * @return {Promise} 
 */
Datum.prototype.getIdentityPublicKey = function (accountIndex = 0) {
    return this.identity.getPublicKey(accountIndex);
}


/**
 * Get balance deposited in storage space for given address
 *
 * @method getDepositBalance
 * @param {address} address address to check balance for
 * @return {Promise} 
 */
Datum.prototype.getDepositBalance = function (address = null) {
    if (address == null) {
        address = this.identity.address;
    }

    if (address == null) return new Error("address must be provided or an identity must be set");

    return this.storage.getDepositBalance(address);
}


/**
 * Get Storage costs in DAT for given size and duration
 *
 * @method getStorageCosts
 * @param {number} size length of data in bytes
 * @param {number} duration expected duration to store the data in days
 * @return {Promise} 
 */
Datum.prototype.getStorageCosts = function (size, duration) {
    return this.storage.getStorageCosts(size, duration);
}




/**
 * Get last item for given key name
 *
 * @method getIdForKey
 * @param {string} keyname key name to looup for
 * @return {Promise} Promise with balance in Wei
 */
Datum.prototype.getIdForKey = function (keyname, address = null) {

    if (address == null) {
        address = this.identity.address;
    }

    return this.storage.getIdForKey(keyname, address);
}



/**
 * Get all items for given wallet address under given keyname
 *
 * @method getIdsForKey
 * @param {string} keyname key name to looup for
 * @return {Promise} Promise with balance in Wei
 */
Datum.prototype.getIdsForKey = function (keyname, address = null) {

    if (address == null) {
        address = this.identity.address;
    }

    return this.storage.getIdsForKey(keyname, address);
}



/**
 * Get the encrypted secret for a data item
 *
 * @method getSecret
 * @param {string} id if of the data item
 * @return {string} encrypted secret for data item
 */
Datum.prototype.getEncryptionForId = function (id) {
    return this.storage.getEncryptionForId(id).then(hexCoded => {
        return this.web3Manager.toUtf8(hexCoded);
    })
}

/**
 * Create a new network identy contract where user can passtrough all transaction, all transactions msg.sender will be proxy address!
 *
 * @method createProxyIdentity
 * @param {string} recovery [Optional] recovery address for identity, if not provided first address in keystore is taken
 * @return {Promise} 
 */
Datum.prototype.createProxyIdentity = function (recovery = null) {
    var data = TxDataProvider.getCreateNetworkIdentityData(this.identity.address, recovery == null ? this.identity.address : recovery);
    var to = settings.contracts.identityManagerAddress;
    return this.web3Manager.send(to, data).then(txReceipe => {
        if (txReceipe.status == true) {
            return this.identity.proxy = '0x' + txReceipe.logs[0].topics[1].substr(26);
        } else {
            return new Promise().reject('error creating identy contract');
        }
    })
}

//#endregion Identity

//#region Claims

/**
 * Add add claim to a user
 *
 * @method addClaim
 * @param {string} subject identity address to add the claim
 * @param {string} key the key value for the claim
 * @param {string} value value of the claim
 * @return {Promise} 
 */
Datum.prototype.addClaim = function (subject, key,  value, password = null) {
    var data = TxDataProvider.getAddClaimData(subject, key, value);
    var to = settings.contracts.registryContractAddress;
    return this.web3Manager.send(to, data);
}

/**
 * Removes a claim, can only be done from issuer or subject of the claim
 *
 * @method removeClaim
 * @param {string} issuer address/id of issuer
 * @param {string} subject identity address to add the claim
 * @return {Promise} 
 */
Datum.prototype.removeClaim = function (issuer, subject, password = null) {
    var data = TxDataProvider.getRemoveClaimData(issuer, subject);
    var to = settings.contracts.registryContractAddress;
    return this.web3Manager.send(to, data);
}



//#endregion Claims

//#region Storage


/**
 * Deposit DAT tokens to storage contract
 *
 * @method deposit
 * @param {int} amount amount in DAT to deposit
 * @return {Promise} 
 */
Datum.prototype.deposit = function (amount) {
    var data = TxDataProvider.getStorageDepositData(this.identity.address);
    var to = settings.contracts.storageAddress;
    return this.web3Manager.send(to, data, this.web3Manager.toWei(amount.toString()));
};


/**
 * Withdrawal DAT tokens to storage contract
 *
 * @method withdrawal
 * @param {int} amount amount in DAT to withdraawal
 * @return {Promise} 
 */
Datum.prototype.withdrawal = function (amount) {
    var data = TxDataProvider.getStorageWithdrawalData(this.identity.address, this.web3Manager.toWei(amount.toString()));
    var to = settings.contracts.storageAddress;
    return this.web3Manager.send(to, data);
};


Datum.prototype.set = function (data, key = "", category = "", metadata = "", replicationMode = 1, pricacyLevel = 1, duration = 30, deposit = 0,  publicKeysToAdd = []) {

    var dataString = (toType(data) == "string") ? Base64.encode(data) : toType(data) == "object" ? Base64.encode(JSON.stringify(data)) : data.toString("base64");
    var randomSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    return Promise.all([this.getDepositBalance(this.identity.address), this.getStorageCosts(dataString.length, duration)]).then(args => {
        if (parseInt(args[1]) < parseInt(args[2])) throw Error('insufficient balance, please make a deposit first');

        let encData = '';
        let merkleRoot = '';
        let size = 0;
        let id = '';

        return this.encryptDataForPublicKeys(dataString, publicKeysToAdd).then(enc => {
            encData = enc.symEncMessage;
            delete enc.symEncMessage;
            id = utils.hash(encData);
            var merkleObj = merkle.createMerkle(encData);
            merkleRoot = merkleObj.root;
            size = encData.length;
            let secret = JSON.stringify(enc);
            var data = TxDataProvider.getSetData(this.identity.address, id, merkleObj.root, key, size, duration, replicationMode, pricacyLevel, JSON.stringify(enc));
            var to = settings.contracts.storageAddress;
            if (!this.nodeSentMode) {
                return this.web3Manager.send(to, data, deposit);
            } else {
                return Promise.resolve(false);
            }
        }).then(nodeMode => {
            let msg = new Date().getTime().toString();
            return this.identity.signMsg(msg).then(signed => {
                let postParams = {
                    id: id,
                    v: signed.v.toString(16),
                    r: signed.r.toString('hex'),
                    s: signed.s.toString('hex'),
                    msg: msg,
                    data: encData,
                    category: category,
                    merkle: merkleRoot,
                    metadata: metadata,
                    replicationMode: replicationMode,
                    duration: duration,
                    privacy: pricacyLevel,
                    key: key
                };

                return this.storage.postStorageNode("/v1/storage/store", postParams);
            });
        })
    });
};


Datum.prototype.get = function (id) {
    let msg = new Date().getTime().toString();
    return this.identity.signMsg(msg).then(signed => {
        let postParams = {
            id: id,
            v: signed.v.toString(16),
            r: signed.r.toString('hex'),
            s: signed.s.toString('hex'),
            msg: msg
        };
        return this.storage.postStorageNode("/v1/storage/download", postParams)
    }).then(encrypedData => {
        return this.getEncryptionForId(id).then(enc => {
            let encObj = JSON.parse(enc);
            encObj.symEncMessage = encrypedData;
            return this.identity.decrypt(encObj);
        });
    }).then(base64Data => {
        return Base64.decode(base64Data);
    })
};




/**
 * Get/Download the data with given key name
 *
 * @method getWithKey
 * @param {string} key key name of the data
 * @return {promise} promise with data already decrypted with private key if have access
 */
Datum.prototype.getWithKey = function (key) {
    return this.getIdForKey(key).then(id => {
        return this.get(id);
    });
};


/**
 * Remove some data from storage
 *
 * @method remove
 * @param {string} id hash of the data
 * @return {promise} promise 
 */
Datum.prototype.remove = function (id) {
    var data = TxDataProvider.getRemoveData(this.identity.address, id);
    var to = settings.contracts.storageAddress;

    return this.web3Manager.send(to, data).then(done => {
        let msg = new Date().getTime().toString();
        return this.identity.signMsg(msg).then(signed => {
            let postParams = {
                id: id,
                v: signed.v.toString(16),
                r: signed.r.toString('hex'),
                s: signed.s.toString('hex'),
                msg: msg
            };
            return this.storage.postStorageNode("/v1/storage/delete", postParams)
        });
    })

};

/**
 * Remove some data from storage
 *
 * @method removeByKey
 * @param {string} key keyname
 * @return {promise} promise 
 */
Datum.prototype.removeByKey = function (key) {
    return this.getIdForKey(key).then(id => {
        return this.remove(id);
    });
};


//#endregion Storage

//#region encryption

Datum.prototype.encryptDataForPublicKeys = function (data, publicKeyArray, password = "", accountIndex = 0) {
    return this.identity.encrypt(data, publicKeyArray, password, accountIndex);
    /*
    .then(enc => {
        console.log(enc);
        return this.identity.decrypt(enc);
    })
    */
}

Datum.prototype.decryptData = function (enc, password = "", accountIndex = 0) {
    return this.identity.decrypt(enc, password, accountIndex);
}

//#endregion encryption

//#region static functions


/**
 * Create a new identity/keystore with given password, default 1 address is created in keystore
 *
 * @method createIdentity
 * @param {string} password password to encrypt the keystore
 * @param {number} addressCount [Optional] amount of address created, default = 1
 * @return {Promise} 
 */
Datum.createIdentity = function (password, addressCount = 1) {
    var d = new DatumIdentity();
    return d.new(password, addressCount).then(result => {
        return { seed : result.seed, keystore : d.export() };
    });
}

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

/**
 * get all claims behind this address, returns array with object (issuer, subject, key, value)
 *
 * @method getClaims
 * @param {string} address identity address to get the claims from
 * @return {Promise} 
 */
Datum.getClaims = function(address) {
    return claimsContract.getPastEvents('ClaimSet', {
        filter: {subject: address }, 
        fromBlock: 0,
        toBlock: 'latest'
    })
    .then(function(events){
        var e = [];
        events.forEach(event => {
            e.push({ 
                issuer: event.returnValues.issuer, 
                subject: event.returnValues.subject, 
                key : web3Static.utils.hexToUtf8(event.returnValues.key), 
                value : web3Static.utils.hexToUtf8(event.returnValues.value)
            });
        });
        return e;
    });
}


/**
 * get a single claim by given issuer, subject, key
 *
 * @method getClaim
 * @param {string} issuer issuer of the claim
 * @param {string} subject subject of the claim is about
 * @param {string} key key value for the claim
 * @return {Promise} 
 */
Datum.getClaim = function(issuer, subject, key) {
    var data = TxDataProvider.getGetSingleClaimData(isuser, subject, key);
    var to = settings.contracts.registryContractAddress;
    return this.web3Manager.send(to, data);
}



//#endregion static functions
var toType = function (obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

module.exports = Datum;