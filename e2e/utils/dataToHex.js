const Web3 = require('web3');

const web3 = new Web3();

const dataToHex = data => web3.utils.padRight(web3.utils.toHex(data), 64);

module.exports = dataToHex;
