const SimpleMessaging = artifacts.require("./SimpleMessaging.sol");
  
module.exports = function (deployer) {
  deployer.deploy(SimpleMessaging);
};