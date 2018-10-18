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

function postData(endpoint, body) {
  const opts = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  };

  return fetch(endpoint, opts);
}

Web3Provider.prototype.send = function send(to, data, value = 0, from = null) {
  let sendTo = to;
  let sendData = data;

  // check if proxy usage is activated and forward all transactions over proxy address
  if (this.identity.proxy !== '') {
    // create proxy transaction
    sendData = TxDataProvider.getProxyForwardData(this.identity.proxy, to, value, data);
    sendTo = this.settings.contracts.identityManagerAddress;
  }

  const promiEvent = Web3PromiEvent();
  const fromAddress = from === null ? this.identity.address : from;
  let tx = {};
  this.getRawTransaction(fromAddress)
    .then((txNew) => {
      tx = txNew;
      tx.data = sendData;
      tx.to = sendTo;
      /**
       * Transaction with data like set method
       */
      if (value !== 0) {
        tx.value = this.web3.utils.toHex(value);
      }

      if (this.useFuelingServer) {
        const tmp = { to: tx.to, data: tx.data, from: this.identity.address };
        return this.estimateGasPrice(tmp);
      }
      return this.estimateGasPrice(tx);
    })
    .then((price) => {
      tx.gasLimit = this.web3.utils.toHex(price);
      promiEvent.eventEmitter.emit('transactionRaw', tx);
      const txSerialized = `0x${(new Transaction(tx)).serialize().toString('hex')}`;
      return this.identity.signTx(txSerialized);
    })
    .then((signed) => {
      promiEvent.eventEmitter.emit('transactionSigned', signed);

      if (this.useFuelingServer) {
        const postContent = {
          tx: signed,
        };

        const self = this;
        promiEvent.eventEmitter.emit('httpSent', postContent);
        postData(this.settings.contracts.fuelingServerURL, postContent)
          .then(response => response.json())
          .then((respJson) => {
            if (!respJson.success) {
              throw new Error(`Transaction not sent fueling server: ${respJson.message}`);
            }
            return self.getTransactionReceipt(respJson.data.transactionHash);
          })
          .then((receipe) => {
            if (receipe.status) {
              self.web3.eth.sendSignedTransaction(`0x${signed}`)
                .once('transactionHash', (hash) => {
                  promiEvent.eventEmitter.emit('transactionHash', hash);
                })
                .once('receipt', (receipt) => {
                  promiEvent.eventEmitter.emit('receipt', receipt);
                })
                .then((receipt) => {
                  promiEvent.resolve(receipt);
                })
                .catch((error) => {
                  promiEvent.reject(`Error sending transaction: ${error}`);
                });
            } else {
              promiEvent.reject('Error receiving fee from fueling server. Never arrived.');
            }
          })
          .catch((error) => {
            promiEvent.reject(`error getting transction receipe:${error}`);
          });
      } else {
        this.web3.eth.sendSignedTransaction(`0x${signed}`)
          .once('transactionHash', (hash) => {
            promiEvent.eventEmitter.emit('transactionHash', hash);
          })
          .once('receipt', (receipt) => {
            promiEvent.eventEmitter.emit('receipt', receipt);
          })
          .then((receipt) => {
            promiEvent.resolve(receipt);
          })
          .catch((error) => {
            promiEvent.reject(`Error sending transaction: ${error}`);
          });
      }
    })
    .catch((error) => {
      promiEvent.reject(`error occured: ${error}`);
    });

  return promiEvent.eventEmitter;
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
  console.log('Fetching data...');
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
