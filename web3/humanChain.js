const humanChain_json = require('../blockchain/build/contracts/HumanChain.json');

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

async function createCause(address, requirement, callback){
    console.log(address, requirement)
    let chainID  = await web3.eth.net.getId();

    console.log(chainID)
    let humanChain_instance = new web3.eth.Contract(humanChain_json.abi, humanChain_json.networks[chainID]["address"]);
    let id = await humanChain_instance.methods.createCause(web3.utils.toWei(requirement, "ether")).call({from: address});
    console.log(id)
    let tx = humanChain_instance.methods.createCause(web3.utils.toWei(requirement, "ether")).send({from: address, gas:3000000});
    console.log(id, tx)
    callback(id, "txhash");
}

async function donate(address, id, amount, callback){
    let chainID  = await web3.eth.net.getId();
    let humanChain_instance = new web3.eth.Contract(humanChain_json.abi, humanChain_json.networks[chainID]["address"]);

    let tx = humanChain_instance.methods.donate(id).send({from: address, value: web3.utils.toWei(amount, 'ether'), gas:3000000})
    console.log(tx)
    callback("txhash");
}

async function withdraw(address, id, callback){
    let chainID  = await web3.eth.net.getId();
    let humanChain_instance = new web3.eth.Contract(humanChain_json.abi, humanChain_json.networks[chainID]["address"]);

    let tx = await humanChain_instance.methods.withdraw(id).send({from: address, gas:3000000})
    console.log(tx)
    callback(tx["transactionHash"]);
}

async function tip(address, volunteer, amount, callback){
    let chainID  = await web3.eth.net.getId();
    let humanChain_instance = new web3.eth.Contract(humanChain_json.abi, humanChain_json.networks[chainID]["address"]);

    let tx = await humanChain_instance.methods.tip(volunteer, web3.utils.toWei(amount, 'ether')).send({from: address, value: web3.utils.toWei(amount, 'ether'), gas:3000000})
    console.log(tx)
    callback(tx["transactionHash"]);
}

async function getCauseDetails(address, id, callback){
    let chainID  = await web3.eth.net.getId();
    let humanChain_instance = new web3.eth.Contract(humanChain_json.abi, humanChain_json.networks[chainID]["address"]);

    let res = await humanChain_instance.methods.getCauseDetails(id).call({from: address})
    console.log(res)
    callback(res);
}

module.exports = {
    createCause,
    donate,
    withdraw,
    tip,
    getCauseDetails
}