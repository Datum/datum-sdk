const sjcl = require("sjcl");

var encryptPrivate = function (obj, secret) {
    var mode = {
        iter: 1000,
        mode: "gcm",
        ts: 128,
        ks: 256
    };
    var q = sjcl.encrypt(secret, obj, mode).replace(/,/g,",\n");
    return q;
};

var decryptPrivate = function (g, secret) {
    return sjcl.decrypt(secret,g);
};

var createPassword = function(len = 10) {
    const randomBytes = sjcl.random.randomWords(8);
    const randomKey = sjcl.codec.base64.fromBits(randomBytes);
    return randomKey.substr(0, len);
};


module.exports = {
    encrypt: encryptPrivate,
    decrypt: decryptPrivate,
    createPassword : createPassword
};
