// scripts/check-balance.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const network = hre.network.name;
  console.log(`Checking balance on network: ${network}`);
  
  // Get the deployer wallet
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log(`Deployer address: ${deployerAddress}`);
  
  // Get balance
  const balance = await deployer.provider.getBalance(deployerAddress);
  const balanceInEth = ethers.formatEther(balance);
  
  console.log(`Current balance: ${balanceInEth} ETH`);
  
  // Calculate estimated gas cost
  const estimatedGasCost = ethers.parseEther("0.1"); // Rough estimate
  const estimatedGasCostInEth = ethers.formatEther(estimatedGasCost);
  
  console.log(`Estimated deployment cost: ${estimatedGasCostInEth} ETH`);
  
  if (balance < estimatedGasCost) {
    console.log("⚠️  Insufficient funds for deployment!");
    console.log("🔗 Get testnet ETH from:");
    console.log("   • https://sepoliafaucet.com/");
    console.log("   • https://www.infura.io/faucet/sepolia");
    console.log("   • https://faucet.quicknode.com/ethereum/sepolia");
  } else {
    console.log("✅ Sufficient funds for deployment!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
