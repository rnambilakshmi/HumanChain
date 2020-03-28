const HumanChain = artifacts.require("HumanChain");

module.exports = function(deployer) {
  deployer.deploy(HumanChain);
};
