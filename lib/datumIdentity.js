/*!
 * datumIdentity.js - Datum Identity
 *
 * javascript api for datum blockchain
 *
 * @license
 * @see
*/


const lightwallet = require('eth-lightwallet');
const mnid = require('mnid');

const { signing } = lightwallet;
const { encryption } = lightwallet;
const settings = require('./web3/settings');

function DatumIdentity(defaultPublicKeys = []) {
  this.proxy = '';
  this.defaultPublicKeys = defaultPublicKeys;
}


// public getters
DatumIdentity.prototype = {
  get mnid() {
    if (this.keystore) {
      return mnid.encode({
        network: settings.network.network_name,
        address: this.keystore.getAddresses()[0],
      });
    }
    return null;
  },
  get did() {
    if (this.keystore) {
      return `did:datum:${this.mnid}`;
    }
    return null;
  },
  get address() {
    if (this.keystore) {
      return this.keystore.getAddresses()[0];
    }
    return null;
  },
  get addresses() {
    if (this.keystore) {
      return this.keystore.getAddresses();
    }
    return null;
  },
};


/**
 * Export keystore
 *
 * @method export
 * @return {string} serialize encrypted keystore
 */
DatumIdentity.prototype.export = function exportIdentity() {
  const serializedKeyStore = this.keystore.serialize();
  if (this.proxy !== '') {
    serializedKeyStore.proxy = this.proxy;
  }
  return serializedKeyStore;
};


/**
 * import keystore
 *
 * @method import
 * @param {string} serialized_keystore serialized keystore as string
 */
DatumIdentity.prototype.import = function importIdentity(serializedKeystore) {
  this.keystore = lightwallet.keystore.deserialize(serializedKeystore);

  try {
    const j = JSON.parse(serializedKeystore);
    if (j.proxy != null) {
      this.proxy = j.proxy;
    }
  } catch (error) {
    throw error;
  }
};


/**
 * Stores the password for identity, if not set needed for every private key access
 *
 * @method storePassword
 * @param {string} password password to unlock the keystore
 */
DatumIdentity.prototype.storePassword = function storePassword(password) {
  this.password = password;
};


/**
 * sign
 *
 * @method recoverAddress
 * @param {string} msg msg to sign
 * @param {string} v
 * @param {string} r
 * @param {string} s
 */
DatumIdentity.prototype.recoverAddress = function recoverAddress(msg, v, r, s) {
  const g = signing.recoverAddress(msg, v, r, s);
  return `0x${g.toString('hex')}`;
};

/**
 * sign
 *
 * @method signMsg
 * @param {string} msg msg to sign
 * @param {string} password needed of not provided to class with setPassword
 */
DatumIdentity.prototype.signMsg = function signMsg(msg, password = '', accountIndex = 0) {
  return new Promise((resolve, reject) => {
    if (this.password === undefined && password === '') {
      reject(new Error('provide password either in class or with method'));
    }

    const ks = this.keystore;
    ks.keyFromPassword(password === '' ? this.password : password, (err, pwDerivedKey) => {
      if (err) {
        reject(err);
      }

      resolve(signing.signMsg(ks, pwDerivedKey, msg, ks.getAddresses()[accountIndex]));
    });
  });
};


/**
 * sign a hash
 *
 * @method signMsgHash
 * @param {string} msg msg to sign
 * @param {string} password needed of not provided to class with setPassword
 */
DatumIdentity.prototype.signMsgHash = function signMsgHash(msg, password = '', accountIndex = 0) {
  return new Promise((resolve, reject) => {
    if (this.password === undefined && password === '') {
      reject(new Error('provide password either in class or with method'));
    }

    const ks = this.keystore;
    ks.keyFromPassword(password === '' ? this.password : password, (err, pwDerivedKey) => {
      if (err) {
        reject(err);
      }

      resolve(signing.signMsgHash(ks, pwDerivedKey, msg, ks.getAddresses()[accountIndex]));
    });
  });
};


/**
 * sign
 *
 * @method signTx
 * @param {string} tx tx to sign
 * @param {string} password needed of not provided to class with setPassword
 */
DatumIdentity.prototype.signTx = function signTx(tx, password = '', accountIndex = 0) {
  return new Promise((resolve, reject) => {
    if (this.password === undefined && password === '') {
      reject(new Error('provide password either in class or with method'));
    }

    const ks = this.keystore;
    ks.keyFromPassword(password === '' ? this.password : password, (err, pwDerivedKey) => {
      if (err) {
        reject(err);
      }

      resolve(signing.signTx(ks, pwDerivedKey, tx, ks.getAddresses()[accountIndex]));
    });
  });
};


DatumIdentity.prototype.getPublicKey = function getPublicKey(accountIndex = 0, password = '') {
  return new Promise((resolve, reject) => {
    if (this.password === undefined && password === '') {
      reject(new Error('provide password either in class or with method'));
    }

    const ks = this.keystore;
    const add = this.addresses[accountIndex];
    ks.keyFromPassword(password === '' ? this.password : password, (err, pwDerivedKey) => {
      if (err) {
        reject(err);
      }
      resolve(encryption.addressToPublicEncKey(ks, pwDerivedKey, add));
    });
  });
};

DatumIdentity.prototype.getPrivateKey = function getPrivateKey(accountIndex = 0, password = '') {
  return new Promise((resolve, reject) => {
    if (this.password === undefined && password === '') {
      reject(new Error('provide password either in class or with method'));
    }

    const ks = this.keystore;
    const add = this.addresses[accountIndex];
    ks.keyFromPassword(password === '' ? this.password : password, (err, pwDerivedKey) => {
      if (err) {
        reject(err);
      }
      resolve(ks.exportPrivateKey(add, pwDerivedKey));
    });
  });
};


DatumIdentity.prototype.encrypt = function encrypt(msg, pubKeyArray, password = '', accountIndex = 0) {
  return new Promise((resolve, reject) => {
    if (this.password === undefined && password === '') {
      reject(new Error('provide password either in class or with method'));
    }

    const ks = this.keystore;
    const add = this.addresses[accountIndex];
    const pk = this.defaultPublicKeys;

    ks.keyFromPassword(password === '' ? this.password : password, (err, pwDerivedKey) => {
      if (err) {
        reject(err);
      }

      const pubKeysToAdd = [];

      for (let i = 0; i < pk.length; i += 1) {
        pubKeysToAdd.push(pk[i]);
      }


      for (let i = 0; i < pubKeyArray.length; i += 1) {
        pubKeysToAdd.push(pubKeyArray[i].encryptionKey);
      }

      // add sender
      pubKeysToAdd.push(encryption.addressToPublicEncKey(ks, pwDerivedKey, add));

      const signed = encryption.multiEncryptString(ks, pwDerivedKey, msg, add, pubKeysToAdd);
      signed.signer = add;
      signed.publicKey = encryption.addressToPublicEncKey(ks, pwDerivedKey, add);
      resolve(signed);
    });
  });
};


DatumIdentity.prototype.decrypt = function decrypt(encMsg, password = '', accountIndex = 0) {
  return new Promise((resolve, reject) => {
    if (this.password === undefined && password === '') {
      reject(new Error('provide password either in class or with method'));
    }

    const ks = this.keystore;
    const add = this.addresses[accountIndex];

    ks.keyFromPassword(password === '' ? this.password : password, (err, pwDerivedKey) => {
      if (err) {
        reject(err);
      }
      const pub = encryption.addressToPublicEncKey(ks, pwDerivedKey, add);
      const t = encryption.multiDecryptString(
        ks,
        pwDerivedKey,
        encMsg,
        encMsg.publicKey !== undefined ? encMsg.publicKey : pub,
        add,
      );
      resolve(t);
    });
  });
};

/**
 * recover key store
 *
 * @method recover
 * @param {string} seed the original seed , 12 words
 * @return {object} returns object with first address recovered from keystore
 */
DatumIdentity.prototype.recover = function recover(seed, newPassword, addressCount = 1) {
  return new Promise((resolve, reject) => {
    lightwallet.keystore.createVault({
      password: newPassword,
      seedPhrase: seed,
      hdPathString: "m/44'/60'/0'/0",
    }, (createVaultErr, ks) => {
      ks.keyFromPassword(newPassword, (keyFromPasswordErr, pwDerivedKey) => {
        if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
          reject(new Error('Incorrect derived key!'));
        }

        try {
          ks.generateNewAddress(pwDerivedKey, addressCount);
        } catch (err) {
          console.log(err);
          console.trace();
        }
        resolve(ks);
      });
    });
  }).then((ks) => {
    this.keystore = ks;
    const addresses = ks.getAddresses();
    return { addresses };
  });
};


/**
 * new keystore
 *
 * @method new
 * @param {string} password create a new keystore with given password, seed words generated random
 * @return {object} returns object with first address recovered from keystore,
 * and used seed to create the keystore
 */
DatumIdentity.prototype.new = function newIdentity(password, address_count = 1) {
  const seed = lightwallet.keystore.generateRandomSeed();

  return new Promise((resolve, reject) => {
    lightwallet.keystore.createVault({
      password,
      seedPhrase: seed,
      hdPathString: "m/44'/60'/0'/0",
    }, (createVaultErr, ks) => {
      ks.keyFromPassword(password, (keyFromPasswordErr, pwDerivedKey) => {
        if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
          reject(new Error('Incorrect derived key!'));
        }

        try {
          ks.generateNewAddress(pwDerivedKey, address_count);
        } catch (err) {
          console.log(err);
          console.trace();
        }
        resolve(ks);
      });
    });
  }).then((ks) => {
    this.keystore = ks;
    const addresses = ks.getAddresses();
    return { addresses, seed };
  });
};

/**
 * Generates the address of the identity at a given index
 *
 * @method generateNewAddress
 * @param {string} password password for the encryoted keystore
 * @param {number} addressIndex index of the address to be generated
 * @returns {Promise}
 */
DatumIdentity.prototype.generateNewAddress = function generateNewAddress(password = '', index = 1) {
  if(!this.password  && !password) {
    throw new new Error('provide password either in class or with method')
  }
  const ks = this.keystore;
  return new Promise(resolve => {
    if (ks.getAddresses()[index]) {
      resolve(ks.getAddresses()[index]);
    }

    ks.keyFromPassword(this.password || password, (err, pwDerivedKey) => {
      ks.generateNewAddress(pwDerivedKey, index);
      const interval = setInterval(() => {
        if (ks.getAddresses()[index]) {
          clearInterval(interval);
          resolve(ks.getAddresses()[index]);
        }
      }, 200);
    });
  });
};


module.exports = DatumIdentity;
