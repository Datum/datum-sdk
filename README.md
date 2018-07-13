# datum-sdk
*javascript api for Datum Blockchain*

### Install

npm install builds also the bundled and minified version "datum.js" , "datum.min.js" in /dist folder to include in HTML

```
npm install datum-sdk --save
```


### Tests

Run tests based Mocha test framework

```
mocha ./test
```


## Documentations

[Getting Started](https://gettingstarted.datum.org/)

### HTML Examples

```
<!DOCTYPE html>
<html>

<head>
    <title>Backbone App</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
        crossorigin="anonymous">
    <script type="text/javascript" src="datum.js"></script>
    <script type="text/javascript">
        const Datum = require('/lib/datum.js');


        var identDeveloper = Datum.createIdentity();

        function checkBalances() {
            document.getElementById("balanceResult").innerHTML = "loading...";
            document.getElementById("depositResult").innerHTML = "loading...";

            var s = document.getElementById('balanceAddress');

            Datum.getBalance(s.value).then(balance => {
                document.getElementById("balanceResult").innerHTML = balance;
                return Datum.getDepositBalance(s.value);
            }).then(depositBalance => {
                document.getElementById("depositResult").innerHTML = depositBalance;
            }).catch(error => {
                alert(error);
            })
        }

        function onDeposit() {
            var privateKey = document.getElementById('privateKey').value;
            if (privateKey == "") {
                alert('privateKey not set!');
                return;
            }

            var datum = new Datum();

            datum.initialize({
                privateKey: privateKey
            });

            document.getElementById("depositTransactionResult").innerHTML = 'init deposit...';
            var amount = document.getElementById('amountToDeposit').value;

            datum.deposit(amount).on('transaction', function (txHash) {
                document.getElementById("depositTransactionResult").innerHTML = 'hash broadcasted to network: ' + txHash;
            }).then(result => {
                document.getElementById("depositTransactionResult").innerHTML = 'deposit done, recheck balances...';
            }).catch(error => {
                alert(error);
            })
        }


        function onWithdrawal() {
            var privateKey = document.getElementById('privateKey').value;
            if (privateKey == "") {
                alert('privateKey not set!');
                return;
            }

            var datum = new Datum();

            datum.initialize({
                privateKey: privateKey
            });

            document.getElementById("withdrawalTransactionResult").innerHTML = 'init withdrawal...';
            var amount = document.getElementById('amountToWithdrawal').value;

            datum.deposit(amount).on('transaction', function (txHash) {
                document.getElementById("withdrawalTransactionResult").innerHTML = 'hash broadcasted to network: ' + txHash;
            }).then(result => {
                document.getElementById("withdrawalTransactionResult").innerHTML = 'withdrawal done, recheck balances...';
            }).catch(error => {
                alert(error);
            })
        }

        function onSetStorage() {
            var privateKey = document.getElementById('privateKey').value;
            if (privateKey == "") {
                alert('privateKey not set!');
                return;
            }

            var datum = new Datum();

            datum.initialize({
                privateKey: privateKey,
                developerPublicKey: identDeveloper.publicKey

            });

            document.getElementById("storeTransactionResult").innerHTML = 'init set data...';
            var data = document.getElementById('dataToStore').value;

            datum.set(data).on('transaction', function (txHash) {
                document.getElementById("storeTransactionResult").innerHTML = 'hash broadcasted to network: ' + txHash;
            }).then(result => {
                document.getElementById("storeTransactionResult").innerHTML = 'set data done: ' + result;
            }).catch(error => {
                alert(error);
            })
        }

        function onGetStorage() {
            var privateKey = document.getElementById('privateKey').value;
            if (privateKey == "") {
                alert('privateKey not set!');
                return;
            }

            var datum = new Datum();

            datum.initialize({
                privateKey: privateKey,
                developerPublicKey: identDeveloper.publicKey
            });

            document.getElementById("loadTransactionResult").innerHTML = 'init set data...';
            var data = document.getElementById('dataToRetrieve').value;

            datum.get(data).then(result => {
                document.getElementById("loadTransactionResult").innerHTML = 'get data done, result: ' + result;
            }).catch(error => {
                alert(error);
            })
        }

    </script>
</head>

<body>
    <div class="container">
        <div class="row">
            <div class="col-xs-12">
                <h3>Datum SDK Samples</h3>
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col-xs-12">
                <h4>Check balances</h4>
            </div>

            <div class="col-xs-12">
                <div class="input-group">
                    <input type="text" id="balanceAddress" class="form-control" placeholder="address to check" value="0xE802B81079493bd66EaF0120a50D04A58F182a41">
                    <span class="input-group-btn">
                        <button class="btn btn-default" type="button" onclick="checkBalances();">Check</button>
                    </span>
                </div>
            </div>
        </div>
        <br>
        <div class="row">
            <div class="col-sm-4 col-xs-12">
                <label class="control-label">
                    Network Balance:
                </label>
            </div>
            <div class="col-sm-8 col-xs-12">
                <span id="balanceResult">-</span>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-4 col-xs-12">
                <label class="control-label">
                    Storage Deposit Balance:
                </label>
            </div>
            <div class="col-sm-8 col-xs-12">
                <span id="depositResult">-</span>
            </div>
        </div>
        <hr>
        <h3>Transactions</h3>
        <div class="row">
            <div class="col-xs-12">
                <input type="text" id="privateKey" class="form-control" placeholder="privateKey" value="0xa079d06586a812f4e51700b6f9293159ef791da86c505b5a81ee25c122a663ef">
            </div>
        </div>
        <br>
        <div class="row">
            <div class="col-xs-12">
                <h4>Deposit</h4>
            </div>

            <div class="col-xs-12">
                <div class="input-group">
                    <input type="text" id="amountToDeposit" class="form-control" placeholder="amount to deposit in DAT">
                    <span class="input-group-btn">
                        <button class="btn btn-default" type="button" onclick="onDeposit();">Deposit</button>
                    </span>
                </div>
            </div>
            <div class="col-xs-12" id="depositTransactionResult">

            </div>
        </div>

        <br>
        <div class="row">
            <div class="col-xs-12">
                <h4>Withdrawal</h4>
            </div>

            <div class="col-xs-12">
                <div class="input-group">
                    <input type="text" id="amountToWithdrawal" class="form-control" placeholder="amount to withdrawal in DAT">
                    <span class="input-group-btn">
                        <button class="btn btn-default" type="button" onclick="onWithdrawal();">Withdrawal</button>
                    </span>
                </div>
            </div>
            <div class="col-xs-12" id="withdrawalTransactionResult">
            </div>
        </div>

        <br>
        <div class="row">
            <div class="col-xs-12">
                <h4>Set/Store Data</h4>
            </div>

            <div class="col-xs-12">
                <div class="input-group">
                    <input type="text" id="dataToStore" class="form-control" placeholder="any data to store">
                    <span class="input-group-btn">
                        <button class="btn btn-default" type="button" onclick="onSetStorage();">Set</button>
                    </span>
                </div>
            </div>
            <div class="col-xs-12" id="storeTransactionResult">
            </div>
        </div>

        <br>
        <div class="row">
            <div class="col-xs-12">
                <h4>Get data by hash</h4>
            </div>

            <div class="col-xs-12">
                <div class="input-group">
                    <input type="text" id="dataToRetrieve" class="form-control" placeholder="hash of data item">
                    <span class="input-group-btn">
                        <button class="btn btn-default" type="button" onclick="onGetStorage();">Get</button>
                    </span>
                </div>
            </div>
            <div class="col-xs-12" id="loadTransactionResult">
            </div>
        </div>
    </div>
</body>

</html>
```


