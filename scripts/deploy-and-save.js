// scripts/deploy-and-save.js
const fs = require('fs');
const path = require('path');

async function main() {
  // Deploy the contract using Hardhat Ignition
  console.log("Deploying Voting contract...");
  
  const { voting } = await ignition.deploy("VotingModule");
  
  const contractAddress = await voting.getAddress();
  console.log("Voting contract deployed to:", contractAddress);
  
  // Get the contract ABI from artifacts
  const artifactPath = path.join(__dirname, "../artifacts/contracts/Voting.sol/Voting.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  // Create constants file for React
  const contractConstants = `
// Auto-generated contract constants
export const VOTING_CONTRACT_ADDRESS = "${contractAddress}";
export const VOTING_CONTRACT_ABI = ${JSON.stringify(artifact.abi, null, 2)};
`;

  // Save to React project (adjust path as needed)
  const constantsPath = path.join(__dirname, "../src/constants/contract.ts");
  const constantsDir = path.dirname(constantsPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(constantsDir)) {
    fs.mkdirSync(constantsDir, { recursive: true });
  }
  
  fs.writeFileSync(constantsPath, contractConstants);
  console.log("Contract constants saved to:", constantsPath);
  
  // Also save deployment info
  const deploymentInfo = {
    contractAddress,
    networkName: "localhost",
    networkChainId: 31337,
    deploymentTime: new Date().toISOString(),
    blockNumber: await voting.deploymentTransaction()?.blockNumber || 0,
  };
  
  const deploymentPath = path.join(__dirname, "../deployments/localhost.json");
  const deploymentDir = path.dirname(deploymentPath);
  
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", deploymentPath);
  
  // Verify the contract is deployed
  const provider = voting.runner?.provider;
  if (provider) {
    const bytecode = await provider.getCode(contractAddress);
    console.log("Contract bytecode length:", bytecode.length);
    console.log("Contract is deployed:", bytecode !== "0x");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });