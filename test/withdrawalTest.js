const Web3 = require('web3');
const BigNumber = Web3.BigNumber
var chai = require('chai');
//use default BigNumber
chai.use(require('chai-bignumber')(BigNumber));

var assert = chai.assert;

var Datum = require('../index');
var datum;

const delay = ms => new Promise(r => setTimeout(r, ms));



describe('claims tests', function () {

    //set high timeout because of blockchain actions...
    this.timeout(60000);


    var ethereumWalletToSendTokens = '0x752623ae3937954950540e6c805cff65ab0af68e';
    var plasmaContract = '0xBaF8a0144BAb825331fe17FE95689886f2c6969b';

    var keystore = {"encSeed":{"encStr":"qj9Ytggu9dXUtavE/kdSwKTNO9yzEz5yCkKmjBaD3Ye9ZqXNAJ7HT/danjWx2/6PA70Yt1VcSL0dkfBWUCWEguB/vPM21L81/6tnBfTj7hQI7M1ZrzL2xqNXBI2+7Ye24I1nA17vhh/WaFFgS+usjKPAQ69Xc6/Jxm+iVeUUI5pe9XUC4QA9SQ==","nonce":"mdFLMbuPpyVdmczS5WeTwyRmgo5fsVc2"},"encHdRootPriv":{"encStr":"cHe9pJaxb7BfmFgczFBL11OPVUBM3vE13kBYzGI53Ufr4R410BZHXgoMQ9aeRTbcwRmMQf8EuTlDiuBy7RdDgGJhzWs5+MZy1Iye64gkUqdnsmMtLVtgfNWJIaEtN9Q69AV/C8Wzz10aNLvoXtK2fxMaT2zbhqM2gDM4/E4wdw==","nonce":"K7WrlE7lClfdSWKAEqj2TYRxkqo7iG9d"},"addresses":["c90a556e6381b0c6acdaf1e00e41f101e495762f"],"encPrivKeys":{"c90a556e6381b0c6acdaf1e00e41f101e495762f":{"key":"65Ya3ebc1cQM59jrTwhVGvZnbvizCGOR9K7hWqTfQGSDcv8B9pBYzc4JY7+15mOw","nonce":"gbWRP45uREHCGGTwYqNwSPBMl3LiNEXb"}},"hdPathString":"m/44'/60'/0'/0","salt":"GU2WE+05v7/2fUQqGCs0sAYeH1opCml0IJK4BCq6MtU=","hdIndex":1,"version":3};

    //before all tests, create new identity and get some DAT from faucet
    before(async () => {
        datum = new Datum();
        datum.initialize({ identity: JSON.stringify(keystore), network : "http://localhost:8545"});
        datum.identity.storePassword("YourPassword");
    
    });
    
    describe('withdrawal to ethereum', function () {
 
        it('withdrawal', async function () {
            
            let balancePlasmaNow = await Datum.getBalance(plasmaContract);
            let balanceNow = await Datum.getBalance(datum.identity.address);

            let tx = await datum.withdrawalToEthereum(ethereumWalletToSendTokens, 1);

            let balanceAfter = await Datum.getBalance(datum.identity.address);
            let balancePlasmaAfter = await Datum.getBalance(plasmaContract);

        });
    });
});
