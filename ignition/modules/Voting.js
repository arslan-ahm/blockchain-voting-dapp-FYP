// ignition/modules/Voting.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
require("dotenv").config();

module.exports = buildModule("VotingModule", (m) => {
  // Get admin address based on environment
  const getAdminAddress = () => {
    const nodeEnv = process.env.NODE_ENV || "development";
    
    console.log(`Environment: ${nodeEnv}`);
    
    if (nodeEnv === "production") {
      const adminAddress = process.env.ADMIN_ADDRESS_PROD;
      if (!adminAddress) {
        throw new Error("ADMIN_ADDRESS_PROD is required for production deployment");
      }
      console.log(`Using production admin address: ${adminAddress}`);
      return adminAddress;
    } else {
      const adminAddress = process.env.ADMIN_ADDRESS_DEV || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
      console.log(`Using development admin address: ${adminAddress}`);
      return adminAddress;
    }
  };
  
  const adminAddress = getAdminAddress();
  
  // Deploy the Voting contract with the appropriate admin address
  const voting = m.contract("Voting", [adminAddress]);

  return { voting };
});