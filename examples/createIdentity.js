const DatumClient = require('../src/Datum');


let client = new DatumClient();
client.createIdentity().then(identity => {
    console.log(identity);
})
.catch((error) => {
    console.log(error);
});
