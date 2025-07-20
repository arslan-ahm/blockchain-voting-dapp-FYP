# Blockchain Voting DApp - Deployment Guide

This guide covers deploying the Blockchain Voting DApp to production environments.

## 🚀 Quick Start

### Development Setup
```bash
# Install dependencies
npm run install-all

# Start local blockchain
npm run server

# Deploy to local network
npm run deploy:local-save

# Start frontend
cd frontend && npm run dev
```

### Production Deployment

#### 1. Environment Configuration

Create `.env` in the root directory:
```env
NODE_ENV=production
PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key

ADMIN_ADDRESS_PROD=0xFb6131fa30594c79e75bed4C4ab3E870c12D8323
ADMIN_ADDRESS_DEV=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

Create `frontend/.env.local`:
```env
VITE_NODE_ENV=production
VITE_NETWORK_NAME=sepolia
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_ADMIN_ADDRESS=0xFb6131fa30594c79e75bed4C4ab3E870c12D8323
VITE_BLOCK_EXPLORER=https://sepolia.etherscan.io

VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_API_SECRET=your_pinata_api_secret
VITE_PINATA_JWT=your_pinata_jwt

VITE_APP_NAME=Blockchain Voting DApp
VITE_APP_VERSION=1.0.0
```

#### 2. Deploy Smart Contract to Sepolia

```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Verify contract on Etherscan
npm run verify:sepolia DEPLOYED_CONTRACT_ADDRESS
```

#### 3. Deploy Frontend to Vercel

1. **Connect Repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
   - Root Directory: `./`

3. **Set Environment Variables in Vercel**
   ```
   VITE_NODE_ENV=production
   VITE_NETWORK_NAME=sepolia
   VITE_CHAIN_ID=11155111
   VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   VITE_CONTRACT_ADDRESS=your_deployed_contract_address
   VITE_ADMIN_ADDRESS=0xFb6131fa30594c79e75bed4C4ab3E870c12D8323
   VITE_BLOCK_EXPLORER=https://sepolia.etherscan.io
   VITE_PINATA_API_KEY=your_pinata_api_key
   VITE_PINATA_API_SECRET=your_pinata_api_secret
   VITE_PINATA_JWT=your_pinata_jwt
   VITE_APP_NAME=Blockchain Voting DApp
   VITE_APP_VERSION=1.0.0
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

## 🔧 Available Scripts

### Root Directory
- `npm run install-all` - Install dependencies for both root and frontend
- `npm run server` - Start local Hardhat node
- `npm run compile` - Compile smart contracts
- `npm run test` - Run smart contract tests
- `npm run clean` - Clean compiled artifacts
- `npm run deploy:local-save` - Deploy to local network and save config
- `npm run deploy:sepolia` - Deploy to Sepolia testnet
- `npm run deploy:mainnet` - Deploy to Ethereum mainnet
- `npm run verify:sepolia` - Verify contract on Sepolia Etherscan
- `npm run verify:mainnet` - Verify contract on Mainnet Etherscan
- `npm run dev` - Start both blockchain and frontend in development
- `npm run build` - Build both contracts and frontend
- `npm run start` - Start frontend in preview mode

### Frontend Directory
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run build:prod` - Build for production
- `npm run preview` - Preview production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts

## 🌐 Network Configuration

### Supported Networks
- **Local Development**: Hardhat Network (Chain ID: 31337)
- **Sepolia Testnet**: Ethereum Sepolia (Chain ID: 11155111)
- **Mainnet**: Ethereum Mainnet (Chain ID: 1)

### Admin Addresses
- **Production**: `0xFb6131fa30594c79e75bed4C4ab3E870c12D8323`
- **Development**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Private Keys**: Store private keys securely, never in code
3. **Admin Address**: Production admin address is hardcoded in deployment config
4. **API Keys**: Keep Pinata and Infura keys secure
5. **Smart Contract**: Verify contracts on Etherscan after deployment

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Private key for deployment account ready
- [ ] Infura project ID obtained
- [ ] Pinata IPFS credentials ready
- [ ] Etherscan API key for verification
- [ ] Admin address confirmed
- [ ] Smart contracts compiled and tested
- [ ] Frontend builds successfully
- [ ] All sensitive data excluded from git

## 🛠️ Troubleshooting

### Common Issues

1. **Contract Deployment Fails**
   - Check private key and network configuration
   - Ensure sufficient ETH for gas fees
   - Verify Infura project ID

2. **Frontend Build Fails**
   - Check all environment variables are set
   - Verify contract address is correct
   - Run `npm run type-check` for TypeScript errors

3. **Wallet Connection Issues**
   - Ensure MetaMask is connected to correct network
   - Check RPC URL is accessible
   - Verify contract address is deployed

### Support
For issues and questions, please check the documentation or create an issue in the repository.

## 🔄 Continuous Deployment

The project is configured for automatic deployment:
- **Smart Contracts**: Manual deployment to testnet/mainnet
- **Frontend**: Automatic deployment to Vercel on git push
- **Environment**: Separate configurations for dev/prod

## 📊 Monitoring

After deployment, monitor:
- Contract transactions on Etherscan
- Frontend performance on Vercel
- IPFS uploads on Pinata
- Gas usage and optimization opportunities
