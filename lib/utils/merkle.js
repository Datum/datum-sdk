var MerkleTools = require('merkle-tools')
const EthUtils = require("ethereumjs-util");


var createMerkle = function (data) {

    var stringifiedData = typeof data == 'object' ? JSON.stringify(data) : data;

    var leaves = getParts(stringifiedData);

    
   
    var merkleTools = new MerkleTools();
    merkleTools.addLeaves(leaves, true);
    merkleTools.makeTree();

    var rootValue =merkleTools.getMerkleRoot();


    var m = {};
    m.root = EthUtils.bufferToHex(merkleTools.getMerkleRoot());
    m.proofs = [];
    for(var i = 0;i < merkleTools.getLeafCount();i++) {
        m.proofs.push(merkleTools.getProof(i));
    }

    m.toString = function() {
        return JSON.stringify({ root : this.root, proofs : this.proofs });
    }

    return m;
}

function getParts(data) {
    if(data.length == 0)
        return [];

    var leaves = [];
    if(data.length <= 8) {
        leaves.push(EthUtils.bufferToHex(EthUtils.sha256(data)));
        return leaves;
    }

    var size = parseInt((data.length / 8));

    for(var i = 0;i < 8;i++) {
        leaves.push(data.substr(i * size, size ));
    }
    
    return leaves;
}


module.exports = {
    createMerkle : createMerkle
};