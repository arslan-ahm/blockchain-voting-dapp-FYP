// scripts/validate-environment.js
// Validates environment configuration before deployment

const fs = require('fs');
const path = require('path');

function validateEnvironment() {
  console.log('🔍 Validating environment configuration...\n');
  
  const errors = [];
  const warnings = [];
  
  // Check root .env file
  const rootEnvPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(rootEnvPath)) {
    errors.push('Root .env file not found. Copy from .env.example and configure.');
  } else {
    const rootEnv = fs.readFileSync(rootEnvPath, 'utf8');
    
    // Check required variables
    const requiredVars = ['DEPLOYER_PRIVATE_KEY', 'INFURA_PROJECT_ID', 'ADMIN_ADDRESS_PROD'];
    for (const varName of requiredVars) {
      if (!rootEnv.includes(varName) || rootEnv.includes(`${varName}=your_`)) {
        errors.push(`${varName} not configured in root .env`);
      }
    }
    
    // Check admin address format
    if (rootEnv.includes('ADMIN_ADDRESS_PROD=0xFb6131fa30594c79e75bed4C4ab3E870c12D8323')) {
      console.log('✅ Production admin address configured correctly');
    } else {
      warnings.push('Production admin address may not be configured correctly');
    }
  }
  
  // Check frontend .env file
  const frontendEnvPath = path.join(__dirname, '../frontend/.env');
  if (!fs.existsSync(frontendEnvPath)) {
    errors.push('Frontend .env file not found. Copy from .env.example and configure.');
  } else {
    const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    
    // Check required variables
    const requiredFrontendVars = [
      'VITE_CONTRACT_ADDRESS',
      'VITE_ADMIN_ADDRESS',
      'VITE_PINATA_API_KEY',
      'VITE_PINATA_API_SECRET',
      'VITE_RPC_URL'
    ];
    
    for (const varName of requiredFrontendVars) {
      if (!frontendEnv.includes(varName) || frontendEnv.includes(`${varName}=your_`)) {
        errors.push(`${varName} not configured in frontend .env`);
      }
    }
  }
  
  // Check if contracts are compiled
  const artifactsPath = path.join(__dirname, '../artifacts/contracts/Voting.sol/Voting.json');
  if (!fs.existsSync(artifactsPath)) {
    errors.push('Contracts not compiled. Run: npm run compile');
  } else {
    console.log('✅ Smart contracts compiled');
  }
  
  // Check if frontend builds
  const frontendDistPath = path.join(__dirname, '../frontend/dist');
  if (!fs.existsSync(frontendDistPath)) {
    warnings.push('Frontend not built. Run: cd frontend && npm run build');
  } else {
    console.log('✅ Frontend built successfully');
  }
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
  if (majorVersion < 18) {
    warnings.push(`Node.js version ${nodeVersion} detected. Recommended: Node 18+`);
  } else {
    console.log(`✅ Node.js version ${nodeVersion} is compatible`);
  }
  
  // Check npm/bun version
  try {
    const { execSync } = require('child_process');
    try {
      const bunVersion = execSync('bun --version', { encoding: 'utf8' }).trim();
      console.log(`✅ Bun version ${bunVersion}`);
    } catch {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log(`✅ npm version ${npmVersion}`);
    }
  } catch (error) {
    warnings.push('Could not check package manager version');
  }
  
  // Report results
  console.log('\n📊 Validation Results:');
  console.log('='.repeat(50));
  
  if (errors.length === 0) {
    console.log('✅ All required configurations are valid!');
  } else {
    console.log(`❌ ${errors.length} error(s) found:`);
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warning(s):`);
    warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n🚀 Ready for deployment!');
  } else if (errors.length === 0) {
    console.log('\n✅ Configuration is valid (with warnings)');
  } else {
    console.log('\n❌ Please fix the errors before deployment');
    process.exit(1);
  }
}

// Run validation
validateEnvironment();
