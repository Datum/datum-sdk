var identDeveloper;
var datum;
var PASSWORD ="password";
/**
 * This is used as a key for storing data
 * Key will be identity Address.
 */
var DATA_KEY;

createDatumObj(PASSWORD).then(obj=>{
  datum =obj;
  // fetch('https://faucet.megatron.datum.org/v1/faucet/dat/'+datum.identity.address,{
  //   mode:"cors"
  // })
  // .then((res)=>{
  //   console.log(res);
  // })
  // .catch((err)=>{
  //   console.error(err);
  // });
  getElement('balanceAddress').value = datum.identity.address
});

async function createDatumObj(password,accounts=0){
  let tmpDatObj = new Datum();
  let id = await Datum.createIdentity(password,accounts);
  tmpDatObj.initialize({identity:id.keystore});
  tmpDatObj.identity.storePassword(password);
  let pubKeyPromises = await tmpDatObj.identity.addresses.map((v,i)=>tmpDatObj.identity.getPublicKey(i));
  let defaultPubKeys = await Promise.all(pubKeyPromises);
  tmpDatObj.identity.defaultPublicKeys = defaultPubKeys;
  return tmpDatObj;
}

// Datum.createIdentity(PASSWORD).then((id) => {
//     identDeveloper =id;
//     DATA_KEY = JSON.parse(identDeveloper.keystore).addresses[0];
//     datum = new Datum();
//     datum.initialize({identity:id.keystore});
//     datum.identity.storePassword(PASSWORD);
//     //Update Address element
//     getElement('balanceAddress').value = datum.identity.address;
//   })
//   .catch((err) => {
//     alert(err);
//   });

/**
 * Get element by ID
 */
function getElement(id){
  return document.getElementById(id);
};
/**
 * Show loading message on the element html
 */
function updateInnerHTML(elementId, msg) {
  getElement(elementId).innerHTML = msg;
}


function checkBalances() {
  updateInnerHTML('balanceResult', 'loading...');
  updateInnerHTML('depositResult', 'loading...');
  var s = getElement('balanceAddress');
  Datum.getBalance(s.value).then(balance => {
    updateInnerHTML("balanceResult", balance);
    return Datum.getDepositBalance(s.value);
  }).then(depositBalance => {
    updateInnerHTML('depositResult', depositBalance);
  }).catch(error => {
    alert(error);
  })
}

function onDeposit() {
  updateInnerHTML('depositTransactionResult', 'init deposit...');
  var amount = getElement('amountToDeposit').value;
  datum.deposit(amount).on('transaction', function(txHash) {
    updateInnerHTML("depositTransactionResult",
      'hash broadcasted to network: ' + txHash)
  }).then(result => {
    updateInnerHTML("depositTransactionResult",
      'deposit done');
      checkBalances();
  }).catch(error => {
    alert(error);
  })
}


function onWithdrawal() {
  updateInnerHTML('withdrawalTransactionResult', 'init withdrawal...');
  var amount = getElement('amountToWithdrawal').value;
  datum.deposit(amount).on('transaction', function(txHash) {
    updateInnerHTML(withdrawalTransactionResult,
      'hash broadcasted to network: ' + txHash);
  }).then(result => {
    updateInnerHTML(withdrawalTransactionResult,
      'withdrawal done');
      checkBalances();
  }).catch(error => {
    alert(error);
  })
}

function onSetStorage() {
  updateInnerHTML('storeTransactionResult', 'init set data...');
  var data = getElement('dataToStore').value;

  datum.set(data)
  .then((res)=>{
    console.log(res);
  }).catch((err)=>{
    console.error(err);
  });
  // .on('transaction', function(txHash) {
  //   updateInnerHTML('storeTransactionResult',
  //     'hash broadcasted to network: ' + txHash);
  // }).then(result => {
  //   updateInnerHTML('storeTransactionResult', 'set data done: ' +
  //     result);
  //     checkBalances();
  // }).catch(error => {
  //   alert(error);
  // })
}


function onGetStorage() {
  updateInnerHTML('loadTransactionResult', 'init set data...');
  var data = getElement('dataToRetrieve').value;
  datum.get(data).then(result => {
    updateInnerHTML('loadTransactionResult',
      'get data done, result: ' + result);
      checkBalances();
  }).catch(error => {
    alert(error);
  })
}

/**
 *   var privateKey = getElement('privateKey').value;
   if (privateKey == "") {
     alert('privateKey not set!');
     return;
   }

   var datum = new Datum();

   datum.initialize({
     privateKey: privateKey,
     developerPublicKey: identDeveloper.publicKey
   });
 */
