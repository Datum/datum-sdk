var MerkleTools = require('merkle-tools')


var createMerkle = function (data) {
    var merkleTools = new MerkleTools();
    merkleTools.addLeaves(data, true);
    var result = merkleTools.makeTree();
    return result;
}


module.exports = {
    createMerkle : createMerkle
};