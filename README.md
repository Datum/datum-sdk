# datum-sdk
*javascript api for Datum Blockchain*

npm install datum-sdk --save

## Documentations

[Getting Started](https://gettingstarted.datum.org/)


### Create new Instance

```
const Datum = require('datum-sdk');

var datum = new Datum(DatumEndpoint, [StorageEndpoint, PrivateKey]);
```

DatumEndpoint	Any Datum Blockchain HTTP Endpoint

StorageEndpoint	[Optional] If already clear, set the storage endpoint here

PrivateKey	[Optional] If identy already exists, identify yourself with the key


/* stores some data to datum network */

/* You must have a datum identity with DATCoins filled */

/* Faucet some DATS/ETH for Rinkeby Testnet under 
```
    DAT:    http://52.232.119.164:8081/v1/faucet/dat/[wallet address]
```
*/



### Create Identity

*creates an identity object with public/private key and public address*

```
var identity = datum.createIdentity();
```

Result
```
{ address: '0x18B13d1D60ed35C6A700A939AA17c1AdB4002517',
  privateKey: '0x369b224ff734ee7863086f84be9cb5b80322b49b3935effa9fd4ba6f334e8e93',
  publicKey: '3a1b15d7f542e4ebe65be15af1b6024938a17d31e57867f919806cce7137c9147a30744c307b8ac8541b050547bb5a9dd58deec918fcd3cf517b42f0fc0ffbeb' }
```


### Transfer to Datum Blockchain

*transfer DAT (in wei) from Ethereum to Datum Blockchain*

```
datum.transfer(10000000000000000000)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
})
```



### Calculate Storage Costs, e.g. 1MB for 365 days

*calculcate the storage costs for given size and duration*

```
datum.getStorageCosts(1024 * 1024, 365)
.then(costs => {
    console.log(costs);
    console.log(p.toDAT(costs));
})
.catch(error => {
    console.log('error');
    console.log(error);
})
```

### Prepare data for storage node

*random secret will be generated and the data will be encrypted with publicKey from owner*

```
var data = datum.prepareData('123');
```


### Deposit some DAT tokens to storage contract

*transfer 10 DAT from your wallet in Datum Blockchain to the storage smart contract*

```
datum.deposit(10)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
})
```



### Full Flow

*represent a full flow from deposit to storage contract init and upload some data and retrieve the data back*

```
var data = datum.prepareData('Some sample data');

datum.deposit(10)
.then(result => {
    console.log('deposit done');
    return datum.setAndInit(data, "Profiles", "category",1,1,360, "metaData");
})
.then(result => {
    console.log('upload done');
    return datum.get(data.id);
})
.then(result => {
    console.log('download done');
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
```

### Init Storage to Datum Blockchain

*init storage in smart contract*

```
datum.initStorage(data, "Profiles", "sample_category",1,1,360, "metaData")
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
```


### Upload / Set the data to storage node and init in same turn

*init storage in smart contract and upload data in same turn*

```
datum.setAndInit(data, "Profiles", "category",1,1,360, "metaData")
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
```


### Upload / Set the data to storage node (initStorage already done)

*set/upload data to a storage node*

```
datum.set(data)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
```


### Upload / Set the data to storage node with key assigned

*set/upload data to a storage node with a keyname*

```
datum.setWithKey(data, "key_name")
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
```


### Download / Get the data to storage node

*get/download data from storage node*

```
datum.get(data.id)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
```


### Download / Get the data from storage node by keyname

*get/download data from storage node with key name*

```
datum.getWithKey("key_name")
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
```


### Remove the data to storage node

*remove data from storage node*

```
datum.remove(data.id)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
```


### Set private key

*set the private/developer key after datum instace already exists*

```
datum.setDeveloperKey(data.id)
```


### Events

*you can catch several events for all blockchain related methods*


```

Getting the raw transaction before signing

datum.events().on('beforeSignTransaction', (tx) => {
    console.log(tx);
});

Getting the signed transaction

datum.events().on('afterSignTransaction', (txSigned) => {
    console.log(txSigned);
});

Getting the transaction hash after the broadcast to network

datum.events().on('transactionHash', (hash) => {
    console.log(hash);
});

Getting the block information where the transaction was mined in

datum.events().on('receipt', (receipt) => {
    console.log(receipt);
});

 ```