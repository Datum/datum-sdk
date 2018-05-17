const DatumClient = require('../src/Datum');


//sample data from encryptPrivate.js
var encryptedData = 'U2FsdGVkX18zYeIsw42HFLGjmghHvAJpzbGIEjIQUnNjTVTbBYUsJHpalerrv1Jc';

//private secert
var secret = "Test1jöjöadsfölkjklsdajfökjakösdfkjfölöfsöf23";


//sample data
var dataExample = {
    email: "florian@datum.org"
}

let client = new DatumClient();
//encrypt data local with private secret
client.decryptPrivate(encryptedData, secret)
.then(decryptedData => {
    console.log(decryptedData);
})
.catch((error) => {
    console.log(error);
});

