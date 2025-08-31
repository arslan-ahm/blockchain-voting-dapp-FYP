const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, prefix, message) {
  console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

function logInfo(message) { log(colors.blue, 'INFO', message); }
function logSuccess(message) { log(colors.green, 'SUCCESS', message); }
function logWarning(message) { log(colors.yellow, 'WARNING', message); }
function logError(message) { log(colors.red, 'ERROR', message); }

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    logInfo(description);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        logError(`${description} failed: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr && !stderr.includes('warning')) {
        logError(`${description} stderr: ${stderr}`);
      }
      if (stdout) {
        console.log(stdout);
      }
      logSuccess(`${description} completed`);
      resolve(stdout);
    });
  });
}

async function checkEnvironment() {
  logInfo("Checking environment variables...");
  
  // Check root .env file
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    logError(".env file not found in root directory");
    process.exit(1);
  }

  // Read and check required variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['DEPLOYER_PRIVATE_KEY', 'INFURA_PROJECT_ID', 'ADMIN_ADDRESS_PROD'];
  
  for (const varName of requiredVars) {
    if (!envContent.includes(varName) || envContent.includes(`${varName}=your`)) {
      logError(`${varName} not properly set in .env file`);
      process.exit(1);
    }
  }

  // Check frontend .env file
  const frontendEnvPath = path.join(__dirname, '../frontend/.env');
  if (!fs.existsSync(frontendEnvPath)) {
    logError("frontend/.env file not found");
    process.exit(1);
  }

  logSuccess("Environment variables check passed");
}

async function updateHardhatConfig() {
  logInfo("Updating Hardhat configuration for production...");
  
  const hardhatConfigPath = path.join(__dirname, '../hardhat.config.js');
  let configContent = fs.readFileSync(hardhatConfigPath, 'utf8');
  
  // Ensure production network configuration
  if (!configContent.includes('sepolia:') || !configContent.includes('process.env.INFURA_PROJECT_ID')) {
    logInfo("Updating Hardhat config with production networks...");
    
    const networkConfig = `
    sepolia: {
      url: \`https://sepolia.infura.io/v3/\${process.env.INFURA_PROJECT_ID}\`,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: 20000000000, // 20 gwei
      gas: 6000000
    },`;

    // Add network if not exists
    if (!configContent.includes('sepolia:')) {
      configContent = configContent.replace(
        /networks:\s*{/,
        `networks: {${networkConfig}`
      );
      fs.writeFileSync(hardhatConfigPath, configContent);
      logSuccess("Hardhat config updated with Sepolia network");
    }
  }
}

async function main() {
  console.log("🚀 Starting Production Deployment...");
  console.log("=====================================");

  try {
    // Step 1: Check environment
    await checkEnvironment();

    // Step 2: Update Hardhat config
    await updateHardhatConfig();

    // Step 3: Install dependencies
    await runCommand('npm install', 'Installing root dependencies');
    
    // Step 4: Install frontend dependencies
    process.chdir(path.join(__dirname, '../frontend'));
    await runCommand('npm install', 'Installing frontend dependencies');
    process.chdir(path.join(__dirname, '..'));

    // Step 5: Compile contracts
    await runCommand('npx hardhat compile', 'Compiling smart contracts');

    // Step 6: Deploy to Sepolia
    logInfo("Deploying contracts to Sepolia testnet...");
    await runCommand('npx hardhat run scripts/deploy-sepolia.js --network sepolia', 'Deploying to Sepolia');

    // Step 7: Verify contracts (optional)
    try {
      await runCommand('npx hardhat run scripts/verify-sepolia.js --network sepolia', 'Verifying contracts on Etherscan');
    } catch (error) {
      logWarning('Contract verification failed, but deployment continues');
    }

    // Step 8: Build frontend
    process.chdir(path.join(__dirname, '../frontend'));
    await runCommand('npm run build', 'Building frontend for production');
    process.chdir(path.join(__dirname, '..'));

    // Step 9: Show deployment summary
    const deploymentPath = path.join(__dirname, '../deployments/sepolia.json');
    if (fs.existsSync(deploymentPath)) {
      const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
      
      console.log("\n🎉 Deployment Completed Successfully!");
      console.log("=====================================");
      logSuccess(`Contract Address: ${deploymentInfo.contractAddress}`);
      logSuccess(`Admin Address: ${deploymentInfo.adminAddress}`);
      logSuccess(`Network: Sepolia Testnet`);
      logSuccess(`Explorer: https://sepolia.etherscan.io/address/${deploymentInfo.contractAddress}`);
      
      console.log("\n📝 Next Steps:");
      console.log("1. Deploy frontend to Vercel:");
      console.log("   cd frontend");
      console.log("   vercel --prod");
      console.log("\n2. Update frontend environment variables with deployed contract address");
      console.log(`   VITE_CONTRACT_ADDRESS=${deploymentInfo.contractAddress}`);
      console.log(`   VITE_ADMIN_ADDRESS=${deploymentInfo.adminAddress}`);
      console.log("   VITE_CHAIN_ID=11155111");
      console.log("   VITE_NETWORK_NAME=sepolia");
    }

  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run main function
main();
