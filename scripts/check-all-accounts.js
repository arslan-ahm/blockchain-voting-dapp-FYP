// scripts/check-all-accounts.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function checkAddress(address, label) {
  try {
    const balance = await ethers.provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);
    console.log(`${label}: ${address}`);
    console.log(`   Balance: ${balanceInEth} SepoliaETH`);
    return { address, balance: balanceInEth, hasBalance: parseFloat(balanceInEth) > 0 };
  } catch (error) {
    console.log(`${label}: ${address}`);
    console.log(`   Error checking balance: ${error.message}`);
    return { address, balance: "Error", hasBalance: false };
  }
}

async function main() {
  console.log("🔍 Checking All Configured Accounts");
  console.log("===================================");
  console.log(`📍 Network: ${hre.network.name}\n`);

  // Check current deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log("1️⃣ CURRENT DEPLOYER ACCOUNT (from DEPLOYER_PRIVATE_KEY):");
  await checkAddress(deployerAddress, "   Deployer");
  
  console.log("\n2️⃣ CONFIGURED ADMIN ACCOUNTS:");
  const adminProd = process.env.ADMIN_ADDRESS_PROD;
  const adminDev = process.env.ADMIN_ADDRESS_DEV;
  
  if (adminProd) {
    const prodResult = await checkAddress(adminProd, "   Production Admin");
    if (prodResult.hasBalance) {
      console.log("   🎯 This account has SepoliaETH! You might want to use its private key for deployment.");
    }
  }
  
  if (adminDev) {
    const devResult = await checkAddress(adminDev, "   Development Admin");
    if (devResult.hasBalance) {
      console.log("   🎯 This account has SepoliaETH! You might want to use its private key for deployment.");
    }
  }

  console.log("\n3️⃣ ANALYSIS:");
  if (deployerAddress === "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC") {
    console.log("❌ You're using the default test private key for deployment");
    console.log("❌ This account has no SepoliaETH");
  }
  
  console.log("\n4️⃣ TO FIX THE ISSUE:");
  console.log("You need to update DEPLOYER_PRIVATE_KEY in .env with the private key of the account that has 0.1581 SepoliaETH");
  console.log("This could be:");
  console.log("- The private key for your Production Admin account (if it has the funds)");
  console.log("- The private key for your Development Admin account (if it has the funds)");
  console.log("- The private key for a completely different account that has the funds");
  
  console.log("\n💡 The ADMIN_ADDRESS settings are for contract permissions, not deployment funding!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
