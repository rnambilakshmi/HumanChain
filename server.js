const express = require('express');
var bodyParser = require("body-parser");

const web3_utils = require('./web3/utils');
const web3_humanChain = require("./web3/humanChain");
const email_utils = require("./utils/email");

const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/', (req,res) => {
    res.send('HumanChain API')
})

app.get('/address', (req,res) => {
    web3_utils.getAddress(req.query.address, (addr) => {
        res.send(addr);
    })
})

app.get('/ethBalance', (req,res) => {
    web3_utils.getBalance(req.query.address, (bal) => {
        res.send(bal);
    })
})

app.get('/createCause', (req, res) => {
    web3_humanChain.createCause(req.query.address, req.query.requirement, (id, txHash) => {
        res.send({"id":id, "txHash":txHash});
    })
})

app.get('/donate', (req, res) => {
    // console.log(req.query);
    // res.send("0xTestTxHash");
    web3_humanChain.donate(req.query.address, req.query.id, req.query.amt, (txHash) => {
        res.send(txHash);
    })
})

app.get('/withdraw', (req, res) => {
    web3_humanChain.withdraw(req.query.address, req.query.id, (txHash) => {
        res.send(txHash);
    })
})

app.get('/tip', (req, res) => {
    web3_humanChain.tip(req.query.address, req.query.volunteer, req.query.amt, (txHash) => {
        res.send(txHash);
    })
})

app.get('/getCauseDetails', (req, res) => {
    web3_humanChain.getCauseDetails(req.query.address, req.query.volunteer, req.query.amt, (details) => {
        res.send(details);
    })
})

app.post('/sendMail', (req, res) => {
    email_utils.sendEmail(req.body.address, req.body.email_body, (err, info) => {
        console.log(err, info);
        res.send({"err":err, "info":info});
    })
})


app.listen(3000, () => {
    console.log(`Server Started at 3000`);
})

