# Authentication


##Creating a developer account on Datum

	The first step is to create an account on Datum using the createIdentity function.

>createIdentity

```javascript
datum.createIdentity()
.then(identity => {
    console.log(result);
})
.catch(error => {
    console.log(error);
})
```
Once that has been transacted, a public/private key and a wallet address will be provided.
The private key must be kept secure for future decryption and third party data encryption.

##Contract

Once private, public key and wallet address have been received, a contract must be signed to initiate the allocation of storage on the Datum Network.
The assigned space is affiliated with the private key.

> Contract

```javascript

const DatumClient = require('../src/Datum');


let client = new DatumClient();


let ident;

client.createIdentity()
.then(identity => {
    ident = identity;
    return client.createInitStorageTransaction(identity.address)
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
