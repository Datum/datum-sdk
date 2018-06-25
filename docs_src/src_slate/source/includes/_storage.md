# Storage

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

##Full Flow

This describes a full flow to interact with Datum Blockchain
- prepare some data for upload to the network (create secret, encrypt data)
- deposit some DAT to contract
- initalize a storage contract in blockchain
- upload some data
- download some data

>Full flow

```javascript

const Datum = require('datum-sdk');

let datum = new Datum("https://node-us-west.datum.org/api", "https://node-eu-west.datum.org/storage", [privateKey]);

var data = datum.prepareData('{"use355fsdf4ssrId":3435,"id":1,"title":"sunt asdf aut facere repellat provident occaecati excepturi optio reprehenderit","body":"quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto"}');

datum.deposit(10)
.then(result => {
    console.log('deposit done');
    return datum.setAndInit(data, "Profiles", "category",1,1,360, "metaData");
})
.then(result => {
    console.log('inti done');
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



##Upload

Once the encryption and verification process has been concluded, the data can now be uploaded to the Datum network through the uploadData function. There are three parts to storing data on the network.

![](upload.png)

> Initializing Storage to Datum Blockchain and upload some data

```javascript

const Datum = require('datum-sdk');

let datum = new Datum("https://node-us-west.datum.org/api", "https://node-eu-west.datum.org/storage", [privateKey]);

var data = datum.prepareData('{"use355fsdf4ssrId":3435,"id":1,"title":"sunt asdf aut facere repellat provident occaecati excepturi optio reprehenderit","body":"quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto"}');


datum.setAndInit(data, "User_Profiles", "category",1,1,360, "metaData")
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
```

Set/Upload Data to node after the storage is initalized

```javascript
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

Upload some data with given key name

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

##Download

There are two methods to get the data from the storage node on the blockchain; one is through directly using the id of the data and the other is by the key value pertaining to the data.


>Get data from storage mode

Download 

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

Download some data with given key name

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

Delete data from storage node

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

