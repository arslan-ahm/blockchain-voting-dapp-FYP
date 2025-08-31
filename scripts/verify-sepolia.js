const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying contract on Etherscan...");
  
  // Read deployment info
  const deploymentInfo = require("../deployments/sepolia.json");
  const contractAddress = deploymentInfo.contractAddress;
  const adminAddress = deploymentInfo.adminAddress;

  console.log("📝 Contract Address:", contractAddress);
  console.log("👤 Admin Address:", adminAddress);

  try {
    // Verify the contract
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [adminAddress],
    });
    
    console.log("✅ Contract verified successfully!");
    console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
