const express = require('express')
const app = express()
const bodyParser = require('body-parser');

const port = process.argv[2];

 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Import Routes
const blockchainRoute = require('./routers/blockchainServices');

const registerRoute = require('./routers/registerServices');

const consensusRoute = require('./routers/consensusServices');

const blockexplorerRoute = require('./routers/blockexplorerServices');

app.use('/api/BlockChain',blockchainRoute);

app.use('/api/BlockChain',registerRoute);

app.use('/api/BlockChain',consensusRoute);

app.use('/api/BlockChain',blockexplorerRoute);


app.listen(port, function(){
    console.log(`Listening on port ${port}...`)
});
