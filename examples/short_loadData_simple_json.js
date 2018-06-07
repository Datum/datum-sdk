const DatumClient = require('../src/Datum');


let client = new DatumClient();


//example data
var dataExample = {
    email: "peter@example.org",
    wallet: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}

//private secret 
var secret = "Test1jöjöadsfölkjklsdajfökjakösdfkjfölöfsöf23";

//id of data in storage node
var dataId = '0xc8e2ef39a58e4d50c5d1c15fef69cede83fc815cbb99339417ab561c88002e55';


client.setPrivateKey('0xfedcb2355436330749e0590c5f6d1e0f23bc9bd6aea9fb4b0184815346199d44');

client.downloadData(dataId)
.then(result => {
    //encrypted data content
    console.log(result);
})
.catch((error) => {
    console.log(error);
});



