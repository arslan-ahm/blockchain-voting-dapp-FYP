// scripts/check-sepolia-balance.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  try {
    console.log("🔍 Checking Sepolia Testnet Balance...");
    console.log("=====================================");
    
    // Get the deployer wallet
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    
    console.log(`📍 Network: ${hre.network.name}`);
    console.log(`👤 Deployer address: ${deployerAddress}`);
    
    // Get balance
    const balance = await deployer.provider.getBalance(deployerAddress);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log(`💰 Current balance: ${balanceInEth} SepoliaETH`);
    
    // Calculate estimated gas cost for deployment
    try {
      const Voting = await ethers.getContractFactory("Voting");
      const adminAddress = process.env.ADMIN_ADDRESS_PROD || process.env.ADMIN_ADDRESS_DEV || deployerAddress;
      
      // Estimate deployment gas
      const deploymentData = Voting.interface.encodeDeploy([adminAddress]);
      const gasEstimate = await deployer.estimateGas({
        data: Voting.bytecode + deploymentData.slice(2)
      });
      
      // Get current gas price
      const gasPrice = await deployer.provider.getFeeData();
      const currentGasPrice = gasPrice.gasPrice || ethers.parseUnits("20", "gwei");
      
      // Calculate total cost
      const estimatedCost = gasEstimate * currentGasPrice;
      const estimatedCostInEth = ethers.formatEther(estimatedCost);
      
      console.log(`⛽ Estimated gas needed: ${gasEstimate.toString()}`);
      console.log(`💵 Current gas price: ${ethers.formatUnits(currentGasPrice, "gwei")} gwei`);
      console.log(`💸 Estimated deployment cost: ${estimatedCostInEth} SepoliaETH`);
      
      // Check if balance is sufficient
      if (balance >= estimatedCost) {
        console.log("✅ Sufficient balance for deployment!");
        const remaining = balance - estimatedCost;
        console.log(`💰 Remaining after deployment: ${ethers.formatEther(remaining)} SepoliaETH`);
      } else {
        const needed = estimatedCost - balance;
        console.log("❌ Insufficient balance for deployment!");
        console.log(`💸 Additional SepoliaETH needed: ${ethers.formatEther(needed)} SepoliaETH`);
        
        // Suggest solutions
        console.log("\n💡 Solutions:");
        console.log("1. Get more SepoliaETH from a faucet:");
        console.log("   - https://sepoliafaucet.com/");
        console.log("   - https://www.alchemy.com/faucets/ethereum-sepolia");
        console.log("2. Wait for lower gas prices");
        console.log("3. Use a different account with more funds");
      }
      
    } catch (estimateError) {
      console.log("⚠️  Could not estimate gas cost:", estimateError.message);
    }
    
  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
    
    // Check if it's a connection issue
    if (error.message.includes("could not detect network") || error.message.includes("missing response")) {
      console.log("\n💡 Possible issues:");
      console.log("1. Check your internet connection");
      console.log("2. Verify INFURA_PROJECT_ID in .env file");
      console.log("3. Check if Infura service is working");
    }
    
    // Check if it's a private key issue
    if (error.message.includes("private key") || error.message.includes("account")) {
      console.log("\n💡 Private key issues:");
      console.log("1. Make sure DEPLOYER_PRIVATE_KEY is set in .env file");
      console.log("2. Ensure the private key is correct (64 characters, no 0x prefix)");
      console.log("3. Verify the account has SepoliaETH");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
