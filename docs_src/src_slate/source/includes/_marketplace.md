#Data Marketplace

##Initialising the Bid

```javascript
const DatumClient = require('../src/Datum');


let client = new DatumClient();


let ident;

let auctionId = "0x2c26ae8c66d23a2262969a8b176119aea400cc05a82fc625a03321a4dc50a944";

client.createIdentity()
.then(identity => {
    ident = identity;
    return client.createAuctionBidTransaction(identity.address, auctionId, 100);
})
.then(tx => {
    //remove 0x from private key
    return client.signRawTransaction(tx, new Buffer(ident.privateKey.slice(2), 'hex'));
})
.then(signedTransaction => {
    return client.sendSignedTransaction(signedTransaction);
})
.then(result => {
    console.log(result);
})
.catch((error) => {
    console.log(error);
});

```
##Bidding

```javascript
const DatumClient = require('../src/Datum');


let client = new DatumClient();

let ident;
let auctionId = '0x2c26ae8c66d23a2262969a8b176119aea400cc05a82fc625a03321a4dc50a944';


client.setPrivateKey('xxxxxxxx');
client.setPublicAddress('xxxxxxx');
client.bidAuction(auctionId, 200)
.then(txResult => {
    //auction submitted to network
    console.log(result);
})
.catch((error) => {
    console.log(error);
});
```

##Settling the Bid




##Bid Contract

```javascript
const DatumClient = require('../src/Datum');


let client = new DatumClient();


let ident;

let auctionId = "0x2c26ae8c66d23a2262969a8b176119aea400cc05a82fc625a03321a4dc50a944";

client.createIdentity()
.then(identity => {
    ident = identity;
    return client.createAuctionBidTransaction(identity.address, auctionId, 100);
})
.then(tx => {
    //remove 0x from private key
    return client.signRawTransaction(tx, new Buffer(ident.privateKey.slice(2), 'hex'));
})
.then(signedTransaction => {
    return client.sendSignedTransaction(signedTransaction);
})
.then(result => {
    console.log(result);
})
.catch((error) => {
    console.log(error);
});
```



##Acquiring the data stored

```javascript

const DatumClient = require('../src/Datum');

let client = new DatumClient();

var storageEndPoint = "http://localhost:3000/storage";

//example data
var dataId = "0xc8e2ef39a58e4d50c5d1c15fef69cede83fc815cbb99339417ab561c88002e55";

//private secret
var secret = "Test1jöjöadsfölkjklsdajfökjakösdfkjfölöfsöf23";

//set keys
client.setPrivateKey('xxxxxxxx');
client.setPublicAddress('xxxxxxx');

//create hash of data which represent the data id
client.getSignedTimestampMessage()
.then(message => {
    request.post({
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        url: storageEndPoint + '/download',
        body: "id=" + dataId + "&signature=" + message.signature
    }, function (error, response, body) {
        return client.decryptPrivate(response.body, secret)
    });
})
.then(content => {
    console.log(content);
})
.catch((error) => {
    console.log(error);
});
```
