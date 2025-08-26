// scripts/verify-account.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Account Verification");
  console.log("======================");
  
  // Show what account is currently configured
  try {
    const [deployer] = await ethers.getSigners();
    const address = await deployer.getAddress();
    const balance = await deployer.provider.getBalance(address);
    
    console.log("📍 Network:", hre.network.name);
    console.log("👤 Currently configured DEPLOYER address:", address);
    console.log("💰 DEPLOYER balance:", ethers.formatEther(balance), "SepoliaETH");
    
    // Show admin addresses from env
    const adminProd = process.env.ADMIN_ADDRESS_PROD;
    const adminDev = process.env.ADMIN_ADDRESS_DEV;
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    console.log("\n📋 Configuration:");
    console.log("🏭 ADMIN_ADDRESS_PROD:", adminProd);
    console.log("🧪 ADMIN_ADDRESS_DEV:", adminDev);
    console.log("🌍 NODE_ENV:", nodeEnv);
    console.log("👤 Will use as admin:", nodeEnv === 'production' ? adminProd : adminDev);
    
    // Check if this looks like the test account
    if (address === "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC") {
      console.log("\n⚠️  WARNING: You're using a test/development private key for DEPLOYMENT!");
      console.log("   This account has no real funds.");
      console.log("   You need to update DEPLOYER_PRIVATE_KEY in .env with the private key for:");
      console.log("   🎯 Account: 0xA17e2C49438e44456D401243a9ACa156605B2C12 (has 0.1581 SepoliaETH)");
      console.log("\n🔧 To fix this:");
      console.log("1. Open MetaMask");
      console.log("2. Switch to account 0xA17e2C49438e44456D401243a9ACa156605B2C12");
      console.log("3. Export the private key");
      console.log("4. Replace DEPLOYER_PRIVATE_KEY in .env file");
    } else if (address === "0xA17e2C49438e44456D401243a9ACa156605B2C12") {
      console.log("\n✅ Perfect! You're using the account that has SepoliaETH for deployment!");
      if (parseFloat(ethers.formatEther(balance)) > 0.001) {
        console.log("💰 You have sufficient funds for deployment!");
      }
    } else {
      console.log("\n✅ Using a custom private key");
      if (ethers.formatEther(balance) === "0.0") {
        console.log("❌ But this account has no SepoliaETH");
        console.log("   Make sure this is the correct account that has 0.1581 SepoliaETH");
        console.log("   Expected account: 0xA17e2C49438e44456D401243a9ACa156605B2C12");
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    if (error.message.includes("invalid private key")) {
      console.log("\n💡 Private Key Error:");
      console.log("1. Make sure DEPLOYER_PRIVATE_KEY is 64 characters long");
      console.log("2. Remove any '0x' prefix");
      console.log("3. Use only hexadecimal characters (0-9, a-f)");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
