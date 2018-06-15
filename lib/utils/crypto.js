const cryptoJS = require("crypto-js");
const EthUtils = require("ethereumjs-util");
const ecies = require("eth-ecies");




var encryptPrivate = function (obj, secret) {
    return new Buffer(cryptoJS.AES.encrypt(obj, secret).toString()).toString();
}

var decryptPrivate = function (obj, secret) {
    return cryptoJS.AES.decrypt(obj, secret).toString(cryptoJS.enc.Utf8);
}


var encryptForPublicKey = function (obj, publicKey) {
    let encryptd = ecies.encrypt(EthUtils.toBuffer(publicKey), EthUtils.toBuffer(obj));
    return EthUtils.bufferToHex(encryptd);
}

var decryptWithPrivateKey = function (obj, secret) {
    return ecies.decrypt(privateKey, EthUtils.toBuffer(encrypted)).toString()
}


module.exports = {
    encrypt : encryptPrivate,
    decrypt : decryptPrivate,
    ethEncrypt : encryptForPublicKey,
    ethDecrypt : decryptWithPrivateKey
};