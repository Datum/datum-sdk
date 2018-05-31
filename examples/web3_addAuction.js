const DatumClient = require('../src/Datum');


let client = new DatumClient();


let ident;

client.createIdentity()
.then(identity => {
    ident = identity;
    return client.createAddAuctionTransaction(identity.address, 200, 10, 1, 100000);
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


