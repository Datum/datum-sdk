const DatumClient = require('../src/Datum');


//sample data
var dataExample = {
    email: "florian@datum.org"
}

//private secert
var secret = "Test1jöjöadsfölkjklsdajfökjakösdfkjfölöfsöf23";

let client = new DatumClient();
//encrypt data local with private secret
client.encryptPrivate(JSON.stringify(dataExample), secret)
.then(encryptedData => {
    console.log(encryptedData);
})
.catch((error) => {
    console.log(error);
});

