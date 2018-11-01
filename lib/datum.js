/*!
 * datum.js - Datum javascript API
 *
 * javascript api for datum blockchain
 *
 * @license
 * @see
*/
const { Base64 } = require('js-base64');
const Web3 = require('web3');

const Web3Provider = require('./web3/web3provider');
const StorageManager = require('./web3/storage');
const settings = require('./web3/settings');
const utils = require('./utils/utils');
const crypto = require('./utils/crypto');
const version = require('./version.json');
const merkle = require('./utils/merkle');
const DatumIdentity = require('./datumIdentity');
const TxDataProvider = require('./web3/txDataProvider.js');

let web3Static = new Web3(new Web3.providers.HttpProvider('https://node-5.megatron.datum.org/api'));
let storageCostsContract = new web3Static.eth.Contract(
  settings.contracts.storageCostsABI,
  settings.contracts.storageCostsAddress,
);
let storageContract = new web3Static.eth.Contract(
  settings.contracts.storageABI,
  settings.contracts.storageAddress,
);
let claimsContract = new web3Static.eth.Contract(
  settings.contracts.registryContractABI,
  settings.contracts.registryContractAddress,
);
let vaultContract = new web3Static.eth.Contract(
  settings.contracts.vaultContractABI,
  settings.contracts.vaultContractAddress,
);
let registratorContract = new web3Static.eth.Contract(
  settings.contracts.nodeRegistratorABI,
  settings.contracts.nodeRegistratorAddress,
);

// #endregion static functions
const toType = function toType(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

const isURL = function isURL(str) {
  const pattern = new RegExp('^(https?:\\/\\/)?' // protocol
    + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' // domain name
    + '((\\d{1,3}\\.){3}\\d{1,3}))' // OR ip (v4) address
    + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // port and path
    + '(\\?[;&a-z\\d%_.~+=-]*)?' // query string
    + '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return pattern.test(str);
};

/**
 * Claims Key & values must be strings not numbers nor string-numbers
 * @param {String} p parameter to check the type for
 * @return true
 */
function validateClaimParameterType(p) {
  if (typeof p === 'string' && Number.isNaN(parseInt(p, 10))) {
    return true;
  }
  throw new Error('Parameters of type Number/Number-String are not allowed in claims');
}

/**
 * Construct event object irregardless of type of event (claimSet,ClaimRemoved)
 * @param {Object} e  claim event object
 * @return {Object} custom claim object {key,ts,value}
 */
function getEventObj(e) {
  const rv = e.returnValues;
  return {
    key: rv.issuer + rv.subject + rv.key,
    ts: new Date(parseInt(typeof rv.updatedAt === 'undefined' ? rv.removedAt : rv.updatedAt, 10) * 1000),
    value: e,
  };
}

/**
 * Construct unique events object with latest TS(Time Stamp).
 * @param {Array} events array of claim events objects
 * @return {Object} Object that is constructed of custom keys [issuer+subject+key]
 */
function getClaimObjs(events) {
  const claims = {};
  events.forEach((e) => {
    const tmp = getEventObj(e);
    if (typeof claims[tmp.key] !== 'undefined' && tmp.ts > claims[tmp.key].ts) {
      claims[tmp.key] = { ts: tmp.ts, value: tmp.value };
    } else {
      claims[tmp.key] = { ts: tmp.ts, value: tmp.value };
    }
  });
  return claims;
}

/**
 * dataToHex - Convert data to hex string with size of multiple 64 byte
 *
 * @param  {type} data base64Data
 */
function dataToHex(data) {
  const hexStr = web3Static.utils.toHex(data);
  const strBytes = hexStr.length / 2;
  const multipleof64 = Math.ceil(strBytes / 64);
  return hexStr.padStart((multipleof64 * 64) * 2, '0');
}


function Datum() {
  this.version = {
    api: version.version,
  };
}

/**
 * Initialize the datum client given configuration
 *
 * @method initialize
 * @param {object} config configuration object with "network","storage","useFuelingServer"
 */
Datum.prototype.initialize = function initialize(config) {
  const cfg = {
    ...config,
    network: config.network || 'https://node-5.megatron.datum.org/api',
    storage: 'https://node-eu-west.datum.org/storage',
    defaultPublicKeys: [],
  };

  if (cfg.useFuelingServer === false) {
    this.useFuelingServer = false;
  } else {
    this.useFuelingServer = true;
  }

  if (cfg.privateMode === false) {
    this.privateMode = false;
  } else {
    this.privateMode = true;
  }


  if (cfg.settings !== undefined) {
    this.settings = cfg.settings;
  } else {
    this.settings = settings;
  }
  this.identity = new DatumIdentity(cfg.defaultPublicKeys);

  if (cfg.identity !== undefined) {
    this.identity.import(cfg.identity);
  }

  this.nodeSentMode = false;
  this.web3Manager = new Web3Provider(
    cfg.network,
    this.identity,
    this.settings,
    cfg.useFuelingServer,
  );
  this.storage = new StorageManager(cfg.network, cfg.storage, this.settings);


  // temp fix for incorrect static functions
  // TODO fix the static methods on how to get cfg.network -
  // can we make init mandatory before anything else?
  web3Static = new Web3(new Web3.providers.HttpProvider(cfg.network));
  storageCostsContract = new web3Static.eth.Contract(
    this.settings.contracts.storageCostsABI,
    this.settings.contracts.storageCostsAddress,
  );
  storageContract = new web3Static.eth.Contract(
    this.settings.contracts.storageABI,
    this.settings.contracts.storageAddress,
  );
  claimsContract = new web3Static.eth.Contract(
    this.settings.contracts.registryContractABI,
    this.settings.contracts.registryContractAddress,
  );
  vaultContract = new web3Static.eth.Contract(
    this.settings.contracts.vaultContractABI,
    this.settings.contracts.vaultContractAddress,
  );
  registratorContract = new web3Static.eth.Contract(
    this.settings.contracts.nodeRegistratorABI,
    this.settings.contracts.nodeRegistratorAddress,
  );
};


// #region Identity

/**
 * Import a serialized keystore to identity instance
 *
 * @method importIdentity
 * @param {string} serializedIdentity the serialized keystore that was exported
 */
Datum.prototype.importIdentity = function importIdentity(serializedIdentity) {
  this.identity.import(serializedIdentity);
};

/**
 * Export the actual keystore as serialized string
 *
 * @method exportIdentity
 * @return {string} the actual keystore serialized
 */
Datum.prototype.exportIdentity = function exportIdentity() {
  return this.identity.export();
};


/**
 * Set an DatumIdentity instance as actual identity
 *
 * @method setIdentity
 * @param {DatumIdentity} Datum identity instance
 */
Datum.prototype.setIdentity = function setIdentity(identity) {
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
Datum.prototype.createIdentity = function createIdentity(password, addressCount = 1) {
  return this.identity.new(password, addressCount);
};


// return new instance
Datum.prototype.Identity = function Identity() {
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
Datum.prototype.recoverIdentity = function recoverIdentity(seed, password, addressCount = 1) {
  return this.identity.recover(seed, password, addressCount);
};


/**
 * Gets the public key for given address index
 *
 * @method getIdentityPublicKey
 * @param {number} accountIndex address to use, default = 0
 * @return {Promise}
 */
Datum.prototype.getIdentityPublicKey = function getIdentityPublicKey(accountIndex = 0) {
  // return this.identity.getPublicKey(accountIndex);

  return this.identity.getPrivateKey(accountIndex).then(pk => utils.privateToPublic(`0x${pk}`).substr(2));
};


/**
 * Gets the public encryption key for given address index
 *
 * @method getEncryptionPublicKey
 * @param {number} accountIndex address to use, default = 0
 * @return {Promise}
 */
Datum.prototype.getEncryptionPublicKey = function getEncryptionPublicKey(accountIndex = 0) {
  return this.identity.getPublicKey(accountIndex);
};


/**
 * Gets the prirvate key for given address index
 *
 * @method getIdentityPrivateKey
 * @param {number} accountIndex address to use, default = 0
 * @return {Promise}
 */
Datum.prototype.getIdentityPrivateKey = function getIdentityPrivateKey(accountIndex = 0) {
  return this.identity.getPrivateKey(accountIndex);
};


/**
 * Get balance deposited in storage space for given address
 *
 * @method getDepositBalance
 * @param {address} address address to check balance for
 * @return {Promise}
 */
Datum.prototype.getDepositBalance = function getDepositBalance(address = null) {
  if (address == null) {
    address = this.identity.address;
  }

  if (address == null) return new Error('address must be provided or an identity must be set');

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
Datum.prototype.getStorageCosts = function getStorageCosts(size, duration) {
  return this.storage.getStorageCosts(size, duration);
};


/**
 * Get last item for given key name
 *
 * @method getIdForKey
 * @param {string} keyname key name to looup for
 * @return {Promise} Promise with balance in Wei
 */
Datum.prototype.getIdForKey = function getIdForKey(keyname, address = null) {
  const add = address === null ? this.identity.address : address;

  return this.storage.getIdForKey(keyname, add);
};


/**
 * Get all items for given wallet address under given keyname
 *
 * @method getIdsForKey
 * @param {string} keyname key name to looup for
 * @return {Promise} Promise with balance in Wei
 */
Datum.prototype.getIdsForKey = function getIdsForKey(keyname, address = null) {
  const add = address === null ? this.identity.address : address;

  return this.storage.getIdsForKey(keyname, add);
};


/**
 * Get the encrypted secret for a data item
 *
 * @method getEncryptionForId
 * @param {string} id if of the data item
 * @return {string} encrypted secret for data item
 */
Datum.prototype.getEncryptionForId = function getEncryptionForId(id) {
  return this.storage.getEncryptionForId(id).then(hexCoded => this.web3Manager.toUtf8(hexCoded));
};

/**
 * Create a new network identy contract where user can passtrough all transaction,
 * all transactions msg.sender will be proxy address!
 *
 * @method createProxyIdentity
 * @param {string} recovery [Optional] recovery address for identity,
 * if not provided first address in keystore is taken
 * @return {Promise}
 */
Datum.prototype.createProxyIdentity = function createProxyIdentity(recovery = null) {
  const data = TxDataProvider.getCreateNetworkIdentityData(
    this.identity.address, recovery == null ? this.identity.address : recovery,
  );
  const to = this.settings.contracts.identityManagerAddress;
  return this.web3Manager.send(to, data).then((txReceipe) => {
    if (txReceipe.status === true) {
      this.identity.proxy = `0x${txReceipe.logs[0].topics[1].substr(26)}`;
      return this.identity.proxy;
    }
    return new Promise().reject('error creating identy contract');
  });
};

// #endregion Identity

// #region Claims

/**
 * Add add claim to a user
 *
 * @method addClaim
 * @param {string} subject identity address to add the claim
 * @param {string} key the key value for the claim
 * @param {string} value storage address used for claim
 * @return {Promise}
 */
Datum.prototype.addClaim = function addClaim(subject, key, value) {
  // validateClaimParameterType(key) && validateClaimParameterType(value);
  validateClaimParameterType(key);

  const fixedMsg = `\x19Ethereum Signed Message:\n${value.length}${value}`;
  const fixedMsgSha = web3Static.utils.sha3(fixedMsg);

  return this.identity.signMsgHash(fixedMsgSha).then((signature) => {
    const data = TxDataProvider.getAddClaimData(subject, key, value, fixedMsgSha, signature.v, `0x${signature.r.toString('hex')}`, `0x${signature.s.toString('hex')}`);
    const to = this.settings.contracts.registryContractAddress;
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
Datum.prototype.removeClaim = function removeClaim(issuer, subject, key) {
  const data = TxDataProvider.getRemoveClaimData(issuer, subject, key);
  const to = this.settings.contracts.registryContractAddress;
  return this.web3Manager.send(to, data);
};


// #endregion Claims


// #region Noderegistraton
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
Datum.prototype.registerNode = function registerNode(
  endpoint,
  amount = 0,
  bandwidthType = 1,
  regionType = 1,
) {
  const data = TxDataProvider.getRegisterNodeData(endpoint, bandwidthType, regionType);
  const to = this.settings.contracts.nodeRegistratorAddress;
  return this.web3Manager.send(
    to,
    data,
    amount !== 0 ? this.web3Manager.toWei(amount.toString()) : 0,
  );
};


/**
 * Deposit the staking for a new storage node, can also be done directly on registerNode
 *
 * @method depositNodeStaking
 * @param {int} amount amount of staking provide to contract
 * @return {Promise}
 */
Datum.prototype.depositNodeStaking = function depositNodeStaking(amount = 1) {
  const data = TxDataProvider.getNodeDepositStaking();
  const to = this.settings.contracts.nodeRegistratorAddress;
  return this.web3Manager.send(
    to,
    data,
    amount !== 0 ? this.web3Manager.toWei(amount.toString()) : 0,
  );
};


/**
 * Get Storage Staking Balance
 *
 * @method getStorageStakeBalance
 * @param {int} amount amount of staking provide to contract
 * @return {Promise}
 */
Datum.prototype.getStorageStakeBalance = function getStorageStakeBalance() {
  return registratorContract.methods.getStakingBalance().call();
};

// #endregion Noderegistration

// #region Storage


/**
 * Deposit DAT tokens to storage contract
 *
 * @method deposit
 * @param {int} amount amount in DAT to deposit
 * @return {Promise}
 */
Datum.prototype.deposit = function deposit(amount) {
  const data = TxDataProvider.getStorageDepositData(this.identity.address);
  const to = this.settings.contracts.storageAddress;
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
Datum.prototype.forceStorageProof = function forceStorageProof(hash, address) {
  const data = TxDataProvider.getForceStorageProofData(hash, address);
  const to = settings.contracts.storageAddress;
  return this.web3Manager.send(to, data);
};


/**
 * Set storage node work status on given hash
 *
 * @method setWorkStatus
 * @param {string} hash id/hash of the item
 * @return {Promise}
 */
Datum.prototype.setWorkStatus = function setWorkStatus(hash) {
  const data = TxDataProvider.getSetWorkStatus(hash);
  const to = settings.contracts.storageAddress;
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
Datum.prototype.provideStorageProof = function provideStorageProof(
  dataHash,
  alpha,
  beta,
  gamma,
  delta,
  gammaABC,
  proofA,
  proofB,
  proofC,
) {
  const data = registratorContract.methods.Verify(
    dataHash,
    alpha,
    beta,
    gamma,
    delta,
    gammaABC,
    proofA,
    proofB,
    proofC,
  ).encodeABI();
  const to = settings.contracts.nodeRegistratorAddress;
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
Datum.prototype.provideMerkleProof = function provideMerkleProof(dataHash, data, chunkIndex) {
  const merkleProof = merkle.getProof(data, chunkIndex);
  var data = TxDataProvider.getGiveForcedStorageProof(dataHash, merkleProof.proof, merkleProof.hash);
  const to = settings.contracts.storageAddress;
  return this.web3Manager.send(to, data);
};


/**
 * Get list of failed storage proofs with hash und timestamp
 *
 * @method getFailedStorageProofs
 * @return {Promise}
 */
Datum.prototype.getFailedStorageProofs = function getFailedStorageProofs() {
  return registratorContract.methods.getFailedStorageProofs().call()
    .then(failedProofs => failedProofs);
};

/**
 * Estimate the rewards as storage node for actual identity
 *
 * @method estimateRewards
 * @return {number} reward in DAT (wei)
 */
Datum.prototype.estimateRewards = function estimateRewards() {
  return registratorContract.methods.estimateRewards().call().then(reward => reward);
};

/**
 * Withdrawal DAT tokens from storage contract
 *
 * @method withdrawal
 * @param {int} amount amount in DAT to withdraawal
 * @return {Promise}
 */
Datum.prototype.withdrawal = function withdrawal(amount) {
  return Datum.getBalance(this.identity.address)
    .then((balance) => {
      if (balance > 0) {
        const data = TxDataProvider.getStorageWithdrawalData(
          this.identity.address,
          this.web3Manager.toWei(amount.toString()),
        );
        const to = this.settings.contracts.storageAddress;
        return this.web3Manager.send(to, data);
      }
      return Promise.reject(new Error(`Insufficient storage Balance of ${balance}`));
    });
};


/**
 * Withdrawal DAT tokens to ethereum address, sends the Tokens to plasma contract
 *
 * @method withdrawalToEthereum
 * @param {string} receiver receiver wallet address in ethereum
 * @param {int} amount amount in DAT to transfer to ethereum
 * @return {Promise}
 */
Datum.prototype.withdrawalToEthereum = function withdrawalToEthereum(receiver, amount) {
  return Datum.getBalance(this.identity.address).then((balance) => {
    const amountBN = web3Static.utils.toBN(Web3.utils.toWei(amount.toString()));
    const balanceBN = web3Static.utils.toBN(balance);
    if (amountBN.gt(balanceBN)) {
      throw new Error(`You withdrawal request exceeds your total balance, requested: "${amount}" but your account has only : "${Web3.utils.fromWei(balance)}"`);
    }
    const data = TxDataProvider.getWithdrawalEthereum(receiver);
    const to = this.settings.contracts.datumPlasmaPOAAddress;
    return this.web3Manager.send(to, data, Web3.utils.toWei(amount.toString()));
  });
};


/**
 * Transfer ownership of an item to other address
 *
 * @method transferOwner
 * @param {string} id hash/id of data item to change ownership
 * @param {string} newOwner address of new owner
 * @return {Promise}
 */
Datum.prototype.transferOwner = function transferOwner(id, newOwner) {
  const data = TxDataProvider.getTransferOwnership(id, newOwner);
  const to = this.settings.contracts.storageAddress;
  return this.web3Manager.send(to, data, 0);
};


/**
 * Estimate the costs for a withdrawal to ethereum main.
 * Get's the actual gwei gasprice and returns costs in DAT
 *
 * @method estimateWithdrawalToEthereumCosts
 * @return {float} costs in DAT
 */
Datum.prototype.estimateWithdrawalToEthereumCosts = function estimateWithdrawalToEthereumCosts() {
  // default gas used for an ERC20 transactions
  const defaultMaxGas = 52007;

  return Promise.all([Datum.getEthereumMainnetGasPrice(),
    Datum.getDatValueInETH(),
  ])
    .then((results) => {
      if (results.length !== 2) {
        throw new Error('Invalid response when trying to fetch gas price');
      } else {
        const gasPrice = results[0];
        const datValue = results[1];
        const costsInEthWei = (gasPrice * defaultMaxGas);
        const datValueInWei = Web3.utils.toWei(datValue);
        return costsInEthWei / datValueInWei;
      }
    });
};


Datum.prototype.recoverAddress = function recoverAddress(msg, v, r, s) {
  return this.identity.recoverAddress(msg, v, r, s);
};

const getDataString = (data) => {
  if (toType(data) === 'string') {
    return Base64.encode(data);
  }

  if (toType(data) === 'object') {
    return Base64.encode(JSON.stringify(data));
  }

  return data.toString('base64');
};

/**
 * Get a package with txData, encrypted data and encryption header and a signature,
 * so a 3rd party can process the blockchain action
 *
 * @method setCreatePackage
 */
// eslint-disable-next-line no-unused-vars
Datum.prototype.setCreatePackage = function setCreatePackage(data, key = '0x', category = '', metadata = '', replicationMode = 1, pricacyLevel = 1, duration = 30, deposit = 0, publicKeysToAdd = []) {
  const dataString = getDataString(data);

  if (key !== '' && this.privateMode) {
    key = this.web3Manager.sha3(this.identity.address + key);
  }

  const password = crypto.createPassword(24);
  let encryptData = crypto.encrypt(dataString, password);
  const id = utils.hash(encryptData);

  // pad to 32 bytes chunk blocks
  encryptData = dataToHex(encryptData);
  const merkleRoot = merkle.getMerkleRoot(encryptData);
  const size = encryptData.length;


  return this.encryptDataForPublicKeys(password, publicKeysToAdd).then((enc) => {
    const pubWallets = [];
    for (let i = 0; i < publicKeysToAdd.length; i += 1) {
      pubWallets.push(utils.publicToAddress(publicKeysToAdd[i]));
    }
    const data = storageContract.methods.setStorage(
      this.identity.address,
      id,
      merkleRoot,
      web3Static.utils.toHex(key),
      size,
      replicationMode,
      pubWallets,
    ).encodeABI();
    return this.identity.signMsg(data).then(sig => ({
      id,
      txData: data,
      encryptedData: encryptData,
      header: enc,
      r: `0x${sig.r.toString('hex')}`,
      s: `0x${sig.s.toString('hex')}`,
      v: sig.v,
      meta: {
        key, category, merkleRoot, metadata, replicationMode, pricacyLevel, duration,
      },
    }));
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
Datum.prototype.setFromPackage = function setFromPackage(
  id,
  txData,
  encryptedData,
  header,
  meta,
  deposit = 0,
) {
  const to = settings.contracts.storageAddress;
  return this.web3Manager.send(to, txData, deposit)
    .then(() => {
      const msg = new Date().getTime().toString();
      return this.identity.signMsg(msg).then((signed) => {
        const postParams = {
          id,
          v: signed.v.toString(16),
          r: signed.r.toString('hex'),
          s: signed.s.toString('hex'),
          msg,
          data: `${JSON.stringify(header)}||${encryptedData}`,
          category: meta.category,
          merkle: meta.merkleRoot,
          metadata: meta.metadata,
          replicationMode: meta.replicationMode,
          duration: meta.duration,
          privacy: meta.pricacyLevel,
          key: meta.key,
        };
        return this.storage.postStorageNode('/v1/storage/store', postParams);
      });
    });
};


/**
 * HexToData - convert hex string to encrypted data object
 *
 * @param  {String} paddedHexStr hex padded string to convert it's size to multiple of 64 byte
 * @return {Object} Encrypted data object
 */
function HexToData(paddedHexStr) {
  const hexStr = paddedHexStr.replace(/[0]*x/, '0x');
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
 * getNodeLists - Convert array of nodeEndpoints to list of objects {endpoint, address}
 *
 * @param  {Array} nodeEndpoints a
 * @return {Array} Array of objects {endpoint,address}
 */
function getNodeLists(nodeEndpoints) {
  const tmp = nodeEndpoints.slice().splice(1);
  const nodes = [];
  for (let i = 0; i < tmp.length; i += 2) {
    if (isURL(tmp[i])) {
      nodes.push({
        endpoint: tmp[i],
        address: tmp[i + 1],
      });
    }
  }
  return nodes;
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
 * @param  {Number} publicKeysToAdd list of public key object (publicKey/encryptionKey)
 *                  for 3rd party access or if owner is different [optional]
 * @return {Promise} Promise
 */
Datum.prototype.set = function set(data, key = '_def_', category = '', metadata = '', replicationMode = 1, pricacyLevel = 1, duration = 30, deposit = 0, owner = '', publicKeysToAdd = []) {
  const dataString = getDataString(data);

  if (key !== '_def_' && this.privateMode) {
    key = this.web3Manager.sha3(this.identity.address + key);
  }

  const password = crypto.createPassword(24);
  let encryptData = crypto.encrypt(dataString, password);
  const id = utils.hash(encryptData);

  // pad to 32 bytes chunk blocks
  encryptData = dataToHex(encryptData);
  const merkleRoot = merkle.getMerkleRoot(encryptData);
  const size = encryptData.length;


  return Promise
    .all([
      this.getDepositBalance(this.identity.address),
      this.getStorageCosts(dataString.length, duration),
    ])
    .then((args) => {
      if (parseInt(args[0], 10) < parseInt(args[1], 10)) throw Error('insufficient balance, please make a deposit first');

      const pubWallets = [];
      for (let i = 0; i < publicKeysToAdd.length; i += 1) {
        pubWallets.push(utils.publicToAddress(`0x${publicKeysToAdd[i].publicKey}`));
      }

      // if other owner add to access list
      if (owner !== '' && owner !== this.identity.address) {
        pubWallets.push(this.identity.address);
      }


      // get data part of tx
      const data = storageContract.methods.setStorage(owner === '' ? this.identity.address : owner, id, merkleRoot, web3Static.utils.toHex(key), size, replicationMode, pubWallets).encodeABI();
      const to = this.settings.contracts.storageAddress;

      // sent over web3 or node
      if (!this.nodeSentMode) {
        return this.web3Manager.send(to, data, deposit);
      }
      return Promise.resolve(false);
    })
    .then((tx) => {
      if (tx !== false && tx.logs.length <= 2) throw new Error('Error selection storage nodes');
      // for encryption, all public keys need to be compressed, checking
      return this.encryptDataForPublicKeys(password, publicKeysToAdd)
        .then((encryptedSecret) => {
          const nodeLogStartIndex = tx.logs.length - 3;
          storageContract.inputs = [{ indexed: false, name: 'dataHash', type: 'bytes32' }, { indexed: false, name: 'addresses', type: 'address' }];
          // eslint-disable-next-line no-underscore-dangle
          const mainNode = storageContract._decodeEventABI({
            data: tx.logs[nodeLogStartIndex].data,
          }).returnValues.addresses;
          // eslint-disable-next-line no-underscore-dangle
          const node1 = storageContract._decodeEventABI({
            data: tx.logs[nodeLogStartIndex + 1].data,
          }).returnValues.addresses;
          // eslint-disable-next-line no-underscore-dangle
          const node2 = storageContract._decodeEventABI({
            data: tx.logs[nodeLogStartIndex + 2].data,
          }).returnValues.addresses;

          return Promise.all([
            Promise.resolve(encryptedSecret),
            getNodeEndpoint(mainNode),
            Promise.resolve(mainNode),
            getNodeEndpoint(node1),
            Promise.resolve(node1),
            getNodeEndpoint(node2),
            Promise.resolve(node2),
          ]);
        }).then((results) => {
          if (results.length !== 7) throw new Error('Error getting endpoint from contract');
          const msg = new Date().getTime().toString();
          return this.identity.signMsg(msg).then((signed) => {
            const postParams = {
              id,
              v: signed.v.toString(16),
              r: signed.r.toString('hex'),
              s: signed.s.toString('hex'),
              msg,
              header: `${JSON.stringify(publicKeysToAdd)}||${JSON.stringify(results[0])}`,
              merkle: merkleRoot,
              data: encryptData,
              category,
              metadata,
              replicationMode,
              privacy: pricacyLevel,
              key,
            };
            const nodes = getNodeLists(results);
            const prom = nodes.map(node => this.storage.postCustomStorageNode(`https://${node.endpoint}`, '/v1/storage/store', postParams)
              .catch((err) => {
                console.error(`Failed to store on node:${node.endpoint}, address: ${node.address}`, err);
              }));
            return Promise.all(prom);
          }).then((results) => {
            // TODO: replace logic with code that compare results with number of nodes returned
            // instead of fixed index
            // if (results.length !== 3) throw new Error("Error sending to nodes failed");

            if (results.indexOf(undefined) !== -1) {
              console.log('at least one upload to a server failed. check error console');
            }
            if (results[0] === undefined && results[1] === undefined && results[2] === undefined) {
              throw new Error('Uploading to all nodes failed! Plesae check log in console');
            }
            return results.filter(v => typeof v !== 'undefined')[0];
          });
        });
    });
};

Datum.prototype.get = function get(id) {
  const msg = new Date().getTime().toString();

  return storageContract.methods.getNodesForItem(id).call().then((nodes) => {
    const prom = [];
    prom.push(this.identity.signMsg(msg));
    for (let i = 0; i < nodes.length; i += 1) {
      prom.push(
        getNodeEndpoint(nodes[i]),
      );
      prom.push(nodes[i]);
    }
    return Promise.all(prom);
  }).then(async (results) => {
    const postParams = {
      id,
      v: results[0].v.toString(16),
      r: results[0].r.toString('hex'),
      s: results[0].s.toString('hex'),
      msg,
    };

    for (let i = 1; 2 * i < results.length; i += 1) {
      const nodeEndpoint = results[2 * i - 1];
      const nodeAddress = results[2 * i];

      if (isURL(nodeEndpoint)) {
        let p = null;
        try {
          p = await Promise.all([
            this.storage.postCustomStorageNode(`https://${nodeEndpoint}`, '/v1/storage/download', postParams),
            this.storage.postCustomStorageNode(`https://${nodeEndpoint}`, '/v1/storage/downloadHeader', postParams),
          ]);
        } catch (err) {
          console.error(`Failed to get on node:${nodeEndpoint}, address: ${nodeAddress}`, err);
          continue;
        }

        let header = p[1];
        if (header.indexOf('||') !== -1) {
          const headerparts = header.split('||');
          if (headerparts.length === 2) {
            header = JSON.parse(headerparts[1]);
          }
        }
        return Base64.decode(await crypto.decrypt(HexToData(p[0]), await this.identity.decrypt(header)));
      }
    }
    throw new Error('error downloading content');
  });
};

Datum.prototype.updateHeader = function updateHeader(id, header) {
  const msg = new Date().getTime().toString();
  return storageContract.methods.getNodesForItem(id).call().then((nodes) => {
    const prom = [];
    for (let i = 0; i < nodes.length; i += 1) {
      prom.push(
        getNodeEndpoint(nodes[i]),
      );
    }
    return Promise.all(prom);
  }).then(results => Promise.all([results, this.identity.signMsg(msg)]))
    .then((results) => {
      const postParams = {
        id,
        header,
        v: results[1].v.toString(16),
        r: results[1].r.toString('hex'),
        s: results[1].s.toString('hex'),
        msg,
      };

      const prom = [];
      for (let i = 1; i < results[0].length; i += 1) {
        if (isURL(results[0][i])) {
          prom.push(
            this.storage.postCustomStorageNode(`https://${results[0][i]}`, '/v1/storage/updateHeader', postParams)
              .catch((err) => {
                console.error(`Failed to store on node:${results[0][i]}`, err);
              }),
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
Datum.prototype.getWithKey = function getWithKey(key) {
  const keyname = this.privateMode
    ? this.web3Manager.sha3(this.identity.address + key)
    : key;
  return this.getIdForKey(keyname).then(id => this.get(id));
};


/**
 * Remove some data from storage
 *
 * @method remove
 * @param {string} id hash of the data
 * @return {promise} promise
 */
Datum.prototype.remove = function remove(id) {
  const data = TxDataProvider.getRemoveData(this.identity.address, id);
  const to = this.settings.contracts.storageAddress;
  const msg = new Date().getTime().toString();

  return this.web3Manager.send(to, data).then(() => (
    storageContract.methods.getNodesForItem(id).call().then((nodes) => {
      const prom = [];
      prom.push(this.identity.signMsg(msg));
      for (let i = 0; i < nodes.length; i += 1) {
        prom.push(
          getNodeEndpoint(nodes[i]),
        );
        prom.push(nodes[i]);
      }
      return Promise.all(prom);
    }).then((results) => {
      const postParams = {
        id,
        v: results[0].v.toString(16),
        r: results[0].r.toString('hex'),
        s: results[0].s.toString('hex'),
        msg,
      };

      const prom = [];
      for (let i = 1; 2 * i < results.length; i += 1) {
        if (isURL(results[2 * i - 1])) {
          prom.push(
            this.storage.postCustomStorageNode(`https://${results[2 * i - 1]}`, '/v1/storage/delete', postParams)
              .catch((err) => {
                console.error(`Failed to remove on node:${results[2 * i - 1]}, address: ${results[2 * i]}`, err);
              }),
          );
        }
      }
    })
  ));
};

/**
 * Remove some data from storage
 *
 * @method removeByKey
 * @param {string} key keyname
 * @return {promise} promise
 */
Datum.prototype.removeByKey = function removeByKey(key) {
  const keyname = this.privateMode
    ? this.web3Manager.sha3(this.identity.address + key)
    : key;
  return this.getIdForKey(keyname).then(id => this.remove(id));
};


/**
 * Add another public key to access list for this given data hash
 *
 * @method addKeyToAccessList
 * @param {string} id hash of the data
 * @param {string} pubKey public key to add
 * @return {promise} promise
 */
Datum.prototype.addPublicKeyForData = function addPublicKeyForData(id, pubKeyObject) {
  // update smart contract

  const accessWallet = utils.publicToAddress(`0x${pubKeyObject.publicKey}`);
  let pubKeyExists = [];

  return this.getHeader(id).then((header) => {
    if (header.indexOf('||') !== -1) {
      const headerparts = header.split('||');
      if (headerparts.length === 2) {
        header = JSON.parse(headerparts[1]);
        pubKeyExists = JSON.parse(headerparts[0]);
      }
    }
    pubKeyExists.push({
      encryptionKey: pubKeyObject.encryptionKey,
      publicKey: pubKeyObject.publicKey,
    });
    return Promise.all([pubKeyExists, this.identity.decrypt(header)]);
  }).then((results) => {
    if (results.length !== 2) throw new Error('Error decoding header');
    return this.encryptDataForPublicKeys(results[1], results[0]);
  }).then((encHeader) => {
    const header = `${JSON.stringify(pubKeyExists)}||${JSON.stringify(encHeader)}`;
    return this.updateHeader(id, header);
  })
    .then(() => {
      const data = TxDataProvider.addAccess(id, accessWallet);
      const to = settings.contracts.storageAddress;
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
Datum.prototype.removePublicKeyForData = function removePublicKeyForData(id, pubKey) {
  // update smart contract
  let pubKeyExists = [];

  return this.getHeader(id).then((header) => {
    if (header.indexOf('||') !== -1) {
      const headerparts = header.split('||');
      if (headerparts.length === 2) {
        header = JSON.parse(headerparts[1]);
        pubKeyExists = JSON.parse(headerparts[0]);
      }
    }

    for (let i = 0; i < pubKeyExists.length; i += 1) {
      if (pubKeyExists[i].publicKey === pubKey) {
        pubKeyExists.splice(i, 1);
        break;
      }
    }

    return Promise.all([pubKeyExists, this.identity.decrypt(header)]);
  }).then((results) => {
    if (results.length !== 2) throw new Error('Error decoding header');
    return this.encryptDataForPublicKeys(results[1], results[0]);
  }).then((encHeader) => {
    const header = `${JSON.stringify(pubKeyExists)}||${JSON.stringify(encHeader)}`;
    return this.updateHeader(id, header);
  })
    .then(() => {
      const data = TxDataProvider.removeAccess(id, utils.publicToAddress(`0x${pubKey}`));
      const to = settings.contracts.storageAddress;
      return this.web3Manager.send(to, data);
    });
};


Datum.prototype.getHeader = function getHeader(id) {
  const msg = new Date().getTime().toString();

  return storageContract.methods.getNodesForItem(id).call().then((nodes) => {
    const prom = [];
    for (let i = 0; i < nodes.length; i += 1) {
      prom.push(
        getNodeEndpoint(nodes[i]),
      );
    }
    return Promise.all(prom);
  }).then(results => Promise.all([results, this.identity.signMsg(msg)]))
    .then(([endpoints, signed]) => {
      const postParams = {
        id,
        v: signed.v.toString(16),
        r: signed.r.toString('hex'),
        s: signed.s.toString('hex'),
        msg,
      };
      return this.storage.postCustomStorageNodeSequentiallyIfFail(endpoints.map(endpoint => `https://${endpoint}`), '/v1/storage/downloadHeader', postParams);
    });
};


// #endregion Storage

// #region encryption

Datum.prototype.encryptDataForPublicKeys = function encryptDataForPublicKeys(data, publicKeyArray, password = '', accountIndex = 0) {
  return this.identity.encrypt(data, publicKeyArray, password, accountIndex);
};

Datum.prototype.decryptData = function decryptData(enc, password = '', accountIndex = 0) {
  return this.identity.decrypt(enc, password, accountIndex);
};

// #endregion encryption

// #region static functions


/**
 * Create a new identity/keystore with given password, default 1 address is created in keystore
 *
 * @method createIdentity
 * @param {string} password password to encrypt the keystore
 * @param {number} addressCount [Optional] amount of address created, default = 1
 * @return {Promise}
 */
Datum.createIdentity = function createIdentity(password, addressCount = 1) {
  const d = new DatumIdentity();
  return d.new(password, addressCount)
    .then(result => ({ seed: result.seed, keystore: d.export() }));
};

/**
 * Calculate storage costs based on size and storage duration
 *
 * @method getStorageCosts
 * @param {int} size size in bytes
 * @param {int} duration duration in days
 * @return {BigInt} costs in DATCoins (wei)
 */
Datum.getStorageCosts = function getStorageCosts(size, duration) {
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
Datum.getTrafficCostsGB = function getTrafficCostsGB(volume) {
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
Datum.getTrafficCosts = function getTrafficCosts(size, downloads) {
  return storageCostsContract.methods.getTrafficCosts(size, downloads)
    .call();
};


/**
 * Gets the actual value for 1 DAT in USD, readout from smart contract
 *
 * @method getDATRate
 * @return {float} value of 1 DAT in USD
 */
Datum.getDATRate = function getDATRate() {
  return storageCostsContract.methods.getDollarRate()
    .call().then(rate => rate / 1000000);
};


/* END STORAGE COSTS */


/**
 * Get the Balance for given address in Datum Network, combined real balance and virtual balance
 *
 * @method getBalance
 * @param {string} wallet wallet address
 * @return {Promise} Promise with balance in Wei
 */
Datum.getBalance = function getBalance(wallet, toDat = false) {
  return Promise.all([
    web3Static.eth.getBalance(wallet),
    Datum.getVirtualBalance(wallet),
  ])
    .then((results) => {
      if (results.length !== 2) {
        throw new Error('Error receiving balances from contracts');
      } else {
        const realBalance = web3Static.utils.toBN(results[0]);
        const virtualBalance = web3Static.utils.toBN(results[1]);
        const totalBalance = realBalance.add(virtualBalance);
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
Datum.getDepositBalance = function getDepositBalance(wallet, toDat = false) {
  return storageContract.methods.getDepositBalance(wallet)
    .call()
    .then(balance => (toDat ? web3Static.utils.fromWei(balance) : balance));
};

/**
 * Get the virtual balance hold in vault contract
 *
 * @method getVirtualBalance
 * @param {string} wallet wallet address
 * @return {Promise} Promise with balance in Wei
 */
Datum.getVirtualBalance = function getVirtualBalance(wallet) {
  return vaultContract.methods.getBalance(wallet)
    .call()
    .then(balance => balance);
};

/**
 * Get all items for given wallet address
 *
 * @method getIds
 * @param {string} wallet wallet address
 * @return {Promise} Promise with balance in Wei
 */
Datum.getIds = function getIds(wallet) {
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
Datum.getLastIdForKey = function getLastIdForKey(wallet, keyname) {
  // static function doesn't have this, so cannot rely on this.privateMode
  // TODO on the refactor, know when to set private mode
  const key = web3Static.utils.sha3(wallet + keyname);

  return storageContract.methods.getActualIdForKey(wallet, web3Static.utils.toHex(key))
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
Datum.getIdsForKey = function getIdsForKey(wallet, keyname) {
  const key = web3Static.utils.sha3(wallet + keyname);
  return storageContract.methods.getIdsForAccountByKey(wallet, web3Static.utils.toHex(key))
    .call({ from: wallet });
};


/**
 * Get all nodes responible for an item
 *
 * @method getNodesForItem
 * @param {string} id id/hash of item
 * @return {Promise} Promise with balance in Wei
 */
Datum.getNodesForItem = function getNodesForItem(id, wallet) {
  return storageContract.methods.getNodesForItem(id)
    .call({ from: wallet });
};

/**
 * Get count of all storage items in the contract
 *
 * @method totalItemsCount
 * @return {int} number of storage items in the contract
 */
Datum.totalItemsCount = function totalItemsCount() {
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
Datum.getItem = function getItem(hash) {
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
Datum.canAccess = function canAccess(id, address) {
  return storageContract.methods.canKeyAccessData(id, address)
    .call();
};


Datum.merkle = function createMerkle(obj) {
  return merkle.createMerkle(obj);
};

Datum.encrypt = function encrypt(data, password) {
  const dataString = (toType(data) === 'object') ? Base64.encode(JSON.stringify(data)) : Base64.encode(data);
  return Base64.encode(crypto.encrypt(dataString, password));
};

Datum.decrypt = function decrypt(obj, password) {
  const result = crypto.decrypt(Base64.decode(obj), password);
  let ret = Base64.decode(result);
  if (ret === 'undefined') {
    ret = JSON.parse(ret);
  }
  return ret;
};

Datum.encryptWithPublicKey = function encryptWithPublicKey(data, publicKey) {
  const dataString = (toType(data) === 'object') ? JSON.stringify(data) : data;
  const paddedPublicKey = publicKey.length > 2 && publicKey.substr(0, 2) !== '0x'
    ? `0x${publicKey}`
    : publicKey;
  return crypto.ethEncrypt(dataString, paddedPublicKey);
};

Datum.decryptWithPrivateKey = function decryptWithPrivateKey(obj, privateKey) {
  const result = crypto.ethDecrypt(obj, privateKey);
  return result;
};

/**
 * Get All claims by issuer
 */
Datum.getClaimsByIssuer = function getClaimsByIssuer(address) {
  return Datum.getClaims(address, { issuer: address });
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
Datum.getClaims = function getClaims(address, filter) {
  const opts = {
    filter: typeof filter === 'undefined' ? { subject: address } : filter,
    fromBlock: 0,
    toBlock: 'latest',
  };

  return Promise.all([
    claimsContract.getPastEvents('ClaimSet', opts),
    claimsContract.getPastEvents('ClaimRemoved', opts),
  ]).then((events) => {
    const savedClaims = getClaimObjs(events[0]);
    const removedClaims = getClaimObjs(events[1]);
    const diff = Object.keys(savedClaims)
      .filter(key => typeof removedClaims[key] === 'undefined' || removedClaims[key].ts < savedClaims[key].ts)
      .map(key => savedClaims[key].value);
    const claims = diff.map(c => ({
      issuer: c.returnValues.issuer,
      subject: c.returnValues.subject,
      key: c.returnValues.key,
      value: c.returnValues.value,
      timestamp: c.returnValues.updatedAt,
    }));
    return claims;
  });
};

/**
 * Return all claims related to this address, both by subject and by issuer
 * @param {string} wallet address
 * @return {Promise}
 */
Datum.getClaimsByAddress = function getClaimsByAddress(address) {
  // Since filter for events doesn't support logical operator,
  // we have to query for subject and issuer separately and merge the results
  // https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#getpastevents
  // https://ethereum.stackexchange.com/a/19523
  return Promise.all([
    Datum.getClaims(address),
    Datum.getClaimsByIssuer(address),
  ]).then(claims => claims[0]
    .concat(claims[1])
    .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1)));
};

/**
 * get a single claim by given issuer, subject, key
 *
 * @method getClaim
 * @param {string} issuer issuer of the claim
 * @param {string} subject subject of the claim is about
 * @param {string} key key value for the claim
 * @return {Promise}
 */
Datum.getClaim = function getClaim(issuer, subject, key) {
  validateClaimParameterType(key);
  return claimsContract.methods.getClaim(issuer, subject,
    web3Static.utils.toHex(key)).call().then((v) => {
    if (typeof v === 'undefined' || web3Static.utils.hexToUtf8(v).length === 0) return 'Claim not found.';
    return v;
  });
};

/**
 * verify a claim and checks if the issuer is also the signer, returns true/false
 *
 * @method verifyClaim
 * @param {string} address identity address to get the claims from
 * @return {Promise}
 */
Datum.verifyClaim = function verifyClaim(issuer, subject, key) {
  return claimsContract.methods.verifyClaim(issuer, subject, web3Static.utils.toHex(key))
    .call();
};


/**
 * Gets the actual safeLow gasprice from ethereum mainnet over ethgasstation api
 *
 * @method getEthereumGasPrice
 * @return {int} actual safeLow gasPrice in wei
 */
Datum.getEthereumMainnetGasPrice = function getEthereumMainnetGasPrice() {
  return Web3Provider.getEthereumGasPrice();
};

/**
 * Gets the actual value of 1 DAT in ETH
 *
 * @method getDatValueInETH
 * @return {float} actual price of 1 DAT in ETH
 */
Datum.getDatValueInETH = function getDatValueInETH() {
  return Web3Provider.getDatValueInETH();
};

module.exports = Datum;
