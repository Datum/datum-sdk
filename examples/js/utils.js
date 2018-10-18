var datum;
var PASSWORD ="password";


createDatumObj(PASSWORD).then(obj=>{
    datum =obj;
    fetch("https://faucet.megatron.datum.org/v1/faucet/dat/"+datum.identity.address,{
        mode:"cors"
    })
        .then((res)=>{
            console.log(res);
            updateBalanceStatus();
        })
        .catch((err)=>{
            console.error(err);
        });
    getElement("balanceAddress").value = datum.identity.address;
});

function haveBalance(){
    let currBalance = getElement("balanceResult").innerHTML;
    return typeof(currBalance)!=="undefined"&& !isNaN(currBalance) && parseInt(currBalance)>0;
}

function updateBalanceStatus(){
    if(!haveBalance()){
        checkBalances();
        setTimeout(
            updateBalanceStatus
            ,1000);
    }
}

async function createDatumObj(password,accounts=0){
    let tmpDatObj = new Datum();
    let id = await Datum.createIdentity(password,accounts);
    tmpDatObj.initialize({identity:id.keystore});
    tmpDatObj.identity.storePassword(password);
    return tmpDatObj;
}



/**
 * Get element by ID
 */
function getElement(id){
    return document.getElementById(id);
}
/**
 * Show loading message on the element html
 */
function updateInnerHTML(elementId, msg) {
    getElement(elementId).innerHTML = msg;
}


function checkBalances() {
    updateInnerHTML("balanceResult", "loading...");
    updateInnerHTML("depositResult", "loading...");
    var s = getElement("balanceAddress");
    Datum.getBalance(s.value).then(balance => {
        updateInnerHTML("balanceResult", balance);
        return Datum.getDepositBalance(s.value);
    }).then(depositBalance => {
        updateInnerHTML("depositResult", depositBalance);
    }).catch(error => {
        alert(error);
    });
}

function onDeposit() {
    updateInnerHTML("depositTransactionResult", "init deposit...");
    var amount = getElement("amountToDeposit").value;
    datum.deposit(amount).on("transaction", function(txHash) {
        updateInnerHTML("depositTransactionResult",
            "hash broadcasted to network: " + txHash);
    }).then(result => {
        updateInnerHTML("depositTransactionResult",
            "deposit done");
        checkBalances();
    }).catch(error => {
        alert(error);
    });
}


function onWithdrawal() {
    updateInnerHTML("withdrawalTransactionResult", "Processing withdrawal request...");
    var amount = getElement("amountToWithdrawal").value;
    datum.withdrawal(amount).then(txHash=>{
        updateInnerHTML("withdrawalTransactionResult",
            "Transaction is successful");
        checkBalances();
        console.log(txHash);
    }).catch(err=>{
        updateInnerHTML("withdrawalTransactionResult",
            "Withdrawal failed!");
        console.error(err);
        checkBalances();
    });
}

function onSetStorage() {
    updateInnerHTML("storeTransactionResult", "init set data...");
    var data = getElement("dataToStore").value;

    datum.set(data)
        .then((id)=>{
            updateInnerHTML("storeTransactionResult",
                "hash broadcasted to network: " + id);
            console.log(id);
        }).catch((err)=>{
            updateInnerHTML("storeTransactionResult", "Transaction failed!.");
            console.error(err);
        });
}


function onGetStorage() {
    updateInnerHTML("loadTransactionResult", "init set data...");
    var id = getElement("dataToRetrieve").value;
    datum.get(id).then(result => {
        updateInnerHTML("loadTransactionResult",
            "get data done, result: " + result);
        checkBalances();
    }).catch(error => {
        updateInnerHTML("loadTransactionResult", "init set data...");
        alert(error);
    });
}
