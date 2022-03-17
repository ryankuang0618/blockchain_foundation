const express = require('express');
const Blockchain = require('../Blockchain');
const rp = require('request-promise');
const router = express.Router();

const chain = Blockchain.chain;

//register a node and broadcase it the network.
router.post('/register-and-broadcast-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    console.log(newNodeUrl);
    if(chain.networkNodes.indexOf(newNodeUrl) == -1)
        chain.networkNodes.push(newNodeUrl);
        console.log(chain.networkNodes);

    const reNodesPromises = [];

    chain.networkNodes.forEach(networkNodeUrl =>{
        const requestOptions = {
            uri : networkNodeUrl + '/register-node',
            method : 'POST',
            body : {newNodeUrl : newNodeUrl},
            json : true
        }

        reNodesPromises.push(rp(requestOptions));
    });

    Promise.all(reNodesPromises)
    .then(data =>{
        //use the data
        console.log({allNetworkNodes : [...chain.networkNodes, chain.currentnodeUrl]});
        const bulkRegisterOptions = {
            uri : newNodeUrl + '/register-nodes-bulk',
            method : 'POST',
            body : {allNetworkNodes : [...chain.networkNodes, chain.currentnodeUrl]},
            json : true
        }
        return rp(bulkRegisterOptions);
    })
    .then(data => {
        res.json({
            note : 'New node registered with network successfully!!!'

        });
    });
});

//register a node with the network.
router.post('/register-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = chain.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = chain.currentnodeUrl !== newNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNode)
        chain.networkNodes.push(newNodeUrl);
    res.json({
        note : 'New node registered successfully with node!!!'
    });
});

//register multiple nodes at once.
router.post('/register-nodes-bulk', function(req, res){
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = chain.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = chain.currentnodeUrl !== networkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode)
            chain.networkNodes.push(networkNodeUrl);
    });

    res.json({
        note : 'Bulk registeration successful!!!'
    });
});

module.exports = router;