const lightwallet = require('eth-lightwallet');

function TxDataProvider() {

}

function enc(method, types, params) {
  // eslint-disable-next-line no-underscore-dangle
  return lightwallet.txutils._encodeFunctionTxData(method, types, params);
}

TxDataProvider.getAddClaimData = function getAddClaimData(subject, key, value, msgHash, v, r, s) {
  const types = ['address', 'bytes32', 'bytes32', 'bytes32', 'uint8', 'bytes32', 'bytes32'];
  const params = [subject, key, value, msgHash, v, r, s];
  return enc('setClaim', types, params);
};

TxDataProvider.getAddSelfClaimData = function getAddSelfClaimData(key, value, msgHash, v, r, s) {
  const types = ['bytes32', 'bytes32', 'bytes32', 'uint8', 'bytes32', 'bytes32'];
  const params = [key, value, msgHash, v, r, s];
  return enc('setSelfClaim', types, params);
};

TxDataProvider.getGetSingleClaimData = function getGetSingleClaimData(issuer, subject, key) {
  const types = ['address', 'address', 'bytes32'];
  const params = [issuer, subject, key];
  return enc('getClaim', types, params);
};

TxDataProvider.getRemoveClaimData = function getRemoveClaimData(issuer, subject, key) {
  const types = ['address', 'address', 'bytes32'];
  const params = [issuer, subject, key];
  return enc('removeClaim', types, params);
};


TxDataProvider.getStorageDepositData = function getStorageDepositData(address) {
  const types = ['address'];
  const params = [address];
  return enc('deposit', types, params);
};

TxDataProvider.getStorageWithdrawalData = function getStorageWithdrawalData(address, amount) {
  const types = ['address', 'uint256'];
  const params = [address, amount];
  return enc('withdrawal', types, params);
};


TxDataProvider.getSetData = function getSetData(
  address,
  hash,
  merkle,
  key,
  size,
  replicationMode,
  addresses = [],
) {
  const types = ['address', 'bytes32', 'bytes32', 'bytes32', 'uint256', 'uint', 'address[]'];
  const params = [address, hash, merkle, key, size, replicationMode, addresses];
  return enc('setStorage', types, params);
};

TxDataProvider.addAccess = function addAccess(id, addresses) {
  const types = ['bytes32', 'address'];
  const params = [id, addresses];
  return enc('addAccess', types, params);
};

TxDataProvider.removeAccess = function removeAccess(id, address) {
  const types = ['bytes32', 'address'];
  const params = [id, address];
  return enc('removeAccess', types, params);
};

TxDataProvider.getCreateNetworkIdentityData = function getCreateNetworkIdentityData(
  address,
  recovery,
) {
  const types = ['address', 'address'];
  const params = [address, recovery];
  return enc('createIdentity', types, params);
};


TxDataProvider.getProxyForwardData = function getProxyForwardData(proxy, to, value, data) {
  const types = ['address', 'address', 'uint256', 'bytes'];
  const params = [proxy, to, value, data];
  return enc('forward', types, params);
};

TxDataProvider.getRemoveData = function getRemoveData(address, id) {
  const types = ['bytes32'];
  const params = [id];
  return enc('removeDataItem', types, params);
};

TxDataProvider.getWithdrawalEthereum = function getWithdrawalEthereum(address) {
  const types = ['address'];
  const params = [address];
  return enc('withdrawal', types, params);
};

TxDataProvider.getRegisterNodeData = function getRegisterNodeData(
  endpoint,
  bandwidth = 1,
  region = 1,
) {
  const types = ['string', 'uint256', 'uint256'];
  const params = [endpoint, bandwidth, region];
  return enc('registerNode', types, params);
};
TxDataProvider.getForceStorageProofData = function getForceStorageProofData(hash, nodeAddress) {
  const types = ['bytes32', 'address'];
  const params = [hash, nodeAddress];
  return enc('forceStorageProof', types, params);
};

TxDataProvider.getNodeDepositStaking = function getNodeDepositStaking() {
  const types = [];
  const params = [];
  return enc('deposit', types, params);
};

TxDataProvider.getSetWorkStatus = function getSetWorkStatus(hash) {
  const types = ['bytes32'];
  const params = [hash];
  return enc('setWorkStatusOnStorageProof', types, params);
};

TxDataProvider.getTransferOwnership = function getTransferOwnership(hash, newOwner) {
  const types = ['bytes32', 'address'];
  const params = [hash, newOwner];
  return enc('transferDataOwner', types, params);
};

TxDataProvider.getGiveForcedStorageProof = function getGiveForcedStorageProof(
  hash,
  proofs,
  chunkHash,
) {
  const types = ['bytes32', 'bytes32', 'bytes32'];
  const params = [hash, proofs, chunkHash];
  return enc('giveForcedStorageProof', types, params);
};

TxDataProvider.unregisterNodeStart = function unregisterNodeStart() {
  const types = [];
  const params = [];
  return enc('unregisterNodeStart', types, params);
};

TxDataProvider.unregisterNode = function unregisterNode() {
  const types = [];
  const params = [];
  return enc('registerNode', types, params);
};

module.exports = TxDataProvider;
