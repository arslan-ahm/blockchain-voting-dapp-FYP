// scripts/check-deployment-account.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Deployment Account Verification");
  console.log("==================================");
  
  try {
    const [deployer] = await ethers.getSigners();
    const address = await deployer.getAddress();
    const balance = await deployer.provider.getBalance(address);
    
    console.log("📍 Network:", hre.network.name);
    console.log("👤 DEPLOYER address (from DEPLOYER_PRIVATE_KEY):", address);
    console.log("💰 DEPLOYER balance:", ethers.formatEther(balance), "SepoliaETH");
    
    // Show admin addresses from env
    const adminProd = process.env.ADMIN_ADDRESS_PROD;
    const adminDev = process.env.ADMIN_ADDRESS_DEV;
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    console.log("\n📋 Environment Configuration:");
    console.log("🏭 ADMIN_ADDRESS_PROD:", adminProd);
    console.log("🧪 ADMIN_ADDRESS_DEV:", adminDev);
    console.log("🌍 NODE_ENV:", nodeEnv);
    console.log("👤 Contract admin will be:", nodeEnv === 'production' ? adminProd : adminDev);
    
    console.log("\n🔍 Analysis:");
    
    // Check if this is the test account
    if (address === "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC") {
      console.log("❌ PROBLEM: You're using the TEST private key for deployment!");
      console.log("❌ This account has 0 SepoliaETH and cannot pay for deployment.");
      console.log("\n🎯 SOLUTION: You need to update DEPLOYER_PRIVATE_KEY in .env");
      console.log("   Replace it with the private key for: 0xA17e2C49438e44456D401243a9ACa156605B2C12");
      console.log("   (This is your ADMIN_ADDRESS_PROD that has 0.1581 SepoliaETH)\n");
      
      console.log("📝 Steps to fix:");
      console.log("1. Open MetaMask");
      console.log("2. Switch to account: 0xA17e2C49438e44456D401243a9ACa156605B2C12");
      console.log("3. Click ⋯ → Account Details → Export Private Key");
      console.log("4. Copy the 64-character private key (remove 0x prefix)");
      console.log("5. Update DEPLOYER_PRIVATE_KEY in .env file");
      console.log("6. Run this script again to verify");
      
    } else if (address === "0xA17e2C49438e44456D401243a9ACa156605B2C12") {
      console.log("✅ PERFECT! You're using the correct account for deployment!");
      console.log("✅ This account has SepoliaETH and can pay for deployment!");
      if (parseFloat(ethers.formatEther(balance)) > 0.001) {
        console.log("💰 Sufficient funds for deployment!");
        console.log("\n🚀 Ready to deploy! Run: bun run deploy:production");
      }
    } else {
      console.log("⚠️  Using a different account for deployment");
      if (parseFloat(ethers.formatEther(balance)) === 0) {
        console.log("❌ This account has no SepoliaETH");
        console.log("   Expected account with funds: 0xA17e2C49438e44456D401243a9ACa156605B2C12");
      } else {
        console.log("✅ This account has funds and can be used for deployment");
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    if (error.message.includes("invalid private key") || error.message.includes("private key")) {
      console.log("\n💡 Private Key Error Solutions:");
      console.log("1. Make sure DEPLOYER_PRIVATE_KEY is exactly 64 characters long");
      console.log("2. Remove any '0x' prefix from the private key");
      console.log("3. Use only hexadecimal characters (0-9, a-f)");
      console.log("4. Make sure there are no extra spaces or characters");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
