const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

function getAddress(address, callback){
    if(address == "cause"){
        callback("0xcba39f71715820a3b352fe9a50d541168a1b1134");
    }
    else if(address == "donate"){
        callback("0x6753f20c2e4811ccb763b5f13a94d13421725ad3");
    }
}

function getBalance(address, callback){
    console.log(address, typeof(address))    
    web3.eth.getBalance(address).then(bal => callback(bal));
}

module.exports = {
    getBalance,
    getAddress
}