# Authentication


##Creating a developer account on Datum

	The first step is to create an account on Datum using the createIdentity function.

>createIdentity

```javascript
const Datum = require('datum-sdk');

let datum = new Datum();

var identity = datum.createIdentity();
```
Once that has been transacted, a public/private key and a wallet address will be provided.
The private key must be kept secure for future decryption and third party data encryption.

##Contract

Once private, public key and wallet address have been received, a contract must be signed to initiate the allocation of storage on the Datum Network.
The assigned space is affiliated with the private key.

> Contract

```javascript
const Datum = require('datum-sdk');

let datum = new Datum("https://node-us-west.datum.org/api", "https://node-eu-west.datum.org/storage", [privateKey]);

let data = datum.prepareData('{"userId":1,"id":1,"title":"sunt aut facere repellat provident occaecati excepturi optio reprehenderit","body":"quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto"}');

datum.initStorage(data.id, 'PROFILE_DATA', '', 'sample', 0, 1, 360, data.encryptedSecret)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})