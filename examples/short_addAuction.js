const DatumClient = require('../src/Datum');


let client = new DatumClient();

let ident;
let dataId = '0x2c26ae8c66d23a2262969a8b176119aea400cc05a82fc625a03321a4dc50a944';


client.setPrivateKey('xxxxxxxx');
client.setPublicAddress('xxxxxxx');
client.addAuction(dataId, 200, 0,1,0)
.then(txResult => {
    //auction submitted to network
    console.log(result);
})
.catch((error) => {
    console.log(error);
});


