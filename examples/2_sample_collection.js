var Datum = require('../index');

/* stores some data to datum network */
/* You must have a datum identity with DATCoins filled */
/* Faucet some DATS/ETH for Rinkeby Testnet under 
    DAT:    http://52.232.119.164:8081/v1/faucet/dat/[wallet address]
    ETH:    http://52.232.119.164:8081/v1/faucet/eth/[wallet address]
*/



var ident = { address: '0x348f3dbD1F99D735aB7fbB2fB0d56a6Ecc89EAAD', privateKey: '0x23b3c65fbdd71b5511f1a2072f2ec8699d1aed16259f4721a64dc61316f96f2f', publicKey: '1af89cd0f9d6abd3ea1496a1c0de9df747aea0ef205e6e6e72c3e2104fd46a210e414ec9ca547c0b05cb11ce9696fdc325187f26ecff6774f0af822288f68149' };


/*
const ident = {
    address: '0x2885Cb71817d46929c32843475C0E450Cb37211E',
    privateKey: '0xa3ddf051c73c81eda9a3467148083a828de607a4733e48db06d9d66f7beafbee',
    publicKey: '81f67be218c87536f6f668848df809f9e82855b076d60c98a480837d4d8a21ecaa7f3c2d68645c3a1b11887832719ea76262c7448ae65cc7ed25dad63e2068f5'
   };

   */


var datum = new Datum("http://40.65.116.213:8545", "http://localhost:8081", ident.privateKey);

//data to store
var data = datum.prepareData('{"use355fsdf4ssrId":3435,"id":1,"title":"sunt asdf aut facere repellat provident occaecati excepturi optio reprehenderit","body":"quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto"}');


data.id = '0xed85f90ebae04e7fd60ca4bb56cf4b1ae7afcba1f95b5a7c70342330bc0e84eb';





/*
datum.events().on('beforeSignTransaction', (tx) => {
    console.log('beforeSignTransaction');
    console.log(tx);
});

datum.events().on('afterSignTransaction', (txSigned) => {
    console.log('afterSignTransaction');
    console.log(txSigned);
});

datum.events().on('transactionHash', (hash) => {
    console.log('broadcasted');
    console.log(hash);
});

datum.events().on('receipt', (receipt) => {
    console.log('mined');
    console.log(receipt);
});

*/


/*
datum.setAndInit(data, "User_Profiles", "category",1,1,360, "metaData")
.then(result => {
    console.log(result);
    console.log('mined wait for confirmation');

    return datum.get(data.id);
})
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log(error);
})
*/



datum.get(data.id)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})


var newData = datum.prepareData('{"AAAAAA":3435,"id":1,"title":"sunt asdf aut facere repellat provident occaecati excepturi optio reprehenderit","body":"quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto"}');


newData.id = '0xed85f90ebae04e7fd60ca4bb56cf4b1ae7afcba1f95b5a7c70342330bc0e84eb';




datum.set(newData)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})


datum.get(newData.id)
.then(result => {
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
    console.log(error);
})
*/

//console.log(data);


/*
datum.remove(data.id)
.then(result => {
    console.log(result);
})
.catch(error => {
    console.log('error');
    console.log(error);
})
*/




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


/*
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



//console.log(data);

/*
data = { id: '0x8963d9f451a67d4ddd83435f93020f3a83cd400e41be02c184790f135627ba73',
encryptedSecret: '0x4bb22fc4f5dadd210a63de7454fb1692045503adde1cc51966960f4df879a1682ec766e8c9ec9e665c2b9bf319642d3fb4e5594d23841c5797465900cdb70431bd409b814ee75ecec64ede75c71fa4682011d701d3023547e691d6f5007d03fc8dc38620cffce45f2805db75f48c7e5ca0be064f9d7b41029a56bcd2eb5dedf71b',
encryptedData: 'VTJGc2RHVmtYMSt6d3hBdVA2Vng5L1NQb3Y5SlhFdVRsT0hyMzhaSWhVcVBURlhkUm0xVWNiVFg3QkFLZGh2NmNzcEw5VWkzWDhkR2wzTUJvUzlzZHZBYUhxZDB3WmVwc01wZEFacFgzeXRwTzZ1TFBYT3dEVUlCanRRcTdwVFJ4S054bE5PeHVqVkRuRDJJaWtwT0hwdWZMRUxHaWpRcVh3cW9oNWRuR0lBUnZmQy9rSno0U3B3RWRleTdFWlJ2Y1lUUi9iRlJ2VTB3KyswOUVQdEtxR01hOE80emxLemp4M09OYjdQeHoyQzc1WWxuenRwVHFTU25GQ2NVbWlpRHU4Zm9RZHdyOFZBc0FwWXM5a1Q2WlVrV0xoWmlaYWM3dFFLZnVramQ5SXc2aU5FUTlaM2U2cDJiNDMvdmtEeHJxUFpNQTY1bnlyQXJieWZDYTVCcnhOOWlSeUZFTk9wTHR4eGhCd2J0YnB6cVA4akdvdWhMSm5FcG9BcXYvSFBZS0NicHNoQ21scWJIYy9paWo0QVA0QT09' };
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