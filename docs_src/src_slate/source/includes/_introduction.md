# Introduction

Welcome to the Datum API. This software development kit allows for users to gain access to the Datum Network, where the user can store, read, write, update and delete the data on the Datum Network as
well as purchasing and selling data on the Datum Marketplace.

##Getting Started: Adding the Datum sdk


The first step is install the package.

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

The DatumEndpoint represents any Datum Blockchain HTTP Endpoint, whereas StorageEndpoint is the storage node public HTTP endpoint where the data has been posted and PrivateKey is the identifier of the user.
In order to store data on the Datum Network, a datum identity must have been generated with sufficient balance of DAT coins.
The StorageEndpoint and Private key are optional if no transactions to storage node are done.

> Faucet some DAT for Rinkeby Testnet under

```javascript

DAT:    http://52.232.119.164:8081/v1/faucet/dat/[wallet address]
```




