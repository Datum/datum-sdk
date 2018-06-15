const Web3 = require('web3');
const Settings = require('./settings');
var utils = require('../utils/utils');


var Web3RinkebyManager = function (httpProvider, privateKey) {
    this.settings = new Settings();
    this.httpProvider = httpProvider;
    this.privateKey = privateKey;

    if(privateKey !== undefined)
    {
        this.publicAddress = utils.privateToAddress(privateKey);
    }
    this.web3 = new Web3(new Web3.providers.HttpProvider(this.httpProvider));
    this.DATContract = new this.web3.eth.Contract(this.settings.RinkebyDATContractABI, this.settings.RinkebyDATContractAddress);
    this.BridgeContract = new this.web3.eth.Contract(this.settings.RinkebyBridgeContractABI, this.settings.RinkebyBridgeContractAddress);
};


Web3RinkebyManager.prototype.approve = function (spender, amount) {
    return this.web3.eth.getTransactionCount(this.publicAddress)
    .then(nonce => {
        //create trans
        var rawTransaction = this.getNewRawTranscation(this.sender, nonce);
        var data = this.DATContract.methods.approve(spender, amount).encodeABI();
        rawTransaction.to = this.settings.RinkebyDATContractAddress;
        rawTransaction.data = data;
        rawTransaction.value = '0x0';
        var signedSerializedTx =this.web3.signTransaction(rawTransaction);
        //send transactions
        return this.web3.eth.sendSignedTransaction('0x' + signedSerializedTx.toString('hex'));
    });
};


Web3RinkebyManager.prototype.transfer = function (amount) {

    var lastNonce = 0;

    return this.web3.eth.getTransactionCount(this.publicAddress)
    .then(nonce => {

        lastNonce = nonce;

        //create trans
        var rawTransaction = this.getNewRawTranscation(this.publicAddress, nonce);
        var data = this.DATContract.methods.approve(this.settings.RinkebyBridgeContractAddress, amount).encodeABI();
        rawTransaction.to = this.settings.RinkebyDATContractAddress;
        rawTransaction.data = data;
        rawTransaction.value = '0x0';
        var signedSerializedTx =this.signTransaction(rawTransaction);
        //send transactions
        return this.web3.eth.sendSignedTransaction('0x' + signedSerializedTx.toString('hex'))
    })
    .then(result => {
        lastNonce++;
        var data = this.BridgeContract.methods.deposit(amount).encodeABI();
        var rawTransaction = this.getNewRawTranscation(this.publicAddress, lastNonce);
        rawTransaction.to = this.settings.RinkebyBridgeContractAddress;
        rawTransaction.data = data;

        var signedSerializedTx =this.signTransaction(rawTransaction);

        return this.web3.eth.sendSignedTransaction('0x' + signedSerializedTx.toString('hex'));
    })
};

/**
 * Get new empty transaction
 *
 * @method getNewRawTranscation
 */
Web3RinkebyManager.prototype.getNewRawTranscation = function (from, nonce, gasPrice = 9000000000, gasLimit = 90000) {
    return {
        "from": from,
        "nonce": this.web3.utils.toHex(nonce),
        "gasPrice": this.web3.utils.toHex(gasPrice),
        "gasLimit": this.web3.utils.toHex(gasLimit),
        "chainID": this.web3.utils.toHex(4)
    };
};

Web3RinkebyManager.prototype.signTransaction = function (tx) {
     var signedTx = utils.signTransaction(tx, this.privateKey);
     return signedTx;
 };
 

module.exports = Web3RinkebyManager;