const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VotingModule", (m) => {
  // Define initial owner (your wallet address or Hardhat account)
  const initialOwner = m.getAccount(0); // Uses Hardhat’s first account
  const voting = m.contract("Voting", [initialOwner]);

  return { voting };
});