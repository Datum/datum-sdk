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



function DatumIdentity(serialized_keystore = null) {
    if (serialized_keystore != null) {
        this.keystore = lightwallet.keystore.deserialize(serialized_keystore);
    }
}


//public getters
DatumIdentity.prototype = {
    get mnid() {
        if (this.keystore) {
            return mnid.encode({
                network: '0xc93b',
                address: this.keystore.getAddresses()[0]
            });
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
}


/**
 * Export keystore
 *
 * @method export
 * @return {string} serialize encrypted keystore
 */
DatumIdentity.prototype.export = function () {
    return this.keystore.serialize();
}


/**
 * import keystore
 *
 * @method import
 * @param {string} serialized_keystore serialized keystore as string
 */
DatumIdentity.prototype.import = function (serialized_keystore) {
    this.keystore = lightwallet.keystore.deserialize(serialized_keystore);
}


/**
 * Sets the password for identity, if not set needed for every private key access
 *
 * @method setPassword
 * @param {string} password password to unlock the keystore
 */
DatumIdentity.prototype.setPassword = function (password) {
    this.password = password;
}

/**
 * sign
 *
 * @method signMsg
 * @param {string} msg msg to sign
 * @param {string} password needed of not provided to class with setPassword
 */
DatumIdentity.prototype.signMsg = function (msg, password = "") {

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

            resolve(signing.signMsg(ks, pwDerivedKey, msg, ks.getAddresses()[0]));
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
DatumIdentity.prototype.signTx = function (tx, password = "") {

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

            resolve(signing.signTx(ks, pwDerivedKey, tx, ks.getAddresses()[0]));
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
DatumIdentity.prototype.recover = function (seed) {
    return new Promise((resolve, reject) => {

        var password = Math.random().toString();

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
                    ks.generateNewAddress(pwDerivedKey, 10);
                } catch (err) {
                    console.log(err);
                    console.trace();
                }
                resolve(ks);
            });
        });
    }).then(ks => {
        this.keystore = ks;
        var address = ks.getAddresses()[0];
        return { address };
    })
};


/**
 * new keystore
 *
 * @method new
 * @param {string} password create a new keystore with given password, seed words generated random
 * @return {object} returns object with first address recovered from keystore and used seed to create the keystore
 */
DatumIdentity.prototype.new = function (password) {

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
                    ks.generateNewAddress(pwDerivedKey, 10);
                } catch (err) {
                    console.log(err);
                    console.trace();
                }
                resolve(ks);
            });

        });
    }).then(ks => {
        this.keystore = ks;
        var address = ks.getAddresses()[0];
        return { address, seed };
    })
}

module.exports = DatumIdentity;