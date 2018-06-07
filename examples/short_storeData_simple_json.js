const DatumClient = require('../src/Datum');
let client = new DatumClient();

//example data
var dataExample = {
    email: "peter@example.org",
    wallet: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}

//private secret 
var secret = "Test1jöjöadsfölkjklsdajfökjakösdfkjfölöfsöf23";

client.setPrivateKey('0xfedcb2355436330749e0590c5f6d1e0f23bc9bd6aea9fb4b0184815346199d44');
client.uploadData(JSON.stringify(dataExample), secret)
.then(result => {
    //result is the data id
    console.log(result);
})
.catch((error) => {
    console.log(error);
});

