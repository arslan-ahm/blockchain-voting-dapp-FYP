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

function runCommand(command, description, timeoutMs = 300000) { // 5 minute default timeout
  return new Promise((resolve, reject) => {
    logInfo(description);
    
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        logError(`${description} failed: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr && !stderr.includes('warning') && !stderr.includes('npm warn')) {
        logError(`${description} stderr: ${stderr}`);
      }
      if (stdout) {
        console.log(stdout);
      }
      logSuccess(`${description} completed`);
      resolve(stdout);
    });

    // Set timeout
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      logError(`${description} timed out after ${timeoutMs/1000} seconds`);
      reject(new Error(`Command timed out: ${command}`));
    }, timeoutMs);

    child.on('exit', () => {
      clearTimeout(timeout);
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
    await runCommand('bun install', 'Installing frontend dependencies');
    process.chdir(path.join(__dirname, '..'));

    // Step 5: Compile contracts
    await runCommand('npx hardhat compile', 'Compiling smart contracts');

    // Step 6: Check Sepolia balance first
    logInfo("Checking Sepolia balance...");
    await runCommand('npx hardhat run scripts/check-sepolia-balance.js --network sepolia', 'Checking Sepolia Balance');
    
    // Step 7: Deploy to Sepolia
    logInfo("Deploying contracts to Sepolia testnet...");
    await runCommand('npx hardhat run scripts/deploy-sepolia.js --network sepolia', 'Deploying to Sepolia');

    // Step 8: Wait for deployment to settle
    logInfo("Waiting for deployment to settle...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 9: Verify contracts (optional)
    try {
      logInfo("Verifying contracts on Etherscan...");
      await runCommand('npx hardhat run scripts/verify-sepolia.js --network sepolia', 'Verifying contracts on Etherscan');
    } catch (error) {
      logWarning('Contract verification failed, but deployment continues');
    }

    // Step 10: Build frontend
    logInfo("Building frontend for production...");
    process.chdir(path.join(__dirname, '../frontend'));
    await runCommand('bun run build', 'Building frontend for production');
    
    // Step 11: Deploy frontend (if not using Vercel CLI)
    logInfo("Frontend built successfully!");
    process.chdir(path.join(__dirname, '..'));

    // Step 12: Show deployment summary
    const deploymentPath = path.join(__dirname, '../deployments/sepolia.json');
    if (fs.existsSync(deploymentPath)) {
      const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
      
      console.log("\n🎉 Deployment Completed Successfully!");
      console.log("=====================================");
      logSuccess(`Contract Address: ${deploymentInfo.contractAddress}`);
      logSuccess(`Admin Address: ${deploymentInfo.adminAddress}`);
      logSuccess(`Network: Sepolia Testnet`);
      logSuccess(`Explorer: https://sepolia.etherscan.io/address/${deploymentInfo.contractAddress}`);
      
      console.log("\n📝 Frontend Deployment:");
      console.log("✅ Frontend built successfully in './frontend/dist'");
      console.log("✅ Environment variables updated automatically");
      
      console.log("\n🚀 Next Steps - Deploy to Vercel:");
      console.log("1. Install Vercel CLI globally:");
      console.log("   npm install -g vercel");
      console.log("\n2. Deploy to Vercel:");
      console.log("   cd frontend");
      console.log("   vercel --prod");
      console.log("\n3. Or manually upload the 'dist' folder to your hosting provider");
      
      console.log("\n📋 Environment Variables for Vercel:");
      console.log(`VITE_CONTRACT_ADDRESS=${deploymentInfo.contractAddress}`);
      console.log(`VITE_ADMIN_ADDRESS=${deploymentInfo.adminAddress}`);
      console.log(`VITE_CHAIN_ID=11155111`);
      console.log(`VITE_NETWORK_NAME=sepolia`);
      console.log(`VITE_INFURA_PROJECT_ID=${process.env.INFURA_PROJECT_ID || 'your-infura-project-id'}`);
      
      console.log("\n🎯 Deployment Summary:");
      console.log("✅ Smart contracts deployed to Sepolia");
      console.log("✅ Frontend built and ready");
      console.log("✅ All configurations updated");
      console.log("⏳ Manual step: Deploy frontend to Vercel");
    }

  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run main function
main();
