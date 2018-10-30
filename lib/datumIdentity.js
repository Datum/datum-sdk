/*!
 * datumIdentity.js - Datum Identity
 *
 * javascript api for datum blockchain
 *
 * @license
 * @see
*/


const lightwallet = require('eth-lightwallet');
var mnid = require('mnid');
var signing = lightwallet.signing;
var encryption = lightwallet.encryption;
var utils = require('./utils/utils.js');
var settings = require('./web3/settings');



function DatumIdentity(defaultPublicKeys = []) {
   this.proxy = "";
   this.defaultPublicKeys = defaultPublicKeys;
}


//public getters
DatumIdentity.prototype = {
    get mnid() {
        if (this.keystore) {
            return mnid.encode({
                network: settings.network.network_name,
                address: this.keystore.getAddresses()[0]
            });
        } else {
            return null;
        }
    },
    get did() {
        if (this.keystore) {
            return "did:datum:" + this.mnid;
        } else {
            return null;
        }
    },
    get address() {
        if (this.keystore) {
            return this.keystore.getAddresses()[0];
        } else {
            return null;
        }
    },
    get addresses() {
        if (this.keystore) {
            return this.keystore.getAddresses();
        } else {
            return null;
        }
    },
}


/**
 * Export keystore
 *
 * @method export
 * @return {string} serialize encrypted keystore
 */
DatumIdentity.prototype.export = function () {
    let serializedKeyStore = this.keystore.serialize();
    if(this.proxy != "") {
        serializedKeyStore.proxy = this.proxy;
    }
    return serializedKeyStore;
}


/**
 * import keystore
 *
 * @method import
 * @param {string} serialized_keystore serialized keystore as string
 */
DatumIdentity.prototype.import = function (serialized_keystore) {

    this.keystore = lightwallet.keystore.deserialize(serialized_keystore);

    try
    {
        let j = JSON.parse(serialized_keystore);
        if(j.proxy != null) {
            this.proxy = j.proxy;
        }
    } catch(error) {
        throw error;
    }
}


/**
 * Stores the password for identity, if not set needed for every private key access
 *
 * @method storePassword
 * @param {string} password password to unlock the keystore
 */
DatumIdentity.prototype.storePassword = function (password) {
    this.password = password;
}


/**
 * sign
 *
 * @method recoverAddress
 * @param {string} msg msg to sign
 * @param {string} v
 * @param {string} r
 * @param {string} s
 */
DatumIdentity.prototype.recoverAddress = function (msg, v,r,s) {
    let g = signing.recoverAddress(msg, v, r, s)
    return '0x' + g.toString('hex');
}

/**
 * sign
 *
 * @method signMsg
 * @param {string} msg msg to sign
 * @param {string} password needed of not provided to class with setPassword
 */
DatumIdentity.prototype.signMsg = function (msg, password = "", accountIndex = 0) {

    return new Promise((resolve, reject) => {
        if (this.password === undefined && password == "") {
            reject("provide password either in class or with method");
        }

        var ks = this.keystore;
        var add = this.address;
        ks.keyFromPassword(password == "" ? this.password : password, function (err, pwDerivedKey) {
            if (err) {
                reject(err);
            }

            resolve(signing.signMsg(ks, pwDerivedKey, msg, ks.getAddresses()[accountIndex]));
        });
    });
}





/**
 * sign a hash
 *
 * @method signMsgHash
 * @param {string} msg msg to sign
 * @param {string} password needed of not provided to class with setPassword
 */
DatumIdentity.prototype.signMsgHash = function (msg, password = "", accountIndex = 0) {

    return new Promise((resolve, reject) => {
        if (this.password === undefined && password == "") {
            reject("provide password either in class or with method");
        }

        var ks = this.keystore;
        var add = this.address;
        ks.keyFromPassword(password == "" ? this.password : password, function (err, pwDerivedKey) {
            if (err) {
                reject(err);
            }

            resolve(signing.signMsgHash(ks, pwDerivedKey, msg, ks.getAddresses()[accountIndex]));
        });
    });
}



/**
 * sign
 *
 * @method signTx
 * @param {string} tx tx to sign
 * @param {string} password needed of not provided to class with setPassword
 */
DatumIdentity.prototype.signTx = function (tx, password = "", accountIndex = 0) {

    return new Promise((resolve, reject) => {
        if (this.password === undefined && password == "") {
            reject("provide password either in class or with method");
        }

        var ks = this.keystore;
        var add = this.address;
        ks.keyFromPassword(password == "" ? this.password : password, function (err, pwDerivedKey) {
            if (err) {
                reject(err);
            }

            resolve(signing.signTx(ks, pwDerivedKey, tx, ks.getAddresses()[accountIndex]));
        });
    });
}


DatumIdentity.prototype.getPublicKey = function(accountIndex = 0, password = "") {
    return new Promise((resolve, reject) => {
        if (this.password === undefined && password == "") {
            reject("provide password either in class or with method");
        }

        var ks = this.keystore;
        var add = this.addresses[accountIndex];
        ks.keyFromPassword(password == "" ? this.password : password, function (err, pwDerivedKey) {
            if (err) {
                reject(err);
            }
            resolve(encryption.addressToPublicEncKey(ks, pwDerivedKey, add));
        });
    });
}

DatumIdentity.prototype.getPrivateKey = function(accountIndex = 0, password = "") {
    return new Promise((resolve, reject) => {
        if (this.password === undefined && password == "") {
            reject("provide password either in class or with method");
        }

        var ks = this.keystore;
        var add = this.addresses[accountIndex];
        ks.keyFromPassword(password == "" ? this.password : password, function (err, pwDerivedKey) {
            if (err) {
                reject(err);
            }
            resolve(ks.exportPrivateKey(add, pwDerivedKey));
        });
    });
}


DatumIdentity.prototype.encrypt = function (msg, pubKeyArray, password = "", accountIndex = 0) {

    return new Promise((resolve, reject) => {
        if (this.password === undefined && password == "") {
            reject("provide password either in class or with method");
        }

        var ks = this.keystore;
        var add = this.addresses[accountIndex];
        var pk = this.defaultPublicKeys;

        ks.keyFromPassword(password == "" ? this.password : password, function (err, pwDerivedKey) {
            if (err) {
                reject(err);
            }

            var pubKeysToAdd = [];

            for(var i = 0;i < pk.length ; i++) {
              if(typeof pk[i]!==undefined){
                pubKeysToAdd.push(pk[i]);
              }

            }


            for(var i = 0;i < pubKeyArray.length ; i++) {
                if(typeof pubKeyArray[i].encryptionKey !=='undefined'){
                  pubKeysToAdd.push(pubKeyArray[i].encryptionKey);
                }
            }

            //add sender
            pubKeysToAdd.push(encryption.addressToPublicEncKey(ks, pwDerivedKey, add));

            let signed = encryption.multiEncryptString(ks, pwDerivedKey, msg, add, pubKeysToAdd);
            signed.signer = add;
            signed.publicKey = encryption.addressToPublicEncKey(ks, pwDerivedKey, add);
            resolve(signed);
        });
    });
}


DatumIdentity.prototype.decrypt = function (encMsg, password = "", accountIndex = 0) {

    return new Promise((resolve, reject) => {
        if (this.password === undefined && password == "") {
            reject("provide password either in class or with method");
        }

        var ks = this.keystore;
        var add = this.addresses[accountIndex];

        ks.keyFromPassword(password == "" ? this.password : password, function (err, pwDerivedKey) {
            if (err) {
                reject(err);
            }
            let pub = encryption.addressToPublicEncKey(ks, pwDerivedKey, add);
            let t = encryption.multiDecryptString(ks, pwDerivedKey, encMsg, encMsg.publicKey !== undefined ? encMsg.publicKey : pub, add);
            resolve(t);
        });
    });
}

/**
 * recover key store
 *
 * @method recover
 * @param {string} seed the original seed , 12 words
 * @return {object} returns object with first address recovered from keystore
 */
DatumIdentity.prototype.recover = function (seed, new_password, address_count = 1) {
    return new Promise((resolve, reject) => {
        lightwallet.keystore.createVault({
            password: new_password,
            seedPhrase: seed,
            hdPathString: "m/44'/60'/0'/0"
        }, function (err, ks) {

            ks.keyFromPassword(new_password, function (err, pwDerivedKey) {
                if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
                    reject("Incorrect derived key!");
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
    }).then(ks => {
        this.keystore = ks;
        var addresses = ks.getAddresses();
        return { addresses };
    })
};


/**
 * new keystore
 *
 * @method new
 * @param {string} password create a new keystore with given password, seed words generated random
 * @return {object} returns object with first address recovered from keystore and used seed to create the keystore
 */
DatumIdentity.prototype.new = function (password, address_count = 1) {


    var seed = lightwallet.keystore.generateRandomSeed();

    return new Promise((resolve, reject) => {

        lightwallet.keystore.createVault({
            password: password,
            seedPhrase: seed,
            hdPathString: "m/44'/60'/0'/0"
        }, function (err, ks) {
            ks.keyFromPassword(password, function (err, pwDerivedKey) {
                if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
                    reject("Incorrect derived key!");
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
    }).then(ks => {
        this.keystore = ks;
        var addresses = ks.getAddresses();
        return { addresses, seed };
    })
}



module.exports = DatumIdentity;
