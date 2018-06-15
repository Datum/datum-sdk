# API

Datum provides users to store their data on the Datum Blockchain.

##Encryption using Private key

```javascript

const DatumClient = require('../src/Datum');


//sample data
var dataExample = {
    email: "florian@datum.org"
}

//private secert
var secret = "Test1jöjöadsfölkjklsdajfökjakösdfkjfölöfsöf23";

let client = new DatumClient();
//encrypt data local with private secret
client.encryptPrivate(JSON.stringify(dataExample), secret)
.then(encryptedData => {
    console.log(encryptedData);
})
.catch((error) => {
    console.log(error);
});

```

##Encryption using Public key

```javascript
const DatumClient = require('../src/Datum');


//private secert
var secret = "Test1jöjöadsfölkjklsdajfökjakösdfkjfölöfsöf23";

let client = new DatumClient();


let privKey = '';

//create identy for third party and encrypt with public key from third party then decrypt with private key to get plaintext secret back
client.createIdentity()
.then(identity => {
    privKey = identity.privateKey;
    return client.encryptPublic(secret, '0x' + identity.publicKey);
})
.then(result => {
    var priv = privKey.slice(2);
    return client.decryptPublic(result,priv);
})
.then(decrypted => {
    console.log(decrypted);
})
.catch((error) => {
    console.log(error);
});
```
##Decryption using Private key

```javascript
const DatumClient = require('../src/Datum');


//sample data from encryptPrivate.js
var encryptedData = 'U2FsdGVkX18zYeIsw42HFLGjmghHvAJpzbGIEjIQUnNjTVTbBYUsJHpalerrv1Jc';

//private secert
var secret = "Test1jöjöadsfölkjklsdajfökjakösdfkjfölöfsöf23";


//sample data
var dataExample = {
    email: "florian@datum.org"
}

let client = new DatumClient();
//encrypt data local with private secret
client.decryptPrivate(encryptedData, secret)
.then(decryptedData => {
    console.log(decryptedData);
})
.catch((error) => {
    console.log(error);
});
```
##Hash function

```javascript
const DatumClient = require('../src/Datum');


//sample data
var dataExample = {
    email: "florian@datum.org"
}


//ATTENTION: json data must be stringified
let client = new DatumClient();
client.hash(JSON.stringify(dataExample)).then(hash => {
    console.log(hash);
})
.catch((error) => {
    console.log(error);
});
```
