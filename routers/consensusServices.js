const express = require('express');
const Blockchain = require('../Blockchain');
const rp = require('request-promise');
const router = express.Router();

const chain = Blockchain.chain;

router.get('/consensus', function(req, res){
  
    const requestPromises =[];
    chain.networkNodes.forEach(networkNodeUrl =>{
        const requestOptions = {
            uri : networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(blockchains =>{
        const currentChainLength = chain.chain.length;
        let maxChainLength = currentChainLength;
        let newLongesChain = null;
        let newPendingTransactions = null;

        blockchains.forEach(blockchain =>{
            if(blockchain.chain.length > maxChainLength)
            {
                maxChainLength = blockchain.chain.length;
                newLongesChain = blockchain.chain;
                newPendingTransactions = blockchain.pendingTransactions;
            };
        });

        if(!newLongesChain || (newLongesChain && !chain.chainIsValid(newLongesChain)))
        {
            res.json({
                note: 'Current chain has not been replaced.',
                chain: chain.chain
            });
        }
        else if(newLongesChain && chain.chainIsValid(newLongesChain))
        {
            chain.chain = newLongesChain;
            chain.pendingTransactions = newPendingTransactions;
            res.json({
                note:'This chain has been replaced.',
                chain: chain.chain
            });

        }
    });
});

module.exports = router;