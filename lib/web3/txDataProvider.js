const lightwallet = require('eth-lightwallet');
const Web3 = require('web3');

function TxDataProvider() {

}


function enc(method, types, params) {
    return lightwallet.txutils._encodeFunctionTxData(method, types, params);
}

TxDataProvider.getAddClaimData = function (issuer,subject, value) {
    let types = ['bytes32', 'address', 'bytes32'];
    let params = [issuer, subject, value];
    return enc('set', types, params);
}

TxDataProvider.getRemoveClaimData = function (issuer,subject) {
    let types = ['bytes32', 'address'];
    let params = [issuer, subject];
    return enc('remove', types, params);
}

TxDataProvider.getStorageDepositData = function (address) {
    let types = ['address'];
    let params = [address];
    return enc('deposit', types, params);
}

TxDataProvider.getStorageWithdrawalData = function (address,amount) {
    let types = ['address','uint256'];
    let params = [address, amount];
    return enc('withdrawal', types, params);
}

TxDataProvider.getSetData = function (address, hash, merkle, key, size, duration, replicationMode, privacy, secret) {
    let types = ['address','bytes32','bytes32','bytes32','uint256','uint256','uint256','uint256','bytes'];
    let params = [address, hash, merkle, key, size, duration, replicationMode, privacy, secret];
    return enc('setStorage', types, params);
}


TxDataProvider.getCreateNetworkIdentityData = function (address, recovery) {
    let types = ['address','address'];
    let params = [address,recovery];
    return enc('createIdentity', types, params);
}


TxDataProvider.getProxyForwardData = function (proxy, to, value, data) {
    let types = ['address', 'address', 'uint256', 'bytes']
    let params = [proxy, to, value, data]
    return enc('forward', types, params);
}

TxDataProvider.getRemoveData = function (address, id) {
    let types = ['address', 'bytes32']
    let params = [address, id]
    return enc('removeDataItem', types, params);
}











module.exports = TxDataProvider;
