# Storage
##Verification

To confirm whether the developer account has been deposited on the blockchain, one can verify through the function canStoreData.

>canStoreData

```javascript

const Datum = require('datum-sdk');

let datum = new Datum("https://node-us-west.datum.org/api", "https://node-eu-west.datum.org/storage", [privateKey]);

//check if user can store data (checks if deposit for address exists)
datum.createIdentity()
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

const Datum = require('datum-sdk');

let datum = new Datum("https://node-us-west.datum.org/api", "https://node-eu-west.datum.org/storage", [privateKey]);

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

const Datum = require('datum-sdk');

let datum = new Datum("https://node-us-west.datum.org/api", "https://node-eu-west.datum.org/storage", [privateKey]);

datum.initStorage(data, 'EMAIL', merkle_root, 'private', 0, 1, 360)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})

Set/Upload Data to node

const Datum = require('datum-sdk');

let datum = new Datum("https://node-us-west.datum.org/api", "https://node-eu-west.datum.org/storage", [privateKey]);

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

const Datum = require('datum-sdk');

let datum = new Datum("https://node-us-west.datum.org/api", "https://node-eu-west.datum.org/storage", [privateKey]);

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
const Datum = require('datum-sdk');

let datum = new Datum("https://node-us-west.datum.org/api", "https://node-eu-west.datum.org/storage", [privateKey]);

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

const Datum = require('datum-sdk');

let datum = new Datum("https://node-us-west.datum.org/api", "https://node-eu-west.datum.org/storage", [privateKey]);

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

const Datum = require('datum-sdk');

let datum = new Datum("https://node-us-west.datum.org/api", "https://node-eu-west.datum.org/storage", [privateKey]);

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
const Datum = require('datum-sdk');

let datum = new Datum("https://node-us-west.datum.org/api", "https://node-eu-west.datum.org/storage", [privateKey]);

datum.remove(data.id)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
```

