const express = require('express');
const Blockchain = require('../Blockchain');
const uuid = require('uuid');
const rp = require('request-promise');
const router = express.Router();

const chain = Blockchain.chain;

const nodeAddress = uuid.v1().split('-').join('');
router.get('/blockchain', function (req, res) {
    res.send(chain);
});

router.post('/transaction', function (req, res) {
    const newTransaction = req.body;
    const blockIndex = chain.addTransactionToPendingTransaction(newTransaction);
    res.json({note: `Transaction will be add in block ${blockIndex}`});
});

router.post('/transaction/broadcast', function(req, res){
    const newTransaction = chain.createNewtTransaction(req.body.amount, req.body.sender, req.body.recipient);
    chain.addTransactionToPendingTransaction(newTransaction);

    const requestPromises = [];
    chain.networkNodes.forEach(networkNodeUrl =>{
        const requestOptions = {
            uri : networkNodeUrl + '/transaction',
            method : 'POST',
            body : newTransaction,
            json : true
        }
        requestPromises.push(rp(requestOptions));
    })

    Promise.all(requestPromises)
    .then(data => {
        res.json({
            note : 'Transaction created and broadcast successfull!!!'
        });
    })

});


router.get('/mine', function (req, res) {
    const lastBlock = chain.getLastBlock();
    const previousBlockHash = lastBlock['hash'];

    const currentBlockData = {
        transactions: chain.pendingTransactions,
        index: lastBlock['index'] + 1
    };

    const nonce = chain.proofOfWork(previousBlockHash, currentBlockData);

    const blockHash = chain.hashblock(previousBlockHash, currentBlockData, nonce);

    const newBlock = chain.createNewBlock(nonce, previousBlockHash, blockHash);

    const requestPromises = [];

    chain.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri : networkNodeUrl + "/receive-new-block",
            method : 'POST',
            body : {newBlock : newBlock},
            json : true
        }
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(data =>{
        const requestOptions ={
            uri : chain.currentnodeUrl + '/transaction/broadcast',
            method : 'POST',
            body : {
                amount : 12.5,
                sender : "00",
                recipient : nodeAddress
            },
            json : true
        }
        return rp(requestOptions);
    })
    .then(data =>{
        res.json({ 
            note: "New Block mined successfully!!!",
            block: newBlock
        });
    });
});


router.post('/receive-new-block', function(req, res){
    const newBlock = req.body.newBlock;
    const lastBlock = chain.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctindex = lastBlock['index'] + 1 == newBlock['index'];
    if(correctHash && correctindex)
    {
        console.log('enter')
        chain.chain.push(newBlock);
        chain.pendingTransactions = [];
        res.json({
            note : 'New block received and accepted!!!',
            newBlock : newBlock
        });
    }else{
        res.json({
            note : 'New block rejected!!!',
            newBlock : newBlock
        });

    }

});

module.exports = router;