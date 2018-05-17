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

