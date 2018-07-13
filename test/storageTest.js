var chai = require('chai');
//use default BigNumber
chai.use(require('chai-bignumber')());
var assert = chai.assert;
var request = require('async-request')
const Web3 = require('web3');


var Datum = require('../index');
var datum;

const delay = ms => new Promise(r => setTimeout(r, ms));

describe('storage tests', function () {

    //set high timeout because of blockchain actions...
    this.timeout(60000);

    var identity = {
        address: '0x8d927B4305Ddd8BfEF730e6FE2dE5FFF826dA762',
        privateKey: '0x0dec1dc99e0b5cc8ce437edb50e180a33f333a5bea88adc026a53e12b2eb7fdb',
        publicKey: '2da9fb7b45798186ef17fa85cea01322202ba7b83f5ee82244b9a7790ee7f7e2518bd898e440591a28447ed5ad8111d7e4c68a839a95220f1f0b54ea483f97a3'
    };

    //before all tests, create new identity and get some DAT from faucet
    before(async () => {

        /*
        //create identiy 
        identity = Datum.createIdentity();

        //Faucet some dat
        response = await request("http://52.232.119.164:8081/v1/faucet/dat/" + identity.address);

        if (response.statusCode != 200)
            assert.error('faucet failed');

        //check if balance is there
        let balance = await Datum.getBalance(identity.address);
        let nCount = 0;
        while (balance == 0) {
            console.log('check balance...');
            await delay(2000);
            balance = await Datum.getBalance(identity.address);
            nCount++;
            if (nCount >= 15)
                break;
        }

        */

        //create datum instance and init with key
        datum = new Datum();
        datum.initialize({
            privateKey: identity.privateKey,
            network: "http://localhost:8545",
            storage: "http://localhost:8081"
        });

        console.log('ready');

    });


    /*
    describe('balances with fresh account', function () {
        it('get Datum Blockchain balance', async function () {
            //account got faucet of 100 DAT
            let networkBalance = 100;
            let balanceInDat = await Datum.getBalance(identity.address, true);
            assert.isAtLeast(parseFloat(balanceInDat), networkBalance, 'balance should be at least: ' + networkBalance);
        });

        it('get locked balance (before any action done) ', async function () {
            //account used is frozen, so balance should not change!
            let lockedBalance = 0;
            let balance = await Datum.getDepositBalance(identity.address,true);
            assert.equal(parseFloat(balance), lockedBalance, 'locked balance should be: ' + lockedBalance);
        });
    });

    describe('deposit / withdrawal', function () {
        it('deposit to contract', async function () {
            let actualBalance = parseFloat(await Datum.getBalance(identity.address, true));

            //deposit to contract 1 DAT
            await datum.deposit(2);

            //wait for node sync
            await delay(3000);

            //get balances
            let balanceDeposit =  parseFloat(await Datum.getDepositBalance(identity.address,true));
            let balance = parseFloat(await Datum.getBalance(identity.address, true)); 

            assert.isBelow(balance, actualBalance, 'balance should be lower');
            assert.isAtLeast(balanceDeposit, 2, 'deposit balance should at least 1');
        });

        it('withdrawal to contract', async function () {
            let actualBalance = parseFloat(await Datum.getBalance(identity.address, true));
            let actualBalanceDeposit =  parseFloat(await Datum.getDepositBalance(identity.address,true));

            //deposit to contract
            await datum.withdrawal(1);

            //wait for node sync
            await delay(3000);

            //get balances
            let balance = parseFloat(await Datum.getBalance(identity.address,true));
            let balanceDeposit =  parseFloat(await Datum.getDepositBalance(identity.address,true));

            assert.isAbove(balance, actualBalance, 'balance should higher');
            assert.isBelow(balanceDeposit, actualBalanceDeposit, 'deposit balance shoule be reduced');
        });
    });
    */


    describe('item CRUD actions', function () {

        var textDataToStore = "ahdskjlhajkshdjklhajksdhjkahjdslkdhhasd";
        var objectDataToStore = { 
            id: "test", 
            name: "Name" 
        };


        it('store/load item (text)', async function () {
            let id = await datum.set(textDataToStore, "PROFILES");

            //wait for node sync
            await delay(1000);

            //check if correct persisted in blockchain
            var item = await Datum.getItem(id);
            assert.equal(item.id, id, "hash must match");
            assert.equal(item.owner , identity.address);
            assert.isTrue(item.exists, "item must be flagged as exists");

            //download from network
            var originalContent = await datum.get(id);

            assert.equal(originalContent , textDataToStore, "downloaded content must match passed content");
        });


        /*
        it('store/load item (object)', async function () {
            let id = await datum.set(objectDataToStore);

            //wait for node sync
            await delay(1000);

            //check if correct persisted in blockchain
            var item = await Datum.getItem(id);
            assert.equal(item.id, id, "hash must match");
            assert.equal(item.owner , identity.address);
            assert.isTrue(item.exists, "item must be flagged as exists");

            //download from network
            var originalContent = await datum.get(id);

            assert.equal(originalContent , JSON.stringify(objectDataToStore), "downloaded content must match passed content");
        });


        it('store/load item with empty balance', async function () {

            //create new identity
            let identNew = Datum.createIdentity();

            //


            let id = await datum.set(objectDataToStore);

            //wait for node sync
            await delay(1000);

            //check if correct persisted in blockchain
            var item = await Datum.getItem(id);
            assert.equal(item.id, id, "hash must match");
            assert.equal(item.owner , identity.address);
            assert.isTrue(item.exists, "item must be flagged as exists");

            //download from network
            var originalContent = await datum.get(id);

            assert.equal(originalContent , JSON.stringify(objectDataToStore), "downloaded content must match passed content");
        });
        */
        

        /*
        it('delete item (object)', async function () {
            let id = "0xb2d4c3b1200b2f88c04b5f24162771702990b790538e1533f41184d7901f2df6";

            //wait for node sync
            await delay(1000);

            //check if correct persisted in blockchain
            var item = await Datum.getItem(id);
            assert.equal(item.id, id, "hash must match");
            assert.equal(item.owner, identity.address);
            assert.isTrue(item.exists, "item must be flagged as exists");

            //download from network
            var deleted = await datum.remove(id);

            //wait for node sync
            await delay(1000);

            //check if correct persisted in blockchain
            var deletetitem = await Datum.getItem(id);
            console.log(deletetitem);
            assert.isFalse(item.exists, "item must removed");

            //assert.equal(originalContent , JSON.parse(objectDataToStore), "downloaded content must match passed content");
        });
        */
    });

});