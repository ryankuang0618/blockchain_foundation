const express = require('express');
const Blockchain = require('../Blockchain');
const path = require('path');
const router = express.Router();

const chain = Blockchain.chain;

router.get('/block/:blockHash', function(req, res){
    const blockHash = req.params.blockHash;
    const correctBlock = chain.getBlock(blockHash);
    res.json({
        block: correctBlock
    });
});

router.get('/transaction/:transactionId', function(req, res){
    const transactionId = req.params.transactionId;
    const transactionData = chain.getTransaction(transactionId);
    res.json({
        transaction: transactionData.transaction,
        block: transactionData.block
    });
});

router.get('/address/:address', function(req, res){
    const address = req.params.address;
    const addressData = chain.getAddressData(address);
    res.json({
        addressData: addressData
    });
});

router.get('/block-explorer',function(req, res){
    let reqPath = path.join(__dirname, '../');
    res.sendFile(reqPath+'/block-explorer/index.html');

});

module.exports = router;