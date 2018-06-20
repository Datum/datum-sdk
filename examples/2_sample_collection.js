var Datum = require('../index');

/* stores some data to datum network */
/* You must have a datum identity with DATCoins filled */
/* Faucet some DATS/ETH for Rinkeby Testnet under 
    DAT:    http://52.232.119.164:8081/v1/faucet/dat/[wallet address]
    ETH:    http://52.232.119.164:8081/v1/faucet/eth/[wallet address]
*/



var ident = { address: '0x348f3dbD1F99D735aB7fbB2fB0d56a6Ecc89EAAD',privateKey: '0x23b3c65fbdd71b5511f1a2072f2ec8699d1aed16259f4721a64dc61316f96f2f',publicKey: '1af89cd0f9d6abd3ea1496a1c0de9df747aea0ef205e6e6e72c3e2104fd46a210e414ec9ca547c0b05cb11ce9696fdc325187f26ecff6774f0af822288f68149'};

/*
const ident = {
    address: '0x2885Cb71817d46929c32843475C0E450Cb37211E',
    privateKey: '0xa3ddf051c73c81eda9a3467148083a828de607a4733e48db06d9d66f7beafbee',
    publicKey: '81f67be218c87536f6f668848df809f9e82855b076d60c98a480837d4d8a21ecaa7f3c2d68645c3a1b11887832719ea76262c7448ae65cc7ed25dad63e2068f5'
   };

   */
   
var datum = new Datum("http://40.65.116.213:8545", "https://node-eu-west.datum.org/storage", ident.privateKey);

//data to store
var data = datum.prepareData('{"use34ssrId":3435,"id":1,"title":"sunt asdf aut facere repellat provident occaecati excepturi optio reprehenderit","body":"quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto"}');
//console.log(data);

/*
console.log( ident.publicKey);
console.log(datum.privateToPublic(ident.privateKey));
*/

/*
var r = datum.crypt.ethEncrypt("TEST",  '0x' + ident.publicKey);
console.log(r);
var plaintextSecret = datum.crypt.ethDecrypt(r,  ident.privateKey.substring(2));
console.log(plaintextSecret);
*/

/*
var r = datum.crypt.ethEncrypt("TEST",  '0x' + ident.publicKey);
console.log(r);


const ecies = require("eth-ecies");
let plaintext = new Buffer('{foo:"bar",baz:42}');
let encryptedMsg = ecies.encrypt(new Buffer('0x'+ ident.publicKey), plaintext);
console.log(encryptedMsg);
*/
//let plaintextBack = ecies.decrypt(ident.privateKey, encryptedMsg);
//console.log(plaintextBack);



/*
var x = datum.transfer(10000000000000000000)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/


/*
var r = datum.crypt.ethEncrypt("TEST",  '0x' + ident.publicKey);
console.log(r);
var plaintextSecret = datum.crypt.ethDecrypt(r,  ident.privateKey);
console.log(plaintextSecret);
*/


/*
datum.get(data.id)
.then(result => {
    console.log(data.encryptedSecret);
    var plaintextSecret = datum.crypt.ethDecrypt(data.encryptedSecret,  ident.privateKey);
    console.log(plaintextSecret);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/

console.log(data);


datum.deposit(10)
.then(result => {
    console.log('deposit done');
    return datum.setAndInit(data, "Profiles", "category",1,1,360, "metaData");
})
.then(result => {
    console.log('upload done');
    return datum.get(data.id);
})
.then(result => {
    console.log('download done');
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})


/*
datum.get(data.id)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/

/*
datum.set(data)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/

/*
datum.get(data.id)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/


/*
datum.initStorage(data, "User_Profiles", "category",1,1,360, "metaData")
.then(result => {
    console.log('init storage done');
    return datum.addKeyToAccessList(data.id, ident.address, data.encryptedSecret);
})
.then(result => {
    console.log('add to access list done');
    return datum.setWithKey(data, "User_Profiles");
})
.then(result => {
    console.log('upload done');
    return datum.getWithKey("User_Profiles");
})
.then(result => {
    console.log('download done');
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/

/*
datum.deposit(10)
.then(result => {
    console.log('deposit done');
    return datum.initStorage(data, "Profiles", "category",1,1,360, "metaData");
})
.then(result => {
    console.log('init storage done');
    return datum.addKeyToAccessList(data.id, ident.address, data.encryptedSecret);
})
.then(result => {
    console.log('add to access list done');
    return datum.set(data);
})
.then(result => {
    console.log('upload done');
    return datum.get(data.id);
})
.then(result => {
    console.log('download done');
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/





/*
datum.initStorage(data, "Profiles", "private",1,1,360, "")
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/


/*
datum.set(data)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/

/*
datum.get(data.id)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/



//deposit DAT to storage contract


/*
datum.deposit(10)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/



//1. Create Identity
//var ident = { address: '0x348f3dbD1F99D735aB7fbB2fB0d56a6Ecc89EAAD',privateKey: '0x23b3c65fbdd71b5511f1a2072f2ec8699d1aed16259f4721a64dc61316f96f2f',publicKey: '1af89cd0f9d6abd3ea1496a1c0de9df747aea0ef205e6e6e72c3e2104fd46a210e414ec9ca547c0b05cb11ce9696fdc325187f26ecff6774f0af822288f68149'};
//var datum = new Datum("http://localhost:8545", "", ident.privateKey);


//var identity = datum.createIdentity();
//console.log(identity);

//let datum = new Datum("http://40.65.116.213:8545","https://node-us-west.datum.org/storage", ident.privateKey);

/*
var data = datum.prepareData('{"userId":1,"id":1,"title":"sunt aut facere repellat provident occaecati excepturi optio reprehenderit","body":"quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto"}');

datum.initStorage(data, 'PROFILE_DATA', '', 'sample', 0, 1, 360, "metadata")
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/

/*
var x = datum.transfer(10000000000000000000)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*///

/*
let datum = new Datum("https://node-us-west.datum.org/api", "https://node-eu-west.datum.org/storage", ident.privateKey);

var data = datum.prepareData('{"userId":1,"id":1,"title":"sunt aut facere repellat provident occaecati excepturi optio reprehenderit","body":"quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto"}');

datum.initStorage(data.id, 'PROFILE_DATA', '', 'sample', 0, 1, 360, data.encryptedSecret)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/




//2. Transfer 10 DAT's from Rinkeby to sidechain)


/*
var x = datum.transfer(10000000000000000000)
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
/*
var data = p.storageManager.prepareData('123');
console.log(data);
*/

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