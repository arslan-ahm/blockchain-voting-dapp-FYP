// deployment.config.js
// Deployment configuration for different environments

const config = {
  development: {
    network: "localhost",
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545",
    adminAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // First Hardhat account
    gasLimit: 6000000,
    gasPrice: 20000000000
  },
  
  sepolia: {
    network: "sepolia",
    chainId: 11155111,
    rpcUrl: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    adminAddress: "0xFb6131fa30594c79e75bed4C4ab3E870c12D8323",
    gasLimit: 6000000,
    gasPrice: 20000000000,
    blockExplorer: "https://sepolia.etherscan.io"
  },
  
  mainnet: {
    network: "mainnet",
    chainId: 1,
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    adminAddress: "0xFb6131fa30594c79e75bed4C4ab3E870c12D8323",
    gasLimit: 6000000,
    gasPrice: 20000000000,
    blockExplorer: "https://etherscan.io"
  }
};

const getConfig = (environment) => {
  const env = environment || process.env.NODE_ENV || "development";
  return config[env] || config.development;
};

module.exports = { config, getConfig };
