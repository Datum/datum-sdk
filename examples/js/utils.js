var identDeveloper;
var datum;
Datum.createIdentity("password").then((id) => {
    console.log('Generated ID:', id);
    identDeveloper = id;
    datum = new Datum({
      identity: JSON.stringify(id)
    });
  })
  .catch((err) => {
    alert(err);
  });

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
  var privateKey = getElement('privateKey').value;
  if (privateKey == "") {
    alert('privateKey not set!');
    return;
  }

  var datum = new Datum();

  datum.initialize({
    identity: JSON.stringify()
  });
  updateInnerHTML('depositTransactionResult', 'init deposit...');

  var amount = getElement('amountToDeposit').value;

  datum.deposit(amount).on('transaction', function(txHash) {
    updateInnerHTML("depositTransactionResult",
      'hash broadcasted to network: ' + txHash)
  }).then(result => {
    updateInnerHTML("depositTransactionResult",
      'deposit done, recheck balances...');
  }).catch(error => {
    alert(error);
  })
}


function onWithdrawal() {
  var privateKey = getElement('privateKey').value;
  if (privateKey == "") {
    alert('privateKey not set!');
    return;
  }

  var datum = new Datum();

  datum.initialize({
    privateKey: privateKey
  });
  updateInnerHTML('withdrawalTransactionResult', 'init withdrawal...');
  var amount = getElement('amountToWithdrawal').value;

  datum.deposit(amount).on('transaction', function(txHash) {
    updateInnerHTML(withdrawalTransactionResult,
      'hash broadcasted to network: ' + txHash);
  }).then(result => {
    updateInnerHTML(withdrawalTransactionResult,
      'withdrawal done, recheck balances...');
  }).catch(error => {
    alert(error);
  })
}

function onSetStorage() {
  var privateKey = getElement('privateKey').value;
  if (privateKey == "") {
    alert('privateKey not set!');
    return;
  }

  var datum = new Datum();

  datum.initialize({
    privateKey: privateKey,
    developerPublicKey: identDeveloper.publicKey

  });
  updateInnerHTML('storeTransactionResult', 'init set data...');
  var data = getElement('dataToStore').value;

  datum.set(data).on('transaction', function(txHash) {
    updateInnerHTML('storeTransactionResult',
      'hash broadcasted to network: ' + txHash);
  }).then(result => {
    updateInnerHTML('storeTransactionResult', 'set data done: ' +
      result);
  }).catch(error => {
    alert(error);
  })
}

function onGetStorage() {
  var privateKey = getElement('privateKey').value;
  if (privateKey == "") {
    alert('privateKey not set!');
    return;
  }

  var datum = new Datum();

  datum.initialize({
    privateKey: privateKey,
    developerPublicKey: identDeveloper.publicKey
  });
  updateInnerHTML('loadTransactionResult', 'init set data...');
  var data = getElement('dataToRetrieve').value;
  datum.get(data).then(result => {
    updateInnerHTML('loadTransactionResult',
      'get data done, result: ' + result);
  }).catch(error => {
    alert(error);
  })
}
