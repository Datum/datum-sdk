var Datum = require('../index');

/* stores some data to datum network */
/* You must have a datum identity with DATCoins filled */
/* Faucet some DATS/ETH for Rinkeby Testnet under 
    DAT:    http://52.232.119.164:8081/v1/faucet/dat/[wallet address]
    ETH:    http://52.232.119.164:8081/v1/faucet/eth/[wallet address]
*/




//1. Create Identity
var ident = { address: '0x348f3dbD1F99D735aB7fbB2fB0d56a6Ecc89EAAD',privateKey: '0x23b3c65fbdd71b5511f1a2072f2ec8699d1aed16259f4721a64dc61316f96f2f',publicKey: '1af89cd0f9d6abd3ea1496a1c0de9df747aea0ef205e6e6e72c3e2104fd46a210e414ec9ca547c0b05cb11ce9696fdc325187f26ecff6774f0af822288f68149'};
var p = new Datum("http://localhost:8545", "", ident.privateKey);


//2. Transfer 10 DAT's from Rinkeby to sidechain)
/*
var x = p.transfer(10000000000000000000)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/



//3. calculate costs , estimate 10 MB for 1 year
/*
p.getStorageCosts(1024 * 1024, 365)
.then(costs => {
    console.log(costs);
    console.log(p.toDAT(costs));
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/


//4. prepare data for network
var data = p.storageManager.prepareData('123');
console.log(data);

//5. add storage request to smart contract


/*
p.storageManager.events.on('transactionHash', function(hash) {
    console.log(hash);
});

p.storageManager.initStorage(data.id, 'DEMO_STATS', '', 'sample', 0, 1, 360, data.encryptedSecret)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/




/*
p.storageManager.post(data.id, 'asdfjsadköfjöksa dfjölkjasdköfjlkösdfjladj öjsadöfjölsd jöslfjöasdföasdj öasdjf ljadsjfö j')
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});



p.storageManager.get(data.id)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
});
*/


//6. upload data to storage node

//create identity once, e.g.
/*
{ address: '0x348f3dbD1F99D735aB7fbB2fB0d56a6Ecc89EAAD',
  privateKey: '0x23b3c65fbdd71b5511f1a2072f2ec8699d1aed16259f4721a64dc61316f96f2f',
  publicKey: '1af89cd0f9d6abd3ea1496a1c0de9df747aea0ef205e6e6e72c3e2104fd46a210e414ec9ca547c0b05cb11ce9696fdc325187f26ecff6774f0af822288f68149' 
}
*/
/*
var ident = p.createIdentity();
console.log(ident);

ident = { address: '0x348f3dbD1F99D735aB7fbB2fB0d56a6Ecc89EAAD',privateKey: '0x23b3c65fbdd71b5511f1a2072f2ec8699d1aed16259f4721a64dc61316f96f2f',publicKey: '1af89cd0f9d6abd3ea1496a1c0de9df747aea0ef205e6e6e72c3e2104fd46a210e414ec9ca547c0b05cb11ce9696fdc325187f26ecff6774f0af822288f68149'};
*/

 
//faucet some ETH/DAT to this address to act in the network
//http://52.232.119.164:8081/v1/faucet/dat/0x348f3dbD1F99D735aB7fbB2fB0d56a6Ecc89EAAD
//http://52.232.119.164:8081/v1/faucet/eth/0x348f3dbD1F99D735aB7fbB2fB0d56a6Ecc89EAAD


//check on etherscan (rinkeby) that arrived

//send some DAT to Datum sidechain







/*
p.web3.events.on('signingTransaction', function(value) {
    console.log(value);
});

p.web3.events.on('signedTransaction', function(value) {
    console.log(value);
});



p.storageManager.deposit("1")
.then(tx => {
    console.log(tx);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/