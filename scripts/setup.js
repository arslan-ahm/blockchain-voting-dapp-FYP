#!/usr/bin/env bun
// setup.js - Initial project setup script

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Blockchain Voting DApp...\n');

// Create environment files if they don't exist
const rootEnvPath = path.join(__dirname, '../.env');
const frontendEnvPath = path.join(__dirname, '../frontend/.env.local');

if (!fs.existsSync(rootEnvPath)) {
  fs.copyFileSync(path.join(__dirname, '../.env.example'), rootEnvPath);
  console.log('✅ Created .env from .env.example');
} else {
  console.log('⚠️  .env already exists');
}

if (!fs.existsSync(frontendEnvPath)) {
  fs.copyFileSync(path.join(__dirname, '../frontend/.env.example'), frontendEnvPath);
  console.log('✅ Created frontend/.env.local from .env.example');
} else {
  console.log('⚠️  frontend/.env.local already exists');
}

console.log('\n📝 Next steps:');
console.log('1. Edit .env and frontend/.env.local with your configuration');
console.log('2. Run: bun run compile');
console.log('3. Run: bun run server (in one terminal)');
console.log('4. Run: bun run deploy:local-save (in another terminal)');
console.log('5. Copy contract address to frontend/.env.local');
console.log('6. Run: bun run dev');
console.log('\n🎉 Setup complete! Happy coding!');
