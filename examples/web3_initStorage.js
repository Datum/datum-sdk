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
    console.log(signedTransaction);
})
.catch((error) => {
    console.log(error);
});


