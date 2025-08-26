// scripts/deploy-frontend.js
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

function runCommand(command, description, timeoutMs = 300000) {
  return new Promise((resolve, reject) => {
    logInfo(description);
    
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        logError(`${description} failed: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr && !stderr.includes('warning') && !stderr.includes('npm warn')) {
        logWarning(`${description} stderr: ${stderr}`);
      }
      if (stdout) {
        console.log(stdout);
      }
      logSuccess(`${description} completed`);
      resolve(stdout);
    });

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

async function checkVercelCLI() {
  try {
    await runCommand('vercel --version', 'Checking Vercel CLI');
    return true;
  } catch (error) {
    return false;
  }
}

async function deployFrontend() {
  try {
    console.log("🚀 Frontend Deployment Script");
    console.log("=============================");

    // Check if we're in the right directory
    const frontendPath = path.join(__dirname, '../frontend');
    if (!fs.existsSync(frontendPath)) {
      logError("Frontend directory not found!");
      process.exit(1);
    }

    // Change to frontend directory
    process.chdir(frontendPath);
    logInfo("Changed to frontend directory");

    // Install dependencies
    await runCommand('bun install', 'Installing frontend dependencies');

    // Build the project
    await runCommand('bun run build', 'Building frontend for production');

    // Check if Vercel CLI is available
    const hasVercelCLI = await checkVercelCLI();

    if (hasVercelCLI) {
      logInfo("Vercel CLI found! Deploying to Vercel...");
      
      // Deploy to Vercel
      await runCommand('vercel --prod --yes', 'Deploying to Vercel', 600000); // 10 minute timeout
      
      logSuccess("🎉 Frontend deployed to Vercel successfully!");
      
    } else {
      logWarning("Vercel CLI not found.");
      logInfo("Installing Vercel CLI globally...");
      
      try {
        await runCommand('npm install -g vercel', 'Installing Vercel CLI globally');
        logInfo("Vercel CLI installed! Now deploying...");
        await runCommand('vercel --prod --yes', 'Deploying to Vercel', 600000);
        logSuccess("🎉 Frontend deployed to Vercel successfully!");
        
      } catch (error) {
        logWarning("Could not install Vercel CLI automatically.");
        logInfo("Manual deployment instructions:");
        console.log("\n📝 Manual Steps:");
        console.log("1. Install Vercel CLI:");
        console.log("   npm install -g vercel");
        console.log("\n2. Deploy:");
        console.log("   cd frontend");
        console.log("   vercel --prod");
        console.log("\n3. Or upload the 'dist' folder to your hosting provider");
        
        const distPath = path.join(frontendPath, 'dist');
        if (fs.existsSync(distPath)) {
          logSuccess(`✅ Build files ready in: ${distPath}`);
        }
      }
    }

    // Show deployment summary
    const deploymentPath = path.join(__dirname, '../deployments/sepolia.json');
    if (fs.existsSync(deploymentPath)) {
      const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
      
      console.log("\n📋 Environment Variables for Vercel:");
      console.log(`VITE_CONTRACT_ADDRESS=${deploymentInfo.contractAddress}`);
      console.log(`VITE_ADMIN_ADDRESS=${deploymentInfo.adminAddress}`);
      console.log(`VITE_CHAIN_ID=11155111`);
      console.log(`VITE_NETWORK_NAME=sepolia`);
      console.log(`VITE_INFURA_PROJECT_ID=${process.env.INFURA_PROJECT_ID || 'your-infura-project-id'}`);
    }

  } catch (error) {
    logError(`Frontend deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  deployFrontend();
}

module.exports = { deployFrontend };
