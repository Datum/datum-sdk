var chai = require('chai');
var assert = chai.assert;

var DatumIdentity = require('../index').DatumIdentity;

console.log(DatumIdentity);


describe('identity tests', function () {
    let ident;


    let seed = 'arch trash object culture humble bench rhythm favorite siege ski copper dentist';
    let seedAddress = '0xdf969fc238dc9ca9f0ec71a2209a6f35bd807a11';

    //before all tests, create new identity
    beforeEach(async () => {
        ident = new DatumIdentity();
    });

    describe('basic wallet creation and recovery', function () {
        it('create new identity', async function () {
            assert.equal(ident.mnid, null, 'mnid should be null because keystore not init yet');

            //create new keystore
            let result = await ident.new("Password123");

            assert.notEqual(ident.mnid, null, 'mnid should be set now');
        });

        it('recover from seed', async function () {
            assert.equal(ident.mnid, null, 'mnid should be null because keystore not init yet');

            //recover from seed
            let result = await ident.recover(seed);

            //check if first address in correct
            assert.equal(ident.address, seedAddress, 'ident address should be: ' + seedAddress);
        });

        it('export / import', async function () {
            let result = await ident.new("Password123");
            let serialized = ident.export();

            //Create identity with serialized keystore
            var newIdent = new DatumIdentity(serialized);

            //check if first address in correct
            assert.equal(ident.address, newIdent.address, 'ident address should be same after import');
        });

        it('signing', async function () {
            
            let result = await ident.new("Password123");
            let signed = await ident.signMsg("data to sign","Password123");
            
            assert.notEqual(signed.r, null, 'r value must be set');
            assert.notEqual(signed.s, null, 's value must be set');
            assert.notEqual(signed.v, null, 'v value must be set');
        });
    });
});