
<h1 align="center"> 🏛️ Decentralized Blockchain Voting DApp</h1>

<div align="center">

<!-- <img src="assets/blockchain-voting-logo.png" alt="Blockchain Voting DApp Logo" style="max-width: 100%; width: 300px;"> -->

A decentralized voting application built on blockchain technology, providing secure and transparent voting solutions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum-blue)](https://ethereum.org)
[![Frontend](https://img.shields.io/badge/Frontend-React%20Vite-orange)](https://vitejs.dev)
[![Backend](https://img.shields.io/badge/Backend-Hardhat%20Solidity-green)](https://hardhat.org)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel-black)](https://vercel.com)

</div>

## 🛠️ Tools

[![Tools used](https://skillicons.dev/icons?i=bun,typescript,react,vite,tailwind,redux,solidity)](https://skillicons.dev)

## 🚀 Features

- **Decentralized Voting**: Secure and transparent voting system on Ethereum
- **Smart Contracts**: Built with Solidity and Hardhat
- **Frontend**: Modern React application with Vite
- **State Management**: Redux for efficient state handling
- **Decentralized Storage**: IPFS integration with Pinata
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Production Ready**: Configured for deployment on Vercel and Sepolia testnet

## 📋 Prerequisites

- [Bun](https://bun.sh/) for frontend (v1.0 or higher)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Hardhat](https://hardhat.org/) for blockchain development
- [MetaMask](https://metamask.io/) for blockchain interactions
- [Pinata API Key](https://pinata.cloud/) for IPFS storage

## � Quick Start

### Local Development (Step by Step)

1. **Clone and Setup**
```bash
git clone https://github.com/arslan-ahm/blockchain-voting-dapp-FYP.git
cd blockchain-voting-dapp-FYP
bun run setup
```

2. **Configure Environment**
```bash
# Edit .env (blockchain configuration)
# Add your values or use defaults for development

# Edit frontend/.env.local (frontend configuration)
# Add your Pinata API keys for IPFS storage
```

3. **Start Development**
```bash
# Run these commands in sequence (3 terminals)

# Terminal 1: Start blockchain
bun run server

# Terminal 2: Deploy contracts
bun run deploy:local-save

# Terminal 3: Start frontend
cd frontend && bun run dev
```

**Or use the one-command approach:**
```bash
bun run dev  # Starts everything automatically
```

### Production Deployment (Step by Step)

1. **Configure Production Environment**
```bash
# Update .env with production values
DEPLOYER_PRIVATE_KEY=your_wallet_private_key
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
ADMIN_ADDRESS_PROD=0xFb6131fa30594c79e75bed4C4ab3E870c12D8323
NODE_ENV=production

# Update frontend/.env.local with production values
VITE_NODE_ENV=production
VITE_NETWORK_NAME=sepolia
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
VITE_ADMIN_WALLET_ADDRESS=0xFb6131fa30594c79e75bed4C4ab3E870c12D8323
# Add your Pinata credentials
```

2. **Deploy Smart Contract**
```bash
bun run validate        # Check configuration
bun run deploy:sepolia  # Deploy to Sepolia testnet
```

3. **Deploy Frontend to Vercel**
```bash
# Method 1: Automatic (Recommended)
git push origin main    # Auto-deploys via Vercel

# Method 2: Manual
# 1. Connect GitHub repo to Vercel
# 2. Set build command: cd frontend && bun run build
# 3. Set output directory: frontend/dist
# 4. Add environment variables in Vercel dashboard
# 5. Deploy
```

## � Essential Commands

### Development
```bash
bun run setup           # Initial setup
bun run dev             # Start everything
bun run server          # Start blockchain only
bun run deploy:local-save  # Deploy contracts locally
cd frontend && bun run dev  # Start frontend only
```

### Production
```bash
bun run validate        # Validate environment
bun run deploy:sepolia  # Deploy to Sepolia
bun run deploy:mainnet  # Deploy to mainnet
bun run verify:sepolia  # Verify contract
```

### Utilities
```bash
bun run compile         # Compile contracts
bun run test            # Run tests
bun run clean           # Clean build files
```

## 📋 Environment Configuration

### Required Environment Variables

**Root `.env` file:**
```env
# Wallet private key for deploying contracts
DEPLOYER_PRIVATE_KEY=your_wallet_private_key

# Infura Project ID for blockchain connection
INFURA_PROJECT_ID=your_infura_project_id

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Admin addresses (DO NOT CHANGE for production)
ADMIN_ADDRESS_PROD=0xFb6131fa30594c79e75bed4C4ab3E870c12D8323
ADMIN_ADDRESS_DEV=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

NODE_ENV=development
```

**Frontend `frontend/.env.local` file:**
```env
# Network settings
VITE_NODE_ENV=development
VITE_NETWORK_NAME=localhost
VITE_CHAIN_ID=31337
VITE_RPC_URL=http://127.0.0.1:8545

# Contract address (updated after deployment)
VITE_VOTING_CONTRACT_ADDRESS=your_contract_address

# Admin wallet address
VITE_ADMIN_WALLET_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Pinata IPFS credentials
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_API_SECRET=your_pinata_api_secret
VITE_PINATA_JWT_TOKEN=your_pinata_jwt

# App info
VITE_APP_NAME=Blockchain Voting DApp
VITE_APP_VERSION=1.0.0
```

## 🚀 Production Deployment

### Step 1: Prepare Environment
```bash
# Update .env with production values
DEPLOYER_PRIVATE_KEY=your_production_wallet_private_key
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
ADMIN_ADDRESS_PROD=0xFb6131fa30594c79e75bed4C4ab3E870c12D8323
NODE_ENV=production

# Update frontend/.env.local with production values
VITE_NODE_ENV=production
VITE_NETWORK_NAME=sepolia
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
VITE_ADMIN_WALLET_ADDRESS=0xFb6131fa30594c79e75bed4C4ab3E870c12D8323
```

### Step 2: Deploy Smart Contract
```bash
bun run validate        # Verify configuration
bun run deploy:sepolia  # Deploy to Sepolia testnet
bun run verify:sepolia  # Verify on Etherscan (optional)
```

### Step 3: Deploy Frontend
```bash
# Push to GitHub (triggers auto-deployment)
git add .
git commit -m "Production deployment"
git push origin main
```

### Step 4: Configure Vercel
1. Go to [Vercel Dashboard](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Build Command**: `cd frontend && bun run build`
   - **Output Directory**: `frontend/dist`
4. Add environment variables (same as frontend/.env.local)
5. Deploy

## 🔧 Available Scripts

### Development
```bash
bun run setup           # Initial project setup
bun run dev             # Start everything (blockchain + frontend)
bun run server          # Start blockchain only
bun run deploy:local-save  # Deploy contracts locally
cd frontend && bun run dev  # Start frontend only
```

### Production
```bash
bun run validate        # Validate environment
bun run deploy:sepolia  # Deploy to Sepolia testnet
bun run deploy:mainnet  # Deploy to mainnet
bun run verify:sepolia  # Verify contract on Sepolia
```

### Utilities
```bash
bun run compile         # Compile smart contracts
bun run test            # Run contract tests
bun run clean           # Clean build artifacts
bun run install-all     # Install all dependencies
```

## 🐛 Troubleshooting

### Common Issues & Solutions

**Contract deployment fails:**
```bash
# Check configuration and retry
bun run validate
bun run deploy:local-save
```

**Frontend won't start:**
```bash
# Check if contract is deployed
bun run deploy:local-save
# Update contract address in frontend/.env.local
```

**Build errors:**
```bash
# Clean and rebuild
bun run clean
bun run compile
cd frontend && bun run build
```

**Wallet connection issues:**
- Ensure MetaMask is on the correct network
- Check RPC URL in environment variables
- Verify contract address is correct

## 🌐 Networks

- **Local**: Hardhat Network (Chain ID: 31337)
- **Testnet**: Sepolia (Chain ID: 11155111)
- **Mainnet**: Ethereum (Chain ID: 1)

## 📋 Admin Addresses

- **Production**: `0xFb6131fa30594c79e75bed4C4ab3E870c12D8323`
- **Development**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact & Support

- Create an issue for bug reports, features, or questions
- Star the repository if you find it useful
- Fork the repository to contribute

---

<div align="center">
Made with ❤️ by the <a href="https://github.com/arslan-ahm">ARslan Ahmad</a>
</div>
</div>
