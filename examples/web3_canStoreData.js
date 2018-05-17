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

