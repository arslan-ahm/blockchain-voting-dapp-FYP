const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🚀 Deploying to Sepolia Testnet...");
  console.log("📝 Deployer address:", deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Get admin address from environment or use deployer
  const adminAddress = process.env.ADMIN_ADDRESS_PROD || process.env.ADMIN_ADDRESS_DEV || deployer.address;
  console.log("👤 Admin address:", adminAddress);

  // Deploy the Voting contract
  console.log("\n📦 Deploying Voting contract...");
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(adminAddress);
  
  await voting.waitForDeployment();
  const contractAddress = await voting.getAddress();

  console.log("✅ Voting contract deployed to:", contractAddress);
  console.log("🔗 Transaction hash:", voting.deploymentTransaction().hash);

  // Wait for a few block confirmations
  console.log("⏳ Waiting for block confirmations...");
  await voting.deploymentTransaction().wait(3);

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    contractAddress: contractAddress,
    adminAddress: adminAddress,
    deployerAddress: deployer.address,
    deploymentTimestamp: new Date().toISOString(),
    transactionHash: voting.deploymentTransaction().hash,
    blockNumber: voting.deploymentTransaction().blockNumber,
    gasUsed: voting.deploymentTransaction().gasLimit?.toString(),
    chainId: 11155111
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentPath = path.join(deploymentsDir, "sepolia.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentPath);

  // Update frontend constants
  const constantsPath = path.join(__dirname, "../frontend/src/constants/contract.ts");
  const constantsContent = `// Auto-generated contract constants
export const VOTING_CONTRACT_ADDRESS = "${contractAddress}";
export const VOTING_CONTRACT_ABI = ${JSON.stringify(require("../artifacts/contracts/Voting.sol/Voting.json").abi, null, 2)};
export const NETWORK_CONFIG = {
  chainId: 11155111,
  networkName: "sepolia",
  rpcUrl: "https://sepolia.infura.io/v3/\${process.env.VITE_INFURA_PROJECT_ID}",
  blockExplorer: "https://sepolia.etherscan.io"
};
export const ADMIN_ADDRESS = "${adminAddress}";
export const DEPLOYMENT_INFO = ${JSON.stringify(deploymentInfo, null, 2)};
`;

  fs.writeFileSync(constantsPath, constantsContent);
  console.log("📝 Frontend constants updated:", constantsPath);

  // Update frontend .env file
  const frontendEnvPath = path.join(__dirname, "../frontend/.env");
  let frontendEnvContent = "";
  if (fs.existsSync(frontendEnvPath)) {
    frontendEnvContent = fs.readFileSync(frontendEnvPath, "utf8");
  }

  // Update contract address and admin address in frontend .env
  let updatedEnvContent = frontendEnvContent
    .replace(/VITE_CONTRACT_ADDRESS=.*/, `VITE_CONTRACT_ADDRESS=${contractAddress}`)
    .replace(/VITE_ADMIN_ADDRESS=.*/, `VITE_ADMIN_ADDRESS=${adminAddress}`)
    .replace(/VITE_CHAIN_ID=.*/, `VITE_CHAIN_ID=11155111`)
    .replace(/VITE_NETWORK_NAME=.*/, `VITE_NETWORK_NAME=sepolia`)
    .replace(/VITE_RPC_URL=.*/, `VITE_RPC_URL=https://sepolia.infura.io/v3/\${process.env.VITE_INFURA_PROJECT_ID || '${process.env.INFURA_PROJECT_ID}'}`);

  // Add missing variables if they don't exist
  if (!updatedEnvContent.includes('VITE_CONTRACT_ADDRESS=')) {
    updatedEnvContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}`;
  }
  if (!updatedEnvContent.includes('VITE_ADMIN_ADDRESS=')) {
    updatedEnvContent += `\nVITE_ADMIN_ADDRESS=${adminAddress}`;
  }
  if (!updatedEnvContent.includes('VITE_CHAIN_ID=')) {
    updatedEnvContent += `\nVITE_CHAIN_ID=11155111`;
  }
  if (!updatedEnvContent.includes('VITE_NETWORK_NAME=')) {
    updatedEnvContent += `\nVITE_NETWORK_NAME=sepolia`;
  }
  if (!updatedEnvContent.includes('VITE_INFURA_PROJECT_ID=')) {
    updatedEnvContent += `\nVITE_INFURA_PROJECT_ID=${process.env.INFURA_PROJECT_ID}`;
  }

  fs.writeFileSync(frontendEnvPath, updatedEnvContent);
  console.log("🔧 Frontend environment updated:", frontendEnvPath);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Summary:");
  console.log("   Contract Address:", contractAddress);
  console.log("   Admin Address:", adminAddress);
  console.log("   Network: Sepolia Testnet");
  console.log("   Explorer:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("\n📝 Next steps:");
  console.log("1. Verify the contract on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${contractAddress} ${adminAddress}`);
  console.log("2. Update your Vercel environment variables");
  console.log("3. Deploy your frontend to Vercel");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
