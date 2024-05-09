const message = artifacts.require("./message.sol");
  
module.exports = function (deployer) {
  deployer.deploy(message);
};