var chai = require('chai');
var assert = chai.assert;
var request = require('async-request')


var Datum = require('../index');
var datum;

const delay = ms => new Promise(r => setTimeout(r, ms));

describe('storage tests', function () {
    //set high timeout because of blockchain actions...
    this.timeout(30000);

    var identity = {
        address: '0x8d927B4305Ddd8BfEF730e6FE2dE5FFF826dA762',
        privateKey: '0x0dec1dc99e0b5cc8ce437edb50e180a33f333a5bea88adc026a53e12b2eb7fdb',
        publicKey: '2da9fb7b45798186ef17fa85cea01322202ba7b83f5ee82244b9a7790ee7f7e2518bd898e440591a28447ed5ad8111d7e4c68a839a95220f1f0b54ea483f97a3'
    };

    //before all tests, create new identity and get some DAT from faucet
    before(async () => {

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


        //create datum instance and init with key
        datum = new Datum();
        datum.initialize({
            privateKey: identity.privateKey
        });

        console.log('ready');
    });

    describe('balances with fresh account', function () {
        it('get Datum Blockchain balance', async function () {
            //account got faucet of 100 DAT
            let networkBalance = 100000000000000000000;
            let balance = await Datum.getBalance(identity.address);
            assert.equal(balance, networkBalance, 'balance should be: ' + networkBalance);
        });

        it('get locked balance (before any action done) ', async function () {
            //account used is frozen, so balance should not change!
            let lockedBalance = 0;
            let balance = await Datum.getDepositBalance(identity.address);
            assert.equal(balance, lockedBalance, 'locked balance should be: ' + lockedBalance);
        });
    });

    describe('deposit / withdrawal', function () {
        it('deposit to contract', async function () {
            let depositBalance = 2000000000000000000;
            let actualBalance = await Datum.getBalance(identity.address);

            //deposit to contract
            await datum.deposit(2);

            //wait for node sync
            await delay(3000);

            //get balances
            let balanceDeposit = await Datum.getDepositBalance(identity.address);
            let balance = await Datum.getBalance(identity.address);

            assert.equal(balanceDeposit, depositBalance, 'balance should be 1 DAT, but is : ' + depositBalance);
        });

        it('withdrawal to contract', async function () {
            let depositBalance = 1000000000000000000;
            let actualBalance = await Datum.getBalance(identity.address);

            //deposit to contract
            await datum.withdrawal(1);

            //wait for node sync
            await delay(3000);

            //get balances
            let balanceDeposit = await Datum.getDepositBalance(identity.address);
            let balance = await Datum.getBalance(identity.address);

            assert.equal(balanceDeposit, depositBalance, 'balance should be :' + depositBalance);
            assert.equal(balance, actualBalance + depositBalance, 'network balance should be higher , but is : ' + balance);
        });
    });
});