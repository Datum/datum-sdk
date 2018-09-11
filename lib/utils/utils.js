const EthUtils = require("ethereumjs-util");
const Tx = require('ethereumjs-tx')
const secp256k1 = require("secp256k1");


var hash = function(obj) {
    return EthUtils.bufferToHex(EthUtils.sha256(obj));
}

var privateToAddress = function(privateKey) {
    return EthUtils.bufferToHex(EthUtils.privateToAddress(privateKey));
}

var privateToPublic = function(privateKey) {
    return EthUtils.bufferToHex(EthUtils.privateToPublic(privateKey));
}

var publicToAddress = function(publicKey) {
    return EthUtils.bufferToHex(EthUtils.pubToAddress(publicKey));
}

var recoverAddress = function(msg,v,r,s) {
    var pub = EthUtils.ecrecover(EthUtils.toBuffer(hash(msg)), v, r, s);
    var addrBuf = EthUtils.pubToAddress(pub);
    return EthUtils.bufferToHex(addrBuf);
}

var signTransaction = function(rawTransaction, key) {
    //sign transaction
    var tx = new Tx(rawTransaction);
    tx.sign(EthUtils.toBuffer(key));
    var serializedTx = tx.serialize();

    return serializedTx;
}

var toBuffer = function(val) {
    return EthUtils.toBuffer(val);
}


var compress = function(startsWith04) {

    // add trailing 04 if not done before
    const testBuffer = new Buffer(startsWith04, 'hex');
    if (testBuffer.length === 64) startsWith04 = '04' + startsWith04;


    return secp256k1.publicKeyConvert(
        new Buffer(startsWith04, 'hex'),
        true
    ).toString('hex');
};

var decompress = function(startsWith02Or03) {

    // if already decompressed an not has trailing 04
    const testBuffer = new Buffer(startsWith02Or03, 'hex');
    if (testBuffer.length === 64) startsWith02Or03 = '04' + startsWith02Or03;

    let decompressed = secp256k1.publicKeyConvert(
        new Buffer(startsWith02Or03, 'hex'),
        false
    ).toString('hex');

    // remove trailing 04
    decompressed = decompressed.substring(2);
    return decompressed;
};

module.exports = {
    hash : hash,
    privateToPublic: privateToPublic,
    privateToAddress: privateToAddress,
    signTransaction : signTransaction,
    publicToAddress : publicToAddress,
    recoverAddress : recoverAddress,
    toBuffer : toBuffer,
    compress: compress,
    decompress: decompress
};