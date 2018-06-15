const Web3 = require('web3');
var utils = require('../utils/utils');

const EventEmitter = require('events').EventEmitter;



var Web3Manager = function (httpProvider, privateKey) {
    this.httpProvider = httpProvider;
    this.privateKey = privateKey;
    this._events = new EventEmitter;

    if(privateKey !== undefined)
    {
        this.publicAddress = utils.privateToAddress(privateKey);
    }

    this.web3 = new Web3(new Web3.providers.HttpProvider(this.httpProvider));
};


Object.defineProperty( Web3Manager.prototype, 'events', {
    get:function(){ return this._events; }
})


/**
 * 
 *
 * @method send
 * @param {Object} data
 * @return {Object}
 */
Web3Manager.prototype.sign = function (data) {
    if (!this.privateKey) {
        console.error('private key not set');
        return null;
    }

    return this.web3.eth.accounts.sign(data, this.privateKey);
};


Web3Manager.prototype.setPrivateKey = function (privateKey) {
    this.privateKey = privateKey;
    this.publicAddress = utils.privateToPublic(privateKey);
 };


 Web3Manager.prototype.setPrivateKey = function (privateKey) {
    this.privateKey = privateKey;
    this.publicAddress = utils.privateToAddress(privateKey);
 };

 Web3Manager.prototype.getNonce = function () {
    return this.web3.eth.getTransactionCount(this.publicAddress);
 };

 Web3Manager.prototype.signTransaction = function (tx) {
    this._events.emit('signingTransaction', tx);

     var signedTx = utils.signTransaction(tx, this.privateKey);

     this._events.emit('signedTransaction', '0x' + signedTx.toString('hex'));

     return signedTx;
 };

 

module.exports = Web3Manager;