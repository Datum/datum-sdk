const EthCrypto = require('eth-crypto');
const EthUtils = require("ethereumjs-util");
const Tx = require('ethereumjs-tx')


var createIdentity = function () {
    return EthCrypto.createIdentity();
}

var hash = function(obj) {
    return EthUtils.bufferToHex(EthUtils.sha256(obj));
}

var privateToAddress = function(privateKey) {
    return EthUtils.bufferToHex(EthUtils.privateToAddress(privateKey));
}

var privateToPublic = function(privateKey) {
    console.log(privateKey);
    return EthUtils.bufferToHex(EthUtils.privateToPublic(privateKey));
}

var publicToAddress = function(publicKey) {
    return EthUtils.bufferToHex(EthUtils.pubToAddress('0x' + publicKey));
}

var signTransaction = function(rawTransaction, key) {
    //sign transaction
    var tx = new Tx(rawTransaction);
    tx.sign(EthUtils.toBuffer(key));
    var serializedTx = tx.serialize();

    return serializedTx;
}


module.exports = {
    createIdentity : createIdentity,
    hash : hash,
    privateToPublic: privateToPublic,
    privateToAddress: privateToAddress,
    signTransaction : signTransaction,
    publicToAddress : publicToAddress
};