// scripts/deploy-simple.js
const fs = require('fs');
const path = require('path');
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const network = hre.network.name;
  const nodeEnv = process.env.NODE_ENV || "development";
  
  console.log(`Deploying to network: ${network}`);
  console.log(`Environment: ${nodeEnv}`);
  
  // Get admin address based on environment
  let adminAddress;
  if (nodeEnv === "production") {
    adminAddress = process.env.ADMIN_ADDRESS_PROD;
    if (!adminAddress) {
      throw new Error("ADMIN_ADDRESS_PROD is required for production deployment");
    }
  } else {
    adminAddress = process.env.ADMIN_ADDRESS_DEV || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  }
  
  console.log(`Using admin address: ${adminAddress}`);
  
  // Deploy the contract
  console.log("Deploying Voting contract...");
  
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(adminAddress);
  
  await voting.waitForDeployment();
  const contractAddress = await voting.getAddress();
  
  console.log("Voting contract deployed to:", contractAddress);
  
  // Get network configuration
  const networkConfig = {
    localhost: {
      name: "localhost",
      chainId: 31337,
      rpcUrl: "http://127.0.0.1:8545",
      blockExplorer: "http://localhost:8545"
    },
    sepolia: {
      name: "sepolia",
      chainId: 11155111,
      rpcUrl: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      blockExplorer: "https://sepolia.etherscan.io"
    },
    mainnet: {
      name: "mainnet",
      chainId: 1,
      rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      blockExplorer: "https://etherscan.io"
    }
  };
  
  const currentNetwork = networkConfig[network] || networkConfig.localhost;
  
  // Get the contract ABI from artifacts
  const artifactPath = path.join(__dirname, "../artifacts/contracts/Voting.sol/Voting.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  // Create constants file for React
  const contractConstants = `// Auto-generated contract constants
// Network: ${currentNetwork.name}
// Deployed at: ${new Date().toISOString()}
// Contract Address: ${contractAddress}

export const VOTING_CONTRACT_ADDRESS = "${contractAddress}";
export const VOTING_CONTRACT_ABI = ${JSON.stringify(artifact.abi, null, 2)};

export const NETWORK_CONFIG = {
  name: "${currentNetwork.name}",
  chainId: ${currentNetwork.chainId},
  rpcUrl: "${currentNetwork.rpcUrl}",
  blockExplorer: "${currentNetwork.blockExplorer}",
  contractAddress: "${contractAddress}"
};
`;

  // Save to React project constants
  const constantsPath = path.join(__dirname, "../frontend/src/constants/contract.ts");
  const constantsDir = path.dirname(constantsPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(constantsDir)) {
    fs.mkdirSync(constantsDir, { recursive: true });
  }
  
  fs.writeFileSync(constantsPath, contractConstants);
  console.log("Contract constants saved to:", constantsPath);
  
  // Update frontend .env file
  const envPath = path.join(__dirname, "../frontend/.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update contract address
    if (envContent.includes('VITE_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /VITE_CONTRACT_ADDRESS=.*/,
        `VITE_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("Frontend .env updated with contract address");
  }
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    networkName: currentNetwork.name,
    networkChainId: currentNetwork.chainId,
    rpcUrl: currentNetwork.rpcUrl,
    blockExplorer: currentNetwork.blockExplorer,
    deploymentTime: new Date().toISOString(),
    adminAddress: adminAddress,
    environment: nodeEnv
  };
  
  const deploymentPath = path.join(__dirname, `../deployments/${network}.json`);
  const deploymentDir = path.dirname(deploymentPath);
  
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", deploymentPath);
  
  console.log("\n✅ Deployment completed successfully!");
  console.log(`📋 Contract Address: ${contractAddress}`);
  console.log(`👤 Admin Address: ${adminAddress}`);
  console.log(`🌍 Network: ${currentNetwork.name} (Chain ID: ${currentNetwork.chainId})`);
  console.log(`🔗 Block Explorer: ${currentNetwork.blockExplorer}/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
