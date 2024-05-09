const MessageStorage = artifacts.require("./MessageStorage.sol");
  
module.exports = function (deployer) {
  deployer.deploy(MessageStorage);
};