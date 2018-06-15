# datum-sdk
*javascript api for Datum Blockchain*

npm install datum-sdk --save

## Full Documentation

## Examples

### Create new Instance

```
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
    ETH:    http://52.232.119.164:8081/v1/faucet/eth/[wallet address]
```
*/



### Create Identity

```
datum.createIdentity()
.then(identity => {
    console.log(result);
})
.catch(error => {
    console.log(error);
})
```


### Transfer to Datum Blockchain

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


### Init Storage to Datum Blockchain

```
datum.initStorage(data, 'EMAIL', merkle_root, 'private', 0, 1, 360)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
```


### Upload / Set the data to storage node and init in same turn

```
datum.setAndInit(data, 'EMAIL', merkle_root, 'private', 0, 1, 360)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
```


### Upload / Set the data to storage node (initStorage already done)

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

```
datum.remove(data.id)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
```

