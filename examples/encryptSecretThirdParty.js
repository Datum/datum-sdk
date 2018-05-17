const DatumClient = require('../src/Datum');


//private secert
var secret = "Test1jöjöadsfölkjklsdajfökjakösdfkjfölöfsöf23";

let client = new DatumClient();

//create identy for third party
client.createIdentity()
.then(identiy => {
    return client.encryptPublic(secret, '0x' + identiy.publicKey);
})
.then(encrypted => {
    console.log(encrypted);
})
.catch((error) => {
    console.log(error);
});



