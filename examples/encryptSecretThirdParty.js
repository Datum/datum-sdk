const DatumClient = require('../src/Datum');


//private secert
var secret = "Test1jöjöadsfölkjklsdajfökjakösdfkjfölöfsöf23";

let client = new DatumClient();


let privKey = '';

//create identy for third party and encrypt with public key from third party then decrypt with private key to get plaintext secret back
client.createIdentity()
.then(identity => {
    privKey = identity.privateKey;
    return client.encryptPublic(secret, '0x' + identity.publicKey);
})
.then(result => {
    var priv = privKey.slice(2);
    return client.decryptPublic(result,priv);
})
.then(decrypted => {
    console.log(decrypted);
})
.catch((error) => {
    console.log(error);
});



