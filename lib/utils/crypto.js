const sjcl = require('sjcl');

if (typeof window !== 'undefined') {
    sjcl.random.startCollectors();
}


var encryptPrivate = function (obj, secret, authData = '0x5297530a87b7a9d5acc3a247514e909442ca7e59') {

    let rp = {};

    var mode = {
        adata: authData,
        iter: 1000,
        mode: "gcm",
        ts: 128,
        ks: 256
    };

    var q = sjcl.encrypt(secret, obj, mode, rp).replace(/,/g,",\n");
    return q;
}

var decryptPrivate = function (g, secret/*, adata = "0x5297530a87b7a9d5acc3a247514e909442ca7e59"*/) {
    let rp = {};
    return sjcl.decrypt(secret,g, {}, rp);
}

var createPassword = function(len = 10) {
    const randomBytes = sjcl.random.randomWords(8);
    const randomKey = sjcl.codec.base64.fromBits(randomBytes);
    return randomKey.substr(0, len);
}


module.exports = {
    encrypt: encryptPrivate,
    decrypt: decryptPrivate,
    createPassword : createPassword
};
