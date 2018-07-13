const EthUtils = require("ethereumjs-util");
const ecies = require("eth-ecies");
const sjcl = require('sjcl');



var encryptPrivate = function (obj, secret, authData = "") {

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
 
    return formated;
}

var decryptPrivate = function (obj, secret, adata) {
    if(obj.length <= 80) {
        throw new Error('invalid length');
    }

    var iv = obj.substring(0,24);
    var adata = obj.substring(24,80);
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

var encryptForPublicKey = function (obj, publicKey) {
    let encryptd = ecies.encrypt(EthUtils.toBuffer(publicKey), EthUtils.toBuffer(obj));
    return EthUtils.bufferToHex(encryptd);
}

var decryptWithPrivateKey = function (encrypted, privateKey) {
    return ecies.decrypt(privateKey.substring(2), EthUtils.toBuffer(encrypted)).toString()
}


module.exports = {
    encrypt: encryptPrivate,
    decrypt: decryptPrivate,
    ethEncrypt: encryptForPublicKey,
    ethDecrypt: decryptWithPrivateKey
};