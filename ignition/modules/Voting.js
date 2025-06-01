// ignition/modules/Voting.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VotingModule", (m) => {
  // Get the deployer account (first account from hardhat network)
  const deployer = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  
  // Deploy the Voting contract with the deployer as the initial owner
  const voting = m.contract("Voting", [deployer], {
    from: deployer,
  });

  return { voting };
});

// Alternative version if you want to use a specific address as owner
// module.exports = buildModule("VotingModule", (m) => {
//   const initialOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // First Hardhat account
//   
//   const voting = m.contract("Voting", [initialOwner]);
//   
//   return { voting };
// });