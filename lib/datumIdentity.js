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
const Web3 = require('web3');

//if no seed provided create vault, otherwise init old
function DatumIdentity(seed = null) {
    var identity = this;
    identity.initialization = Promise.resolve()
        .then(function () {
            return init(seed);
        })
        .then(function (result) {
            identity.seed = result.seed;
            identity.keystore = result.keystore;
            identity.key = result.key;
        });
}

DatumIdentity.prototype.getSeed = function () {
    var self = this;
    return this.initialization.then(function () {
        return self.seed;
    });
}

DatumIdentity.prototype.getAddress = function (index = 0) {
    var self = this;
    return this.initialization.then(function () {
        // actual body of the method
        var addr = self.keystore.getAddresses();
        return addr[index];
    });
}

DatumIdentity.prototype.getMNID = function (index = 0) {
    var self = this;
    return this.initialization.then(function () {
        // actual body of the method
        var addr = self.keystore.getAddresses();

        return mnid.encode({
            network: '0xc93b',
            address: addr[index]
        });
    });
}

function init(seed = null) {
    return new Promise((resolve, reject) => {
        //password doesn't matter, but needed
        let password = "123123123123";

        if (seed != null) {
            seed = seed;
        } else {
            seed = lightwallet.keystore.generateRandomSeed();
        }

        lightwallet.keystore.createVault(
            {
                hdPathString: "m/44'/60'/0'/0",
                seedPhrase: seed,
                password: password
            },
            function (err, keystore) {
                if (err) {
                    reject(err);
                }

                let lw = keystore
                lw.keyFromPassword(password, async function (e, k) {
                    lw.generateNewAddress(k, 10);
                    resolve({ seed, keystore: lw, key: k });
                });
            }
        );
    });
}

module.exports = DatumIdentity;