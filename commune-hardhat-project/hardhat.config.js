// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    commune: {
      url: "https://testnet.api.communeai.net",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 9461,
      gasPrice: 1000000000, // 1 gwei
      gas: 1500000, // Lower gas limit
      timeout: 60000, // 1 minute timeout
      confirmations: 1,
      networkCheckTimeout: 10000,
      timeoutBlocks: 50,
      allowUnlimitedContractSize: true
    }
  }
};