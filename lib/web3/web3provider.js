const Web3 = require('web3');
const Web3PromiEvent = require('web3-core-promievent');
const Transaction = require('ethereumjs-tx');
const fetch = require('node-fetch');
const TxDataProvider = require('./txDataProvider.js');

const Web3Provider = function Web3Provider(
  web3Endpoint,
  identity,
  settings,
  useFuelingServer = false,
  fuellingConfig = undefined,
) {
  this.settings = settings;
  this.web3 = new Web3(new Web3.providers.HttpProvider(web3Endpoint));
  this.claimsContract = new this.web3.eth.Contract(
    this.settings.contracts.registryContractABI,
    this.settings.contracts.registryContractAddress,
  );
  this.storageCostsContract = new this.web3.eth.Contract(
    this.settings.contracts.storageCostsABI,
    this.settings.contracts.storageCostsAddress,
  );
  this.storageContract = new this.web3.eth.Contract(
    this.settings.contracts.storageABI,
    this.settings.contracts.storageAddress,
  );
  this.identity = identity;
  this.useFuelingServer = useFuelingServer;
  this.fuellingConfig = fuellingConfig;
};

Web3Provider.prototype.sendTx = function sendTx(tx) {
  return this.web3.eth.sendSignedTransaction(tx);
};

Web3Provider.prototype.getGasPrice = function getGasPrice() {
  return this.web3.eth.getGasPrice();
};

Web3Provider.prototype.estimateGasPrice = function estimateGasPrice(tx) {
  return this.web3.eth.estimateGas(tx);
};

Web3Provider.prototype.getBalance = function getBalance(wallet) {
  return this.web3.eth.getBalance(wallet);
};

Web3Provider.prototype.getNonce = function getNonce(address) {
  return this.web3.eth.getTransactionCount(address);
};

Web3Provider.prototype.toHex = function toHex(obj) {
  return this.web3.utils.toHex(obj);
};

Web3Provider.prototype.hexToUtf8 = function hexToUtf8(obj) {
  return this.web3.utils.hexToUtf8(obj);
};

Web3Provider.prototype.sha3 = function sha3(obj) {
  return this.web3.utils.sha3(obj);
};

Web3Provider.prototype.toWei = function toWei(obj) {
  return this.web3.utils.toWei(obj);
};

Web3Provider.prototype.toUtf8 = function toUtf8(obj) {
  return this.web3.utils.toUtf8(obj);
};

Web3Provider.prototype.getTransaction = function getTransaction(txHash) {
  return this.web3.eth.getTransaction(txHash);
};

Web3Provider.prototype.getTransactionReceipt = function getTransactionReceipt(txHash) {
  return this.web3.eth.getTransactionReceipt(txHash);
};

Web3Provider.prototype.sendWithEvent = function sendWithEvent(signedTx) {
  return this.web3.eth.sendSignedTransaction(`0x${signedTx}`);
};

/**
 * submitFuelingTx - Submit transaction to fuelling server
 *
 * @param  {Object} tx transaction object
 * @return {Promise}    Promise for request status
 */
async function submitFuelingTx(tx, promiseEvent) {
  try {
    const response = await fetch(this.fuellingConfig.URL, {
      method: 'POST',
      body: JSON.stringify(tx),
      headers: { 'Content-Type': 'application/json' },
    });
    const { transactionHash } = JSON.parse(await response.json());
    promiseEvent.eventEmitter.emit('transactionHash', transactionHash);
    // Check receipt status every one second
    const checkIntervals = setInterval(() => {
      this.web3.eth.getTransactionReceipt(transactionHash)
        .then((receipt) => {
          if (receipt !== null && typeof receipt !== 'undefined') {
            promiseEvent.eventEmitter.emit('receipt', receipt);
            promiseEvent.resolve(receipt);
            clearInterval(checkIntervals);
          }
        }).catch((err) => {
          clearInterval(checkIntervals);
          throw err;
        });
    }, 1000);
  } catch (err) {
    promiseEvent.reject(`Error sumitting Tx to fuelling server: ${err}`);
  }
}

function isDef(v) {
  return v !== null && typeof v !== 'undefined' && v !== '';
}

/**
 * configureForProxy - Return transaction object if proxy is defined
 * else just return object with value passed
 */
async function buildTxObj(to, from, data, value) {
  if (this.useFuelingServer) {
    return {
      to,
      data,
      chainID: this.web3.utils.toHex(this.settings.network.network_id),
    };
  }
  let tx = {};
  if (isDef(this.identity.proxy)) {
    tx = {
      to: this.settings.contracts.identityManagerAddress,
      data: TxDataProvider.getProxyForwardData(this.identity.proxy, to, value, data),
    };
  } else {
    tx = { to, data };
  }
  const nonce = await this.getNonce(from);
  const gasPrice = await this.getGasPrice();
  const lBlock = await this.web3.eth.getBlock('latest');
  return {
    ...tx,
    from,
    nonce: this.web3.utils.toHex(nonce),
    gasPrice: this.web3.utils.toHex(gasPrice),
    chainID: this.web3.utils.toHex(this.settings.network.network_id),
    value: this.web3.utils.toHex(value),
    gasLimit: this.web3.utils.toHex(lBlock.gasLimit),
  };
}

Web3Provider.prototype.send = async function send(to, data, value = 0, from = this.identity.address) {
  if (value !== 0 && this.useFuelingServer) {
    throw new Error('Invalid operation: can\'t transfer value while using fueling');
  }
  const tx = await buildTxObj.call(this, to, from, data, value);
  const promiseEvent = Web3PromiEvent();
  if (this.useFuelingServer) {
    promiseEvent.eventEmitter.emit('SumbmittingTx-Fuelling', tx);
    submitFuelingTx.call(this, tx, promiseEvent);
  } else {
    promiseEvent.eventEmitter.emit('transactionRaw', tx);
    const txSerialized = `0x${(new Transaction(tx)).serialize().toString('hex')}`;
    const signed = await this.identity.signTx(txSerialized);
    this.web3.eth.sendSignedTransaction(`0x${signed}`)
      .once('transactionHash', (hash) => {
        promiseEvent.eventEmitter.emit('transactionHash', hash);
      })
      .once('receipt', (receipt) => {
        promiseEvent.eventEmitter.emit('receipt', receipt);
      })
      .then((receipt) => {
        promiseEvent.resolve(receipt);
      })
      .catch((error) => {
        promiseEvent.reject(`Error sending transaction: ${error}`);
      });
  }
  return promiseEvent.eventEmitter;
};

Web3Provider.prototype.getRawTransaction = async function getRawTransaction(address) {
  const nonce = await this.getNonce(address);
  const gasPrice = await this.getGasPrice();

  return {
    from: address,
    nonce: this.web3.utils.toHex(nonce),
    gasPrice: this.web3.utils.toHex(gasPrice),
    chainID: this.web3.utils.toHex(this.settings.network.network_id),
  };
};

function getData(
  endpoint,
  headers = { 'Content-Type': 'application/json' },
) {
  const opts = {
    method: 'GET',
    headers,
  };
  return fetch(endpoint, opts);
}

/**
 * Gets the actual safeLow gasprice from ethereum mainnet over ethgasstation api
 *
 * @method getEthereumGasPrice
 * @return {int} actual safeLow gasPrice in wei
 */
Web3Provider.getEthereumGasPrice = function getEthereumGasPrice() {
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' };
  return getData('https://ethgasstation.info/json/ethgasAPI.json', headers)
    .then(response => response.json())
    .then(json => Web3.utils.toWei((json.safeLow / 10).toString(), 'gwei'));
};

/**
 * Gets the actual value of 1 DAT in ETH
 *
 * @method getDatValueInETH
 * @return {float} actual price of 1 DAT in ETH
 */
Web3Provider.getDatValueInETH = function getDatValueInETH() {
  return getData('https://api.coinmarketcap.com/v1/ticker/Datum/?convert=eth')
    .then(response => response.json())
    .then(json => json[0].price_eth);
};

module.exports = Web3Provider;
