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

let web3Static = new Web3(new Web3.providers.HttpProvider("https://node-5.megatron.datum.org/api"));
let storageCostsContract = new web3Static.eth.Contract(settings.contracts.storageCostsABI, settings.contracts.storageCostsAddress);
let storageContract = new web3Static.eth.Contract(settings.contracts.storageABI, settings.contracts.storageAddress);
let claimsContract = new web3Static.eth.Contract(settings.contracts.registryContractABI, settings.contracts.registryContractAddress);
let vaultContract = new web3Static.eth.Contract(settings.contracts.vaultContractABI, settings.contracts.vaultContractAddress);
let registratorContract = new web3Static.eth.Contract(settings.contracts.nodeRegistratorABI, settings.contracts.nodeRegistratorAddress);

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
    //If fuelling is enabled configurations must be provided
    if (config.useFuelingServer && (typeof config.fuellingConfig === 'undefined'||typeof config.fuellingConfig.URL ==='undefined')) {
      throw new Error('Missing fuelling configurations');
    }

    if (config.settings !== undefined) {
        this.settings = config.settings;
    } else {
        this.settings = settings;
    }

    if (config.network === undefined) config.network = "https://node-5.megatron.datum.org/api";
    if (config.storage === undefined) config.storage = "https://node-eu-west.datum.org/storage";
    if (config.defaultPublicKeys === undefined) config.defaultPublicKeys = [];

    if (config.useFuelingServer === false) {
        this.useFuelingServer = false;
    } else {
        this.useFuelingServer = true;
        this.fuellingConfig = config.fuellingConfig;
    }

    if (config.privateMode === true || config.privateMode === undefined) {
        this.privateMode = true;
    } else {
        this.privateMode = false;
    }



    this.identity = new DatumIdentity(config.defaultPublicKeys);

    if (config.identity !== undefined) {
        this.identity.import(config.identity);
    }

    this.nodeSentMode = false;
    //TODO:replace fixed local fueling server link with configuration object or settings
    this.web3Manager = new Web3Provider(config.network, this.identity, this.settings, config.useFuelingServer,config.fuellingConfig);
    this.storage = new StorageManager(config.network, config.storage, this.settings);


    // temp fix for incorrect static functions
    // TODO fix the static methods on how to get config.network - can we make init mandatory before anything else?
    web3Static = new Web3(new Web3.providers.HttpProvider(config.network));
    storageCostsContract = new web3Static.eth.Contract(this.settings.contracts.storageCostsABI, this.settings.contracts.storageCostsAddress);
    storageContract = new web3Static.eth.Contract(this.settings.contracts.storageABI, this.settings.contracts.storageAddress);
    claimsContract = new web3Static.eth.Contract(this.settings.contracts.registryContractABI, this.settings.contracts.registryContractAddress);
    vaultContract = new web3Static.eth.Contract(this.settings.contracts.vaultContractABI, this.settings.contracts.vaultContractAddress);
    registratorContract = new web3Static.eth.Contract(this.settings.contracts.nodeRegistratorABI, this.settings.contracts.nodeRegistratorAddress);

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
    //return this.identity.getPublicKey(accountIndex);

    return this.identity.getPrivateKey(accountIndex).then(pk => {
        return utils.privateToPublic("0x" + pk).substr(2);
    });
};


/**
 * Gets the public encryption key for given address index
 *
 * @method getEncryptionPublicKey
 * @param {number} accountIndex address to use, default = 0
 * @return {Promise}
 */
Datum.prototype.getEncryptionPublicKey = function (accountIndex = 0) {
    return this.identity.getPublicKey(accountIndex);
};


/**
 * Gets the prirvate key for given address index
 *
 * @method getIdentityPrivateKey
 * @param {number} accountIndex address to use, default = 0
 * @return {Promise}
 */
Datum.prototype.getIdentityPrivateKey = function (accountIndex = 0) {
    return this.identity.getPrivateKey(accountIndex);
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

    if (this.privateMode) {
        keyname = web3Static.utils.soliditySha3(address,keyname)
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

    if (this.privateMode) {
        keyname = web3Static.utils.soliditySha3(address,keyname)
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
    var to = this.settings.contracts.identityManagerAddress;
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

    let keyEncoded = key.startsWith("0x") ? key : web3Static.eth.abi.encodeParameter('bytes32', web3Static.utils.fromAscii(key));
    let valueEncoded = value.startsWith("0x") ? value : web3Static.eth.abi.encodeParameter('bytes32', web3Static.utils.fromAscii(value));
    let fixed_msg_sha = web3Static.utils.soliditySha3(subject, keyEncoded, valueEncoded);

    return this.identity.signMsgHash(fixed_msg_sha).then(signature => {
        var data = TxDataProvider.getAddClaimData(subject, key, value, signature.v, "0x" + signature.r.toString("hex"), "0x" + signature.s.toString("hex"));
        var to = this.settings.contracts.registryContractAddress;
        return this.web3Manager.send(to, data);
    });
};

/**
 * Add add claim to a user with signer as issuer
 *
 * @method addClaimWithSigner
 * @param {string} subject identity address to add the claim
 * @param {string} key the key value for the claim
 * @param {string} value storage address used for claim
 * @param {number} timestamp timestamp that was input for the signature
 * @param {object} signature signature object from the signed timestamp
 * @return {Promise}
 */
Datum.prototype.addClaimWithSigner = function (subject, key, value, signature, password = null) {
    validateClaimParameterType(key);

    var data = TxDataProvider.getAddClaimWithSignerData(subject, key, value,  signature.v, "0x" + signature.r.toString("hex"), "0x" + signature.s.toString("hex"));
    var to = this.settings.contracts.registryContractAddress;
    return this.web3Manager.send(to, data);
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
    var to = this.settings.contracts.registryContractAddress;
    return this.web3Manager.send(to, data);
};



//#endregion Claims


//#region Noderegistraton
/**
 * Register a new storage node
 *
 * @method registerNode
 * @param {string} endpoint the endpoint address where the node is accessible
 * @param {int} amount amount of staking provided within this transaction
 * @param {int} bandwidthType type of bandwidth provided, 0-2
 * @param {int} regionType type of region where node is located, 0-5
 * @return {Promise}
 */
Datum.prototype.registerNode = function (endpoint, amount = 0,  bandwidthType = 1, regionType = 1) {
    var data = TxDataProvider.getRegisterNodeData(endpoint, bandwidthType, regionType);
    var to = this.settings.contracts.nodeRegistratorAddress;
    return this.web3Manager.send(to, data, amount != 0 ? this.web3Manager.toWei(amount.toString()) : 0);
};


/**
 * Deposit the staking for a new storage node, can also be done directly on registerNode
 *
 * @method depositNodeStaking
 * @param {int} amount amount of staking provide to contract
 * @return {Promise}
 */
Datum.prototype.depositNodeStaking = function (amount = 1) {
    var data = TxDataProvider.getNodeDepositStaking();
    var to = this.settings.contracts.nodeRegistratorAddress;
    return this.web3Manager.send(to, data, amount != 0 ? this.web3Manager.toWei(amount.toString()) : 0);
};


/**
 * Get Storage Staking Balance
 *
 * @method getStorageStakeBalance
 * @param {int} amount amount of staking provide to contract
 * @return {Promise}
 */
Datum.prototype.getStorageStakeBalance = function () {
    return registratorContract.methods.getStakingBalance().call();
};

//#endregion Noderegistration

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
    var to = this.settings.contracts.storageAddress;
    return this.web3Manager.send(to, data, this.web3Manager.toWei(amount.toString()));
};


/**
 * Force a storage proof for a given item
 *
 * @method forceStorageProof
 * @param {string} hash id/hash of the item
 * @param {string} address nodeAddres
 * @return {Promise}
 */
Datum.prototype.forceStorageProof = function (hash,address) {
    var data = TxDataProvider.getForceStorageProofData(hash,address);
    var to = settings.contracts.storageAddress;
    return this.web3Manager.send(to, data);
};


/**
 * Set storage node work status on given hash
 *
 * @method setWorkStatus
 * @param {string} hash id/hash of the item
 * @return {Promise}
 */
Datum.prototype.setWorkStatus = function (hash) {
    var data = TxDataProvider.getSetWorkStatus(hash);
    var to = settings.contracts.storageAddress;
    return this.web3Manager.send(to, data);
};


/**
 * Provide a storage proof for a given hash
 *
 * @method provideStorageProof
 * @param {string} hash id/hash of the item
 * @param {array} alpha snarks value alpha
 * @param {array} beta snarks value beta
 * @param {array} gamma snarks value gamma
 * @param {array} gammaABC snarks value gammaABC
 * @param {array} proofA snarks value proofA
 * @param {array} proofB snarks value proofB
 * @param {array} proofC snarks value proofC
 * @param {array} input snarks value input
 * @return {Promise}
 */
Datum.prototype.provideStorageProof = function (dataHash, alpha, beta, gamma, delta, gammaABC, proofA, proofB, proofC) {
    var data = registratorContract.methods.Verify(
        dataHash,
        alpha,
        beta,
        gamma,
        delta,
        gammaABC,
        proofA,
        proofB,
        proofC,
        input
    ).encodeABI();
    var to = settings.contracts.nodeRegistratorAddress;
    return this.web3Manager.send(to, data);
};


/**
 * Provide a merkle proof for a given hash
 *
 * @method provideMerkleProof
 * @param {string} dataHash id/hash of the item
 * @param {string} data encrypted data
 * @param {number} chunkIndex chunk index to proof that exists
 * @return {Promise}
 */
Datum.prototype.provideMerkleProof = function (dataHash, data, chunkIndex) {
    let merkleProof = merkle.getProof(data, chunkIndex);
    var data = TxDataProvider.getGiveForcedStorageProof(dataHash, merkleProof.proof ,merkleProof.hash);
    var to = settings.contracts.storageAddress;
    return this.web3Manager.send(to, data);
};


/**
 * Get list of failed storage proofs with hash und timestamp
 *
 * @method getFailedStorageProofs
 * @return {Promise}
 */
Datum.prototype.getFailedStorageProofs = function () {
    return registratorContract.methods.getFailedStorageProofs().call().then(failedProofs => {
        return failedProofs;
    });
};

/**
 * Estimate the rewards as storage node for actual identity
 *
 * @method estimateRewards
 * @return {number} reward in DAT (wei)
 */
Datum.prototype.estimateRewards = function () {
    return registratorContract.methods.estimateRewards().call().then(reward => {
        return reward;
    });
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
                var to = this.settings.contracts.storageAddress;
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
        var to = this.settings.contracts.datumPlasmaPOAAddress;
        return this.web3Manager.send(to, data, Web3.utils.toWei(amount.toString()));
    });
};


/**
 * Transfer ownership of an item to other address
 *
 * @method transferOwner
 * @param {string} id hash/id of data item to change ownership
 * @param {string} newOwner address of new owner
 * @param {string} publicKey public key of new owner, only needed if new owner isn't already in access list
 * @param {string} encryptionKey encryption key of new owner, , only needed if new owner isn't already in access list
 * @return {Promise}
 */
Datum.prototype.transferOwner = function (id, newOwner, publicKey, encryptionKey) {

    var data = TxDataProvider.getTransferOwnership(id, newOwner);
    var to = this.settings.contracts.storageAddress;

    //check if new owner already has access to item
    return storageContract.methods.getAccessKeysForData(id).call().then(accessList => {
        var index = accessList.findIndex(item => newOwner.toLowerCase() === item.toLowerCase());
        if(index != -1) {
            //new owner already in list, just switch owner in contract
            return this.web3Manager.send(to, data, 0);
        } else {

            if(publicKey === undefined || encryptionKey == undefined)
                throw new Error('publicKey and encryptionKey must be provided because new owner is not in access list at moment');

            //new owner is not in access list, need to recreate encryption and new
            return this.addPublicKeyForData(id, { publicKey, encryptionKey}).then(rs => {
                return this.web3Manager.send(to, data, 0);
            })
        }
    })
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


Datum.prototype.recoverAddress = function(msg, v,r,s) {
    return this.identity.recoverAddress(msg,v,r,s);
};


/**
 * Get a package with txData, encrypted data and encryption header and a signature , so a 3rd party can process the blockchain action
 *
 * @method setCreatePackage
 */
Datum.prototype.setCreatePackage = function (data, key = "", category = "", metadata = "", replicationMode = 1, pricacyLevel = 1, duration = 30, deposit = 0, publicKeysToAdd = []) {
    var dataString = (toType(data) == "string") ? Base64.encode(data) : toType(data) == "object" ? Base64.encode(JSON.stringify(data)) : data.toString("base64");
    var randomSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    if (this.privateMode) {
        key = web3Static.utils.soliditySha3(this.identity.address,key)
    }

    let password = crypto.createPassword(24);
    let encryptedPassword = "";
    let encryptData = crypto.encrypt(dataString, password);
    let id = utils.hash(encryptData);

    //pad to 32 bytes chunk blocks
    encryptData = dataToHex(encryptData);
    let merkleRoot = merkle.getMerkleRoot(encryptData);
    let size = encryptData.length;


    return this.encryptDataForPublicKeys(password, publicKeysToAdd).then(enc => {
        let pubWallets = [];
        for(var i = 0;i < publicKeysToAdd.length;i++){
            pubWallets.push(utils.publicToAddress(publicKeysToAdd[i]));
        }
        var data = storageContract.methods.setStorage(this.identity.address, id, merkleRoot, web3Static.utils.toHex(key), size, replicationMode, pubWallets).encodeABI();
        return this.identity.signMsg(data).then(sig => {
            return { id , txData: data, encryptedData : encryptData, header: enc, r :  "0x"+sig.r.toString("hex"), s : "0x"+sig.s.toString("hex"), v : sig.v,
                meta : { key, category, merkleRoot, metadata, replicationMode, pricacyLevel, duration } };
        });
    });
};


/**
 * Set data from a given package created by other datum user
 *
 * @method setFromPackage
 * @param {string} hash id/hash of the package
 * @param {string} txData data part of transcation
 * @param {string} encryptedData encrypted data part
 * @param {string} header crypto header
 * @param {string} meta meta data part
 * @param {int} meta deposit amount if senders wallet not already filled
 * @return {Promise}*
 */
Datum.prototype.setFromPackage = function (id, txData, encryptedData, header, meta, deposit = 0) {
    var to = settings.contracts.storageAddress;
    return this.web3Manager.send(to, txData, deposit).then(tx => {
        let msg = new Date().getTime().toString();
        return this.identity.signMsg(msg).then(signed => {
            let postParams = {
                id: id,
                v: signed.v.toString(16),
                r: signed.r.toString("hex"),
                s: signed.s.toString("hex"),
                msg: msg,
                data:  JSON.stringify(header) + "||" + encryptedData,
                category: meta.category,
                merkle: meta.merkleRoot,
                metadata: meta.metadata,
                replicationMode: meta.replicationMode,
                duration: meta.duration,
                privacy: meta.pricacyLevel,
                key: meta.key
            };
            return this.storage.postStorageNode("/v1/storage/store", postParams);
        });
    });
};


/**
 * dataToHex - Convert data to hex string with size of multiple 64 byte
 *
 * @param  {type} data base64Data
 */
function dataToHex(data){
    let hexStr = web3Static.utils.toHex(data);
    let strBytes = hexStr.length/2;
    let multipleof64 = Math.ceil(strBytes/64);
    return hexStr.padStart((multipleof64*64)*2,"0");
}

/**
 * HexToData - convert hex string to encrypted data object
 *
 * @param  {String} paddedHexStr hex padded string to convert it's size to multiple of 64 byte
 * @return {Object} Encrypted data object
 */
function HexToData(paddedHexStr){
    let hexStr = paddedHexStr.replace(/[0]*x/,"0x");
    return web3Static.utils.hexToAscii(hexStr);
}

function getNodeEndpoint(address) {
    return new Promise((resolve, reject) => {
        registratorContract.methods.getNodeInfo(address).call()
            .then(info => resolve(info.endpoint))
            .catch(reject);
    });
}


/**
 * checkBalances - Check if user have enough balance to perform set
 *
 * @param  {Int} deposit           amount to deposit
 * @param  {Int} [depositedBalance amount Deposited
 * @param  {Int} storageCosts]     storage costs
 * @throw Exception incase of invalid balance
 */
function checkBalances(deposit,[depositedBalance, storageCosts]){
  //Internal function to convert to BN.
  bn=(n)=>web3Static.utils.toBN(n);

  const totalDeposit = bn(deposit).add(bn(depositedBalance));

  if(totalDeposit.lt(bn(storageCosts))){
    throw Error("insufficient balance, please make a deposit first or pass some DAT in set call");
  }
}

/**
 * set - set storage
 *
 * @param  {Object|String} data data to be stored
 * @param  {String} key key name [optional]
 * @param  {String} category category name [optional]
 * @param  {String} metadata metadata name [optional]
 * @param  {Number} replicationMode minimal replication requested [optional]
 * @param  {Number} pricacyLevel minimal pricavy level of storage node requested [optional]
 * @param  {Number} duration minimal duration excepted [optional]
 * @param  {Number} deposit deposit to make with this transaction [optional]
 * @param  {Number} owner alternate owner for the data instead of sender [optional]
 * @param  {Number} publicKeysToAdd list of public key object (publicKey/encryptionKey) for 3rd party access or if owner is different [optional]
 * @return {Promise} Promise
 */
Datum.prototype.set = function (data, key = "_def_", category = "", metadata = "", replicationMode = 1, pricacyLevel = 1, duration = 30, deposit = 0, owner = "", publicKeysToAdd = [],toDat=true) {
    if(toDat&&deposit!==0){
      deposit=web3Static.utils.toWei(`${deposit}`);
    }

    var dataString = (toType(data) == "string") ? Base64.encode(data) : toType(data) == "object" ? Base64.encode(JSON.stringify(data)) : data.toString("base64");
    var randomSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    var ownerAddr = owner == "" ? this.identity.address : owner;

    if (key != "_def_" && this.privateMode) {
        key = web3Static.utils.soliditySha3(ownerAddr,key)
    }

    let password = crypto.createPassword(24);
    let encryptData = crypto.encrypt(dataString, password);
    let id = utils.hash(encryptData);

    //pad to 32 bytes chunk blocks
    encryptData = dataToHex(encryptData);
    let merkleRoot = merkle.getMerkleRoot(encryptData);
    let size = encryptData.length;


    return Promise.all([this.getDepositBalance(this.identity.address), this.getStorageCosts(dataString.length, duration)]).then(args => {

        checkBalances(deposit,args);

        let pubWallets = [];
        for (var i = 0; i < publicKeysToAdd.length; i++) {
            pubWallets.push(utils.publicToAddress("0x" + publicKeysToAdd[i].publicKey));
        }


        //if other owner set, check if also exists in public keys list
        if(owner != "") {
            if(pubWallets.indexOf(owner) == -1) {
                throw new Error('If other owner is set, please add also in public keys list with public key and encryption key!');
            }
        }

        //if other owner add to access list
        if(owner != "" && owner != this.identity.address) {
            pubWallets.push(this.identity.address);
        }


        //get data part of tx
        var data = storageContract.methods.setStorage(ownerAddr, id, merkleRoot, web3Static.utils.toHex(key), size, replicationMode, pubWallets).encodeABI();
        var to = this.settings.contracts.storageAddress;
        //sent over web3 or node
        if (!this.nodeSentMode) {
            return this.web3Manager.send(to, data, deposit);
        } else {
            return Promise.resolve(false);
        }

    }).then(tx => {
        if (tx != false && (typeof tx.logs==='undefined'||tx.logs.length <= 2)) throw new Error("Error selection storage nodes");
        //for encryption, all public keys need to be compressed, checking
        return this.encryptDataForPublicKeys(password, publicKeysToAdd)
            .then(encryptedSecret => {
                var nodeLogStartIndex = tx.logs.length - 3;
                storageContract.inputs = [{ "indexed": false, "name": "dataHash", "type": "bytes32" }, { "indexed": false, "name": "addresses", "type": "address" }];
                var mainNode = storageContract._decodeEventABI({ data: tx.logs[nodeLogStartIndex].data }).returnValues.addresses;
                var node1 = storageContract._decodeEventABI({ data: tx.logs[nodeLogStartIndex + 1].data }).returnValues.addresses;
                var node2 = storageContract._decodeEventABI({ data: tx.logs[nodeLogStartIndex + 2].data }).returnValues.addresses;

                return Promise.all([
                    Promise.resolve(encryptedSecret),
                    getNodeEndpoint(mainNode),
                    Promise.resolve(mainNode),
                    getNodeEndpoint(node1),
                    Promise.resolve(node1),
                    getNodeEndpoint(node2),
                    Promise.resolve(node2)
                ]);
            }).then(results => {
                if (results.length !== 7) throw new Error("Error getting endpoint from contract");
                let msg = new Date().getTime().toString();
                return this.identity.signMsg(msg).then(signed => {
                    let postParams = {
                        "id": id,
                        "v": signed.v.toString(16),
                        "r": signed.r.toString("hex"),
                        "s": signed.s.toString("hex"),
                        "msg": msg,
                        "header": JSON.stringify(publicKeysToAdd) + "||" + JSON.stringify(results[0]),
                        "merkle" : merkleRoot,
                        "data": encryptData,
                        "category": category,
                        "metadata": metadata,
                        "replicationMode": replicationMode,
                        "privacy": pricacyLevel,
                        "key": key
                    };
                    let nodes = getNodeLists(results);
                    let prom = nodes.map(node=>{
                        return this.storage.postCustomStorageNode(`https://${node.endpoint}`,"/v1/storage/store", postParams)
                            .catch(function (err) {
                                console.error("Failed to store on node:" + node.endpoint + ", address: " + node.address, err);
                            });
                    });
                    return Promise.all(prom);
                }).then(results => {
                    //TODO: replace logic with code that compare results with number of nodes returned instead of fixed index
                    // if (results.length !== 3) throw new Error("Error sending to nodes failed");

                    if (results.indexOf(undefined) != -1) {
                        console.log("at least one upload to a server failed. check error console");
                    }
                    if(results[0] === undefined && results[1] === undefined && results[2] === undefined) {
                        throw new Error("Uploading to all nodes failed! Plesae check log in console");
                    }
                    return results.filter(v=>typeof v !=="undefined")[0];
                });
            });
    });

};

/**
 * getNodeLists - Convert array of nodeEndpoints to list of objects {endpoint, address}
 *
 * @param  {Array} nodeEndpoints a
 * @return {Array} Array of objects {endpoint,address}
 */
function getNodeLists(nodeEndpoints){
    let tmp = nodeEndpoints.slice().splice(1);
    let nodes=[];
    for(let i =0;i<tmp.length;i+=2){
        if(isURL(tmp[i])){
            nodes.push({
                endpoint:tmp[i],
                address:tmp[i+1]
            });
        }
    }
    return nodes;
}

Datum.prototype.get = function (id) {
    return storageContract.methods.getNodesForItem(id).call().then(nodes => {
        var prom = [];
        for (var i = 0; i < nodes.length; i++) {
            prom.push(getNodeEndpoint(nodes[i]));
            prom.push(nodes[i]);
        }
        return Promise.all(prom);
    }).then(async results => {
        let postParams = {id: id};

        for (let i = 0; i < results.length; i+=2) {
            if (isURL(results[i])) {
                let p = null;
                let date = new Date().getTime().toString();
                let sign = await this.identity.signMsg(date);
                postParams.msg = date;
                postParams.v = sign.v.toString(16);
                postParams.r = sign.r.toString("hex");
                postParams.s = sign.s.toString("hex");
                try {
                    p = await Promise.all([
                        this.storage.postCustomStorageNode("https://" + results[i], "/v1/storage/download", postParams),
                        this.storage.postCustomStorageNode("https://" + results[i], "/v1/storage/downloadHeader", postParams)
                    ]);
                } catch (err) {
                    console.error("Failed to get on node:" + results[i] + ", address: " + results[2*i], err);
                    continue;
                }

                let header = p[1];
                if (header.indexOf("||") != -1) {
                    var headerparts = header.split("||");
                    if (headerparts.length == 2) {
                        header = JSON.parse(headerparts[1]);
                    }
                }
                return Base64.decode(await crypto.decrypt(HexToData(p[0]), await this.identity.decrypt(header)));
            }
        }
        throw new Error("error downloading content");
    });
};

Datum.prototype.updateHeader = function(id, header) {
    let msg = new Date().getTime().toString();
    return storageContract.methods.getNodesForItem(id).call().then(nodes => {
        var prom = [];
        for(var i = 0;i < nodes.length;i++) {
            prom.push(
                getNodeEndpoint(nodes[i])
            );
        }
        return Promise.all(prom);
    }).then(results => {
        return Promise.all([results, this.identity.signMsg(msg)]);
    }).then(results => {
        let postParams = {
            "id": id,
            "header" : header,
            "v": results[1].v.toString(16),
            "r": results[1].r.toString("hex"),
            "s": results[1].s.toString("hex"),
            "msg": msg
        };

        var prom = [];
        for (var i = 0; i < results[0].length; i++) {
            if (isURL(results[0][i])) {
                prom.push(
                    this.storage.postCustomStorageNode("https://" + results[0][i], "/v1/storage/updateHeader", postParams)
                        .catch(function (err) {
                            console.error("Failed to store on node:" + results[0][i], err);
                        })
                );
            }
        }
        return Promise.all(prom);
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
    var to = this.settings.contracts.storageAddress;
    let msg = new Date().getTime().toString();

    return this.web3Manager.send(to, data).then(done => {
        return storageContract.methods.getNodesForItem(id).call().then(nodes => {
            var prom = [];
            prom.push(this.identity.signMsg(msg));
            for (var i = 0; i < nodes.length; i++) {
                prom.push(
                    getNodeEndpoint(nodes[i])
                );
                prom.push(nodes[i]);
            }
            return Promise.all(prom);
        }).then(results => {

            let postParams = {
                id: id,
                v: results[0].v.toString(16),
                r: results[0].r.toString("hex"),
                s: results[0].s.toString("hex"),
                msg: msg
            };

            var prom = [];
            for (let i = 1; 2*i < results.length; i++) {
                if (isURL(results[2*i-1])) {
                    prom.push(
                        this.storage.postCustomStorageNode("https://" + results[2 * i - 1], "/v1/storage/delete", postParams)
                            .catch(function (err) {
                                console.error("Failed to remove on node:" + results[2*i-1] + ", address: " + results[2*i], err);
                            })
                    );
                }
            }
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
    return this.getIdForKey(key).then(id => {
        return this.remove(id);
    });
};


/**
 * Add another public key to access list for this given data hash
 *
 * @method addKeyToAccessList
 * @param {string} id hash of the data
 * @param {string} pubKey public key to add
 * @return {promise} promise
 */
Datum.prototype.addPublicKeyForData = function (id , pubKeyObject) {
    var accessWallet = utils.publicToAddress("0x" + pubKeyObject.publicKey);
    let pubKeyExists = [];

    return this.getHeader(id).then(header => {
        if (header.indexOf("||") != -1) {
            var headerparts = header.split("||");
            if (headerparts.length == 2) {
                header = JSON.parse(headerparts[1]);
                pubKeyExists = JSON.parse(headerparts[0]);
            }
        }
        pubKeyExists.push({ encryptionKey: pubKeyObject.encryptionKey, publicKey: pubKeyObject.publicKey });
        return Promise.all([pubKeyExists, this.identity.decrypt(header)]);
    }).then(results => {
        if (results.length != 2) throw new Error("Error decoding header");
        return this.encryptDataForPublicKeys(results[1], results[0]);
    }).then(encHeader => {
        let header = JSON.stringify(pubKeyExists) + "||" + JSON.stringify(encHeader);
        return this.updateHeader(id, header);
    }).then(response => {
        var data = TxDataProvider.addAccess(id, accessWallet);
        var to = settings.contracts.storageAddress;
        return this.web3Manager.send(to, data);
    });
};

/**
 * Remove another public address from access list for this given data hash
 *
 * @method removePublicKeyForData
 * @param {string} id hash of the data
 * @param {string} pubKey public key address to remove
 * @return {promise} promise
 */
Datum.prototype.removePublicKeyForData = function (id, pubKey) {

    //update smart contract
    let pubKeyExists = [];

    return this.getHeader(id).then(header => {
        if (header.indexOf("||") != -1) {
            var headerparts = header.split("||");
            if (headerparts.length == 2) {
                header = JSON.parse(headerparts[1]);
                pubKeyExists = JSON.parse(headerparts[0]);
            }
        }

        for(var i = 0; i < pubKeyExists.length;i++) {
            if(pubKeyExists[i].publicKey == pubKey)
            {
                pubKeyExists.splice(i, 1);
                break;
            }
        }

        return Promise.all([pubKeyExists, this.identity.decrypt(header)]);
    }).then(results => {
        if (results.length != 2) throw new Error("Error decoding header");
        return this.encryptDataForPublicKeys(results[1], results[0]);
    }).then(encHeader => {
        let header = JSON.stringify(pubKeyExists) + "||" + JSON.stringify(encHeader);
        return this.updateHeader(id, header);
    }).then(response => {
        var data = TxDataProvider.removeAccess(id, utils.publicToAddress("0x" + pubKey));
        var to = settings.contracts.storageAddress;
        return this.web3Manager.send(to, data);
    });
};


Datum.prototype.getHeader = function (id) {

    let data;
    let header;
    let msg = new Date().getTime().toString();

    return storageContract.methods.getNodesForItem(id).call().then(nodes => {

        var prom = [];
        for (var i = 0; i < nodes.length; i++) {
            prom.push(
                getNodeEndpoint(nodes[i])
            );
        }
        return Promise.all(prom);
    }).then(results => {
        return Promise.all([results, this.identity.signMsg(msg)]);
    }).then(([endpoints, signed]) => {
        let postParams = {
            id: id,
            v: signed.v.toString(16),
            r: signed.r.toString("hex"),
            s: signed.s.toString("hex"),
            msg: msg
        };
        return this.storage.postCustomStorageNodeSequentiallyIfFail(endpoints.map(endpoint => `https://${endpoint}`), "/v1/storage/downloadHeader", postParams);
    });
};



//#endregion Storage

//#region encryption

Datum.prototype.encryptDataForPublicKeys = function (data, publicKeyArray, password = "", accountIndex = 0) {
    return this.identity.encrypt(data, publicKeyArray, password, accountIndex);
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
        .call();
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
        .call();
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
        .call();
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
 * Get the deposited balance in contract for the given address in Datum Network
 *
 * @method getDepositBalance
 * @param {string} wallet wallet address
 * @return {Promise} Promise with balance in Wei
 */
Datum.getDepositBalance = function (wallet, toDat = false) {
    return storageContract.methods.getDepositBalance(wallet)
        .call()
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
        .call()
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
        .call();
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
    // static function doesn't have this, so cannot rely on this.privateMode
    // TODO on the refactor, know when to set private mode
    keyname = web3Static.utils.soliditySha3(wallet,keyname)

    return storageContract.methods.getActualIdForKey(wallet, web3Static.utils.toHex(keyname))
        .call();
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
    keyname = web3Static.utils.soliditySha3(wallet,keyname)
    return storageContract.methods.getIdsForAccountByKey(wallet, web3Static.utils.toHex(keyname))
        .call({ from: wallet});
};


/**
 * Get all nodes responible for an item
 *
 * @method getNodesForItem
 * @param {string} id id/hash of item
 * @return {Promise} Promise with balance in Wei
 */
Datum.getNodesForItem = function (id,wallet) {
    return storageContract.methods.getNodesForItem(id)
        .call({ from: wallet});
};

/**
 * Get count of all storage items in the contract
 *
 * @method totalItemsCount
 * @return {int} number of storage items in the contract
 */
Datum.totalItemsCount = function () {
    return storageContract.methods.getStorageItemCount()
        .call();
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
        .call();
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
        .call();
};


Datum.merkle = function (obj) {
    return merkle.createMerkle(obj);
};

Datum.encrypt = function (data, password) {
    var dataString = (toType(data) == "object") ? Base64.encode(JSON.stringify(data)) : Base64.encode(data);
    return Base64.encode(crypto.encrypt(dataString, password));
};

Datum.decrypt = function (obj, password) {
    var result = crypto.decrypt(Base64.decode(obj), password);
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
 * If no filter is specified, return all claims whose subject is the address provided
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
                key : c.returnValues.key,
                value : c.returnValues.value,
                timestamp: c.returnValues.updatedAt
            };
            return e;
        });
        return claims;
    });

};

/**
 * Return all claims related to this address, both by subject and by issuer
 * @param {string} wallet address
 * @return {Promise}
 */
Datum.getClaimsByAddress = function(address) {
  // Since filter for events doesn't support logical operator,
  // we have to query for subject and issuer separately and merge the results
  // https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#getpastevents
  // https://ethereum.stackexchange.com/a/19523
  return Promise.all([
    Datum.getClaims(address),
    Datum.getClaimsByIssuer(address)
  ]).then(claims => {
    return claims[0]
      .concat(claims[1])
      .sort((a, b) => a.timestamp > b.timestamp ? -1 : 1);
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
    ).call().then(v => {
        if (typeof v === 'undefined')
            return 'Claim not found.';
        // Value could be string or hex address
        try {
            let s = web3Static.utils.hexToUtf8(v);
            if (s.length === 0) return 'Claim not found';
            return s;
        } catch (e) {
            return v;
        }
    });
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
Datum.verifyClaim = function (issuer, subject, key) {
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

var isURL = function(str) {
    var pattern = new RegExp("^(https?:\\/\\/)?"+ // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|"+ // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))"+ // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*"+ // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?"+ // query string
    "(\\#[-a-z\\d_]*)?$","i"); // fragment locator
    return pattern.test(str);
};

module.exports = Datum;
