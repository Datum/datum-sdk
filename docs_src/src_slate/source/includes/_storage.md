# Storage
##Verification

To confirm whether the developer account has been deposited on the blockchain, one can verify through the function canStoreData.

>canStoreData

```javascript

const DatumClient = require('../src/Datum');


let client = new DatumClient();

//check if user can store data (checks if deposit for address exists)
client.createIdentity()
.then(identity => {
    return client.canStoreData(identity.address);
})
.then(result => {
    console.log(result);
})
.catch((error) => {
    console.log(error);
});
```

##Storage Cost

Use the method getStorageCosts to obtain the cost associated with uploading data on the Datum Blockchain based on size of data in [units] and duration of storage in [units].
The example is for 1MB of storage for 365 days.

>getStorageCosts

```javascript
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

##Upload

Once the encryption and verification process has been concluded, the data can now be uploaded to the Datum network through the uploadData function. There are three parts to storing data on the network.

![](upload.png)

> Initializing Storage to Datum Blockchain

```javascript

datum.initStorage(data, 'EMAIL', merkle_root, 'private', 0, 1, 360)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})

Set/Upload Data to node

datum.set(data)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
```

> Set/Upload Data to node with Key value assigned

```javascript
datum.setWithKey(data, "key_name")
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
```

>Set/Upload Data to node with init Storage

```javascript
datum.setAndInit(data, 'EMAIL', merkle_root, 'private', 0, 1, 360)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});

```
##Download

There are two methods to get the data from the storage node on the blockchain; one is through directly using the get Method and the other is by the key value pertaining to the data.


>Get data from storage mode

```javascript

datum.get(data.id)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
```

>Get data from storage node using key value

```javascript
datum.getWithKey("key_name")
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
```
##Delete

Utilize the remove method to permanently delete the data from the blockchain

>Remove

```javascript
datum.remove(data.id)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
```

