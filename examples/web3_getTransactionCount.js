const DatumClient = require('../src/Datum');


let client = new DatumClient();


client.getTransactionCount("0xbDDB8404281d830dE5E200EB241aeC3c97D885BC")
.then(count => {
    console.log(count);
})
.catch((error) => {
    console.log(error);
});


client.createInitStorageTransaction("0xbDDB8404281d830dE5E200EB241aeC3c97D885BC")
.then(tx => {
    console.log(tx);
})
.catch((error) => {
    console.log(error);
});