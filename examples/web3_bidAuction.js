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


