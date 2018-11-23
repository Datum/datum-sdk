var MerkleTools = require('merkle-tree-solidity')
const EthUtils = require("ethereumjs-util");


var createLeaves = function(data) {
    if(data.length % 128 !== 0)
    {
        throw new Error("invalid data length.");
    }
    var chunks = data.length / 128;
    var leaves = [];
    for(var i = 0;i < chunks;i++) {
        leaves.push(EthUtils.sha256(data.substr((i * 128),128)));
    }

    return leaves;
}

var getMerkleRoot = function (data) {
    var leaves = createLeaves(data);
    const merkleTree = new MerkleTools.default(leaves, true);
    const root = merkleTree.getRoot();
    return EthUtils.bufferToHex(root);
}

var getProof = function(data, index) {
    var leaves = createLeaves(data);
    const merkleTree = new MerkleTools.default(leaves, true);

    return { hash: EthUtils.bufferToHex(leaves[index]), proof: merkleTree.getProof(leaves[index]).map(h => EthUtils.bufferToHex(h))};
}



module.exports = {
    getMerkleRoot : getMerkleRoot,
    getProof : getProof,
};
