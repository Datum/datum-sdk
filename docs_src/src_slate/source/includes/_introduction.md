# Introduction

Welcome to the Datum API. This software development kit allows for users to gain access to the Datum Network, where the user can store, read, write, update and delete the data on the Datum Network as
well as purchasing and selling data on the Datum Marketplace.

##Getting Started: Adding the Datum sdk

The first step is install the package from npm

>Package installation

```javascript

Npm: npm install datum-sdk
````

Once that package has been installed, a datum instance must be created.

>Datum Instance

```javascript
const Datum = require('datum-sdk');

var datum = new Datum(DatumEndpoint, [StorageEndpoint, PrivateKey]);
```

The DatumEndpoint represents any Datum Blockchain HTTP Endpoint
StorageEndpoint is the storage node public HTTP endpoint where the data has been posted
PrivateKey represents the identify of the user.

The StorageEndpoint and Private key are optional if no transactions to storage node and network are done.

In order to store data on the Datum Network, a datum identity (that also creates a privateKey) must have been generated.
To act in the network sufficient balance of DAT coins is needed. You can use the DAT Faucet service for that.
To send any transaction in Ethereum you need to get some Test ETH from https://faucet.rinkeby.io/

Before you start to interact with Datum Blockchain be sure that your wallet has ETH and DAT balance.
You can check this with https://rinkeby.etherscan.io/address/[wallet address]

![](etherscan.png)


>Public DatumEndpoints

```javascript
https://node-us-west.datum.org/api
```
```javascript
https://node-asia.datum.org/api
```
```javascript
https://node-eu.datum.org/api
```

> Public StorageEndpoint

```javascript
https://node-us-west.datum.org/storage
```

> Faucet some DAT for Rinkeby Testnet under

```javascript

http://52.232.119.164:8081/v1/faucet/dat/[wallet address]
```




