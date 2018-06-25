var Datum = require('../index');

/* create a datum identity with private and public key/address */

var datum = new Datum("http://40.65.116.213:8545", "https://node-eu-west.datum.org/storage");


datum.web3.web3.eth.getBalance('0x9ef032165bacae220ed7d9b01c4de7da69a3f078')
.then(balance => {
    console.log(balance);
})
