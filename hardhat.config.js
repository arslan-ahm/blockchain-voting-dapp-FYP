require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");

module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 1337, 
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    sepolia: {
      url: "https://rpc.sepolia.org", 
      accounts: [/* Add your private key or use environment variables */],
    },
  },
  ignition: {
    strategy: "basic",
  },
};