const sjcl = require('sjcl');


var encryptPrivate = function (obj, secret, authData = "0x5297530a87b7a9d5acc3a247514e909442ca7e59") {

    rp = {};

    var mode = {
        adata: authData,
        iter: 1000,
        mode: "gcm",
        ts: 64,
        ks: 256
    };

    var q = sjcl.encrypt(secret, obj, mode, rp).replace(/,/g,",\n");
    var j = JSON.parse(q);

    //24 + 56 + ??
    var formated = j.iv.toString() + j.adata + j.ct;

    console.log('enc: ' + formated);

    return formated;
}

var decryptPrivate = function (obj, secret, adata = "0x5297530a87b7a9d5acc3a247514e909442ca7e59") {
    if(obj.length <= 80) {
        throw new Error('invalid length');
    }

    var iv = obj.substring(0,24);
    adata = obj.substring(24,80);
    var ct = obj.substring(80).replace("\u0000", "");


    rp = {};
    var g = {};
    g.iv = iv;
    g.v = 1;
    g.iter = 1000;
    g.ks = 256;
    g.ts = 64;
    g.mode = "gcm";
    g.adata = adata;
    g.cipher = "aes";
    g.ct = ct;

    var s = JSON.stringify(g);

    return sjcl.decrypt(secret,s, {}, rp);
}


module.exports = {
    encrypt: encryptPrivate,
    decrypt: decryptPrivate
};
