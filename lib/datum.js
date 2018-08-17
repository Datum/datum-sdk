/*!
 * datum.js - Datum javascript API
 *
 * javascript api for datum blockchain
 *
 * @license
 * @see
*/
var Web3Provider = require("./web3/web3provider");
var StorageManager = require("./web3/storage");
var settings = require("./web3/settings");
var utils = require("./utils/utils");
var crypto = require("./utils/crypto");
var version = require("./version.json");
var merkle = require("./utils/merkle");
var DatumIdentity = require("./datumIdentity");
var TxDataProvider = require("./web3/txDataProvider.js");

const Base64 = require("js-base64").Base64;
const Web3 = require("web3");
let web3Static = new Web3(new Web3.providers.HttpProvider("https://node-us-west.datum.org/api"));
let storageCostsContract = new web3Static.eth.Contract(settings.contracts.storageCostsABI, settings.contracts.storageCostsAddress);
let storageContract = new web3Static.eth.Contract(settings.contracts.storageABI, settings.contracts.storageAddress);
let claimsContract = new web3Static.eth.Contract(settings.contracts.registryContractABI, settings.contracts.registryContractAddress);
let vaultContract = new web3Static.eth.Contract(settings.contracts.vaultContractABI, settings.contracts.vaultContractAddress);

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
        this.useFuelingServer = false;
    } else {
        this.useFuelingServer = true;
    }

    if (config.privateMode === false) {
        this.privateMode = false;
    } else {
        this.privateMode = true;
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
};

/**
 * Export the actual keystore as serialized string
 *
 * @method exportIdentity
 * @return {string} the actual keystore serialized
 */
Datum.prototype.exportIdentity = function () {
    return this.identity.export();
};


/**
 * Set an DatumIdentity instance as actual identity
 *
 * @method setIdentity
 * @param {DatumIdentity} Datum identity instance
 */
Datum.prototype.setIdentity = function (identity) {
    this.identity = identity;
};


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
};


//return new instance
Datum.prototype.Identity = function () {
    return new DatumIdentity();
};

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
};


/**
 * Gets the public key for given address index
 *
 * @method getIdentityPublicKey
 * @param {number} accountIndex address to use, default = 0
 * @return {Promise}
 */
Datum.prototype.getIdentityPublicKey = function (accountIndex = 0) {
    return this.identity.getPublicKey(accountIndex);
};


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
};


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
};




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
};



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
};



/**
 * Get the encrypted secret for a data item
 *
 * @method getEncryptionForId
 * @param {string} id if of the data item
 * @return {string} encrypted secret for data item
 */
Datum.prototype.getEncryptionForId = function (id) {
    return this.storage.getEncryptionForId(id).then(hexCoded => {
        return this.web3Manager.toUtf8(hexCoded);
    });
};

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
            return this.identity.proxy = "0x" + txReceipe.logs[0].topics[1].substr(26);
        } else {
            return new Promise().reject("error creating identy contract");
        }
    });
};

//#endregion Identity

//#region Claims

/**
 * Add add claim to a user
 *
 * @method addClaim
 * @param {string} subject identity address to add the claim
 * @param {string} key the key value for the claim
 * @param {string} value storage address used for claim
 * @return {Promise}
 */
Datum.prototype.addClaim = function (subject, key, value, password = null) {

    //validateClaimParameterType(key) && validateClaimParameterType(value);
    validateClaimParameterType(key);

    let fixed_msg = `\x19Ethereum Signed Message:\n${value.length}${value}`;
    let fixed_msg_sha = web3Static.utils.sha3(fixed_msg);

    return this.identity.signMsgHash(fixed_msg_sha).then(signature => {
        var data = TxDataProvider.getAddClaimData(subject, key, value, fixed_msg_sha, signature.v, "0x" + signature.r.toString("hex"), "0x" + signature.s.toString("hex"));
        var to = settings.contracts.registryContractAddress;
        return this.web3Manager.send(to, data);
    });
};

/**
 * Removes a claim, can only be done from issuer or subject of the claim
 *
 * @method removeClaim
 * @param {string} issuer address/id of issuer
 * @param {string} subject identity address to add the claim
 * @param {string} key key value for the claim
 * @return {Promise}
 */
Datum.prototype.removeClaim = function (issuer, subject, key, password = null) {
    var data = TxDataProvider.getRemoveClaimData(issuer, subject, key);
    var to = settings.contracts.registryContractAddress;
    return this.web3Manager.send(to, data);
};



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
 * Withdrawal DAT tokens from storage contract
 *
 * @method withdrawal
 * @param {int} amount amount in DAT to withdraawal
 * @return {Promise}
 */
Datum.prototype.withdrawal = function (amount) {
    return Datum.getBalance(this.identity.address)
        .then(balance=>{
            if(balance>0){
                var data = TxDataProvider.getStorageWithdrawalData(this.identity.address, this.web3Manager.toWei(amount.toString()));
                var to = settings.contracts.storageAddress;
                return this.web3Manager.send(to, data);
            }else{
                return Promise.reject(`Insufficient storage Balance of ${balance}`);
            }});
};


/**
 * Withdrawal DAT tokens to ethereum address, sends the Tokens to plasma contract
 *
 * @method withdrawalToEthereum
 * @param {string} receiver receiver wallet address in ethereum
 * @param {int} amount amount in DAT to transfer to ethereum
 * @return {Promise}
 */
Datum.prototype.withdrawalToEthereum = function (receiver, amount) {
    return Datum.getBalance(this.identity.address).then(balance => {
        if(web3Static.utils.toBN(Web3.utils.toWei(amount.toString())).gt(web3Static.utils.toBN(balance))) {
            throw new Error("You withdrawal request exceeds your total balance, requested: \"" + amount + "\" but your account has only : \"" + Web3.utils.fromWei(balance) + "\"");
        }
        var data = TxDataProvider.getWithdrawalEthereum(receiver);
        var to = settings.contracts.datumPlasmaPOAAddress;
        return this.web3Manager.send(to, data, Web3.utils.toWei(amount.toString()));
    });
};


/**
 * Estimate the costs for a withdrawal to ethereum main. Get's the actual gwei gasprice and returns costs in DAT
 *
 * @method estimateWithdrawalToEthereumCosts
 * @return {float} costs in DAT
 */
Datum.prototype.estimateWithdrawalToEthereumCosts = function () {
    //default gas used for an ERC20 transactions
    var defaultMaxGas = 52007;

    return Promise.all([Datum.getEthereumMainnetGasPrice(),
        Datum.getDatValueInETH()
    ])
        .then(results => {
            if (results.length !== 2) {
                throw new Error("Invalid response when trying to fetch gas price");
            } else {
                let gasPrice = results[0];
                let datValue = results[1];
                let costsInEthWei = (gasPrice * defaultMaxGas);
                let datValueInWei = Web3.utils.toWei(datValue);
                return costsInEthWei / datValueInWei;
            }
        });
};


Datum.prototype.set = function (data, key = "", category = "", metadata = "", replicationMode = 1, pricacyLevel = 1, duration = 30, deposit = 0, publicKeysToAdd = []) {

    var dataString = (toType(data) == "string") ? Base64.encode(data) : toType(data) == "object" ? Base64.encode(JSON.stringify(data)) : data.toString("base64");
    var randomSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    if (key != "" && this.privateMode) {
        key = this.web3Manager.sha3(this.identity.address + key);
    }

    return Promise.all([this.getDepositBalance(this.identity.address), this.getStorageCosts(dataString.length, duration)]).then(args => {
        if (parseInt(args[1]) < parseInt(args[2])) throw Error("insufficient balance, please make a deposit first");

        let encData = "";
        let merkleRoot = "";
        let size = 0;
        let id = "";

        return this.encryptDataForPublicKeys(dataString, publicKeysToAdd).then(enc => {
            encData = enc.symEncMessage;
            delete enc.symEncMessage;
            id = utils.hash(encData);
            var merkleObj = merkle.createMerkle(encData);
            merkleRoot = merkleObj.root;
            size = encData.length;
            var data = TxDataProvider.getSetData(this.identity.address, id, merkleObj.root, key, size, duration, replicationMode, pricacyLevel, JSON.stringify(enc));
            //var data = TxDataProvider.getSetData(this.identity.address, id, merkleObj.root, key, size, duration, replicationMode, pricacyLevel, JSON.stringify(enc));
            //fix: needed to calculate gas new identities
            var data2 = TxDataProvider.getSetData("0xbDDB8404281d830dE5E200EB241aeC3c97D885BC", id, merkleObj.root, key, size, duration, replicationMode, pricacyLevel, JSON.stringify(enc));
            var to = settings.contracts.storageAddress;
            if (!this.nodeSentMode) {
                return this.web3Manager.send(to, data, deposit, null, data2);
            } else {
                return Promise.resolve(false);
            }
        }).then(nodeMode => {
            let msg = new Date().getTime().toString();
            return this.identity.signMsg(msg).then(signed => {
                let postParams = {
                    id: id,
                    v: signed.v.toString(16),
                    r: signed.r.toString("hex"),
                    s: signed.s.toString("hex"),
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
        });
    });
};


Datum.prototype.get = function (id) {
    let msg = new Date().getTime().toString();
    return this.identity.signMsg(msg).then(signed => {
        let postParams = {
            id: id,
            v: signed.v.toString(16),
            r: signed.r.toString("hex"),
            s: signed.s.toString("hex"),
            msg: msg
        };
        return this.storage.postStorageNode("/v1/storage/download", postParams);
    }).then(encrypedData => {
        return this.getEncryptionForId(id).then(enc => {
            let encObj = JSON.parse(enc);
            encObj.symEncMessage = encrypedData;
            return this.identity.decrypt(encObj);
        });
    }).then(base64Data => {
        return Base64.decode(base64Data);
    });
};




/**
 * Get/Download the data with given key name
 *
 * @method getWithKey
 * @param {string} key key name of the data
 * @return {promise} promise with data already decrypted with private key if have access
 */
Datum.prototype.getWithKey = function (key) {
    if (this.privateMode) {
        key = this.web3Manager.sha3(this.identity.address + key);
    }
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
                r: signed.r.toString("hex"),
                s: signed.s.toString("hex"),
                msg: msg
            };
            return this.storage.postStorageNode("/v1/storage/delete", postParams);
        });
    });

};

/**
 * Remove some data from storage
 *
 * @method removeByKey
 * @param {string} key keyname
 * @return {promise} promise
 */
Datum.prototype.removeByKey = function (key) {
    if (this.privateMode) {
        key = this.web3Manager.sha3(this.identity.address + key);
    }
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
};

Datum.prototype.decryptData = function (enc, password = "", accountIndex = 0) {
    return this.identity.decrypt(enc, password, accountIndex);
};

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
        return { seed: result.seed, keystore: d.export() };
    });
};

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


/**
 * Gets the actual value for 1 DAT in USD, readout from smart contract
 *
 * @method getDATRate
 * @return {float} value of 1 DAT in USD
 */
Datum.getDATRate = function () {
    return storageCostsContract.methods.getDollarRate()
        .call().then(rate => {
            return rate / 1000000;
        });
};


/* END STORAGE COSTS */


/**
 * Get the Balance for given address in Datum Network, combined real balance and virtual balance
 *
 * @method getBalance
 * @param {string} wallet wallet address
 * @return {Promise} Promise with balance in Wei
 */
Datum.getBalance = function (wallet, toDat = false) {
    return Promise.all([
        web3Static.eth.getBalance(wallet),
        Datum.getVirtualBalance(wallet)
    ])
        .then(results => {
            if (results.length !== 2) {
                throw new Error("Error receiving balances from contracts");
            } else {
                let realBalance = web3Static.utils.toBN(results[0]);
                let virtualBalance = web3Static.utils.toBN(results[1]);
                let totalBalance = realBalance.add(virtualBalance);
                return toDat ? web3Static.utils.fromWei(totalBalance.toString()) : totalBalance.toString();
            }
        });
};

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
};

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
};

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
};

/**
 * Get the virtual balance hold in vault contract
 *
 * @method getVirtualBalance
 * @param {string} wallet wallet address
 * @return {Promise} Promise with balance in Wei
 */
Datum.getVirtualBalance = function (wallet) {
    return vaultContract.methods.getBalance(wallet)
        .call({ from: this.sender })
        .then(balance => {
            return balance;
        });
};

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
};


/**
 * Get last item for given wallet address under given keyname
 *
 * @method getLastIdForKey
 * @param {string} wallet wallet address
 * @param {string} keyname key name to looup for
 * @return {Promise} Promise with balance in Wei
 */
Datum.getLastIdForKey = function (wallet, keyname) {
    if (this.privateMode) {
        keyname = this.web3Manager.sha3(this.identity.address + keyname);
    }
    return storageContract.methods.getActualIdForKey(wallet, web3Static.toHex(keyname))
        .call({ from: this.sender });
};

/**
 * Get all items for given wallet address under given keyname
 *
 * @method getIdsForKey
 * @param {string} wallet wallet address
 * @param {string} keyname key name to looup for
 * @return {Promise} Promise with balance in Wei
 */
Datum.getIdsForKey = function (wallet, keyname) {
    if (this.privateMode) {
        keyname = this.web3Manager.sha3(this.identity.address + keyname);
    }
    return storageContract.methods.getIdsForAccountByKey(wallet, web3Static.utils.toHex(keyname))
        .call({ from: this.sender });
};


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
};


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
    return merkle.createMerkle(obj);
};

Datum.encrypt = function (data, password, authData = "________should_be_signer_address__________") {
    var dataString = (toType(data) == "object") ? Base64.encode(JSON.stringify(data)) : Base64.encode(data);
    return Base64.encode(crypto.encrypt(dataString, password, authData));
};

Datum.decrypt = function (obj, password, authData = "________should_be_signer_address__________") {
    var result = crypto.decrypt(Base64.decode(obj), password, authData);
    var ret = Base64.decode(result);
    if (ret == typeof object) {
        ret = JSON.parse(ret);
    }
    return ret;
};

Datum.encryptWithPublicKey = function (data, publicKey) {
    var dataString = (toType(data) == "object") ? JSON.stringify(data) : data;
    if (publicKey.length > 2 && publicKey.substr(0, 2) != "0x") {
        publicKey = "0x" + publicKey;
    }
    return crypto.ethEncrypt(dataString, publicKey);
};

Datum.decryptWithPrivateKey = function (obj, privateKey) {
    var result = crypto.ethDecrypt(obj, privateKey);
    return result;
};

/**
 * Get All claims by issuer
 */
Datum.getClaimsByIssuer=function(address){
    return Datum.getClaims(address,{issuer:address});
};
/**
 * get all claims behind this address, returns array with object (issuer, subject, key, value)
 *
 * @method getClaims
 * @param {string} address identity address to get the claims from
 * @param {Object} filter filter object to allow differnt filters
 * @return {Promise}
 */
Datum.getClaims = function(address,filter) {
    const opts = {
        filter: typeof filter==="undefined"?{subject: address }:filter,
        fromBlock: 0,
        toBlock: "latest"
    };

    return Promise.all([
        claimsContract.getPastEvents("ClaimSet",opts),
        claimsContract.getPastEvents("ClaimRemoved",opts)
    ]).then(events=>{
        let savedClaims = getClaimObjs(events[0]);
        let removedClaims = getClaimObjs(events[1]);
        let diff =[];
        for (let key in savedClaims) {
            if(typeof removedClaims[key]==="undefined" || removedClaims[key].ts<savedClaims[key].ts){
                diff.push(savedClaims[key].value);
            }
        }
        let claims = diff.map(c=>{
            return {
                issuer: c.returnValues.issuer,
                subject: c.returnValues.subject,
                key : web3Static.utils.hexToUtf8(c.returnValues.key),
                value : web3Static.utils.hexToUtf8(c.returnValues.value)
            };
            return e;
        });
        return claims;
    });

};
/**
 * Construct unique events object with latest TS(Time Stamp).
 * @param {Array} events array of claim events objects
 * @return {Object} Object that is constructed of custom keys [issuer+subject+key]
 */
function getClaimObjs(events){
    let claims={};
    events.map(e=>{
        let tmp = getEventObj(e);
        if( typeof claims[tmp.key] !=="undefined"&& tmp.ts>claims[tmp.key].ts){
            claims[tmp.key]={ts:tmp.ts,value:tmp.value};
        }else{
            claims[tmp.key]={ts:tmp.ts,value:tmp.value};
        }
    });
    return claims;
}
/**
 * Construct event object irregardless of type of event (claimSet,ClaimRemoved)
 * @param {Object} e  claim event object
 * @return {Object} custom claim object {key,ts,value}
 */
function getEventObj(e){
    let rv = e.returnValues;
    return {
        key:rv.issuer+rv.subject+rv.key,
        ts:new Date(parseInt(typeof rv.updatedAt ==="undefined"?rv.removedAt:rv.updatedAt)*1000),
        value:e
    };
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
Datum.getClaim = function (issuer, subject, key) {
    validateClaimParameterType(key);
    return claimsContract.methods.getClaim(issuer, subject,
        web3Static.utils.toHex(key)
    ).call().then(v=>
        v
    );
};

/**
 * Claims Key & values must be strings not numbers nor string-numbers
 * @param {String} p parameter to check the type for
 * @return true
 */
function validateClaimParameterType(p){
    if(typeof p === "string" && isNaN(parseInt(p))){
        return true;
    }else{
        throw new Error("Parameters of type Number/Number-String are not allowed in claims");
    }
}

/**
 * verify a claim and checks if the issuer is also the signer, returns true/false
 *
 * @method verifyClaim
 * @param {string} address identity address to get the claims from
 * @return {Promise}
 */
Datum.verifiyClaim = function (issuer, subject, key) {
    return claimsContract.methods.verifyClaim(issuer, subject, web3Static.utils.toHex(key))
        .call();
};


/**
 * Gets the actual safeLow gasprice from ethereum mainnet over ethgasstation api
 *
 * @method getEthereumGasPrice
 * @return {int} actual safeLow gasPrice in wei
 */
Datum.getEthereumMainnetGasPrice = function () {
    return Web3Provider.getEthereumGasPrice();
};

/**
 * Gets the actual value of 1 DAT in ETH
 *
 * @method getDatValueInETH
 * @return {float} actual price of 1 DAT in ETH
 */
Datum.getDatValueInETH = function () {
    return Web3Provider.getDatValueInETH();
};


//#endregion static functions
var toType = function (obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

module.exports = Datum;
