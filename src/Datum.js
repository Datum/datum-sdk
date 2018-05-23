const Web3 = require('web3');
const EthCrypto = require('eth-crypto');
const ethUtils = require("ethereumjs-util");
const cryptoJS = require("crypto-js");
const ecies = require("eth-ecies");
const Tx = require('ethereumjs-tx')

const contractABI = [{ "constant": true, "inputs": [{ "name": "dataHash", "type": "bytes32" }], "name": "getEncryptedSecret", "outputs": [{ "name": "", "type": "bytes" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "dataHash", "type": "bytes32" }], "name": "getAccessKeysForData", "outputs": [{ "name": "", "type": "address[]" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unregisterNode", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "setRegisterNodeDepositAmount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "bytes32" }], "name": "allowedStorageNodesForPublicKey", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "dataHash", "type": "bytes32" }, { "name": "signedMessage", "type": "bytes32" }, { "name": "v", "type": "uint8" }, { "name": "r", "type": "bytes32" }, { "name": "s", "type": "bytes32" }], "name": "canKeyAccessData", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "storagenode", "type": "address" }], "name": "rewardsForAddress", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "dataHash", "type": "bytes32" }, { "name": "merkleRoot", "type": "bytes32" }, { "name": "keysToAccess", "type": "address[]" }, { "name": "privacy", "type": "uint256" }, { "name": "duration", "type": "uint256" }], "name": "initStorage", "outputs": [{ "name": "", "type": "string" }], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [{ "name": "storagenode", "type": "address" }], "name": "endpointForAddress", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "endpoint", "type": "string" }, { "name": "bandwidth", "type": "uint256" }, { "name": "region", "type": "uint256" }], "name": "registerNode", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "lockedAmounts", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "dataHash", "type": "bytes32" }, { "name": "publicKey", "type": "address" }], "name": "canNodeStoreId", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "uint256" }], "name": "storageItems", "outputs": [{ "name": "id", "type": "bytes32" }, { "name": "merkleRoot", "type": "bytes32" }, { "name": "privacy", "type": "uint256" }, { "name": "duration", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "dataHash", "type": "bytes32" }, { "name": "publicKey", "type": "address" }, { "name": "encryptedSecret", "type": "bytes" }], "name": "addStorageAccessKey", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "canStoreData", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "registeredNodes", "outputs": [{ "name": "endpoint", "type": "string" }, { "name": "bandwidth", "type": "uint256" }, { "name": "region", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "nodeRegisterDepositAmount", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "storageNode", "type": "address" }, { "indexed": false, "name": "endpoint", "type": "string" }, { "indexed": false, "name": "bandwidth", "type": "uint256" }, { "indexed": false, "name": "region", "type": "uint256" }], "name": "StorageNodeRegistered", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "storageNode", "type": "address" }], "name": "StorageNodeUnRegistered", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "owner", "type": "address" }, { "indexed": false, "name": "dataHash", "type": "bytes32" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "StorageInitialized", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "owner", "type": "address" }, { "indexed": false, "name": "dataHash", "type": "bytes32" }, { "indexed": false, "name": "publicKey", "type": "address" }], "name": "StorageItemKeyAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "dataHash", "type": "bytes32" }, { "indexed": false, "name": "storageNode", "type": "address" }, { "indexed": false, "name": "endpoint", "type": "string" }], "name": "StorageEndpointSelected", "type": "event" }];
const contractAddress = '0x3768739e501138Bfc983c7014533Dd96799c0625';


module.exports = class Datum {
    constructor() {
        this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        this.storageContract = new this.web3.eth.Contract(contractABI, contractAddress);
    }

    createIdentity() {
        return new Promise((resolve, reject) => {
            try {
                let identity = EthCrypto.createIdentity();
                resolve(identity)
            } catch (err) {
                reject('Error creating identity');
            }
        })
    }

    hash(obj) {
        return new Promise((resolve, reject) => {
            try {
                let hash = ethUtils.bufferToHex(ethUtils.sha256(obj));
                resolve(hash)
            }
            catch (err) {
                reject('Error creating hash :' + err.message);
            }
        })
    }

    encryptPrivate(obj, secret, type = 'json') {
        return new Promise((resolve, reject) => {
            try {
                let encryptd = new Buffer(cryptoJS.AES.encrypt(obj, secret).toString()).toString();
                resolve(encryptd)
            }
            catch (err) {
                reject('Error encryption data :' + err.message);
            }
        })
    }

    decryptPrivate(obj, secret, type = 'json') {
        return new Promise((resolve, reject) => {
            try {
                let decrypted = cryptoJS.AES.decrypt(obj, secret).toString(cryptoJS.enc.Utf8);
                resolve(decrypted)
            }
            catch (err) {
                reject('Error decrypting data :' + err.message);
            }
        })
    }

    encryptPublic(msg, publicKey) {
        return new Promise((resolve, reject) => {
            try {
                let encryptd = ecies.encrypt(ethUtils.toBuffer(publicKey), ethUtils.toBuffer(msg));
                resolve(ethUtils.bufferToHex(encryptd));
            }
            catch (err) {
                reject('Error encryption with public key :' + err.message);
            }
        })
    }

    decryptPublic(encrypted, privateKey) {
        return new Promise((resolve, reject) => {
            try {
                let encryptd = ecies.decrypt(privateKey, ethUtils.toBuffer(encrypted)).toString();
                resolve(encryptd)
            }
            catch (err) {
                reject('Error decryption with private key :' + err.message);
            }
        })

    }

    canStoreData(address) {
        return this.storageContract.methods.canStoreData()
            .call({ from: address })
    }


    getTransactionCount(address) {
        return this.web3.eth.getTransactionCount(address);
    }


    createInitStorageTransaction(address) {
        return this.getNewRawTranscation(address)
            .then(tx => {
                var data = this.storageContract.methods.initStorage(address, address, [], 1, 1).encodeABI();
                tx.to = contractAddress;
                tx.data = data;
                tx.value = '0x0';
                return tx;
            })
    }

    getNewRawTranscation(from, gasPrice = 9000000000, gasLimit = 90000) {
        return this.getTransactionCount(from)
            .then(count => {
                return {
                    "from": from,
                    "nonce": this.web3.utils.toHex(count),
                    "gasPrice": this.web3.utils.toHex(gasPrice),
                    "gasLimit": this.web3.utils.toHex(gasLimit),
                    "chainId": this.web3.utils.toHex(51515)
                };
            })
    }

    signRawTransaction(rawTransaction, privKey) {
        return new Promise((resolve, reject) => {
            try {
                var tx = new Tx(rawTransaction);
                tx.sign(privKey);
                var serializedTx = tx.serialize();
                resolve('0x' + serializedTx.toString('hex'))
            }
            catch (err) {
                reject('Error signing transaction with private key :' + err.message);
            }
        })
    }

    sendRawTransaction(tx) {
        return this.web3.eth.sendRawTransaction(tx);
    }


    getBalance(address) {
        return new Promise((resolve, reject) => {
            this.web3.eth.getBalance(address, (err, balance) => {
                if (err != null) {
                    reject('There was an error fetching balance.')
                }

                resolve(balance);
            });
        })
    }
}