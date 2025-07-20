# Deployment Checklist

## Pre-Deployment Setup

### Environment Configuration
- [ ] Copy `.env.example` to `.env` and configure all variables
- [ ] Copy `frontend/.env.example` to `frontend/.env.local` and configure all variables
- [ ] Verify admin address is set to `0xFb6131fa30594c79e75bed4C4ab3E870c12D8323` for production
- [ ] Ensure private key is for account with sufficient ETH for deployment
- [ ] Verify Infura project ID is active and has sufficient credits
- [ ] Test Pinata IPFS credentials are working

### Dependencies & Build
- [ ] Run `npm run install-all` to install dependencies
- [ ] Run `npm run compile` to compile smart contracts
- [ ] Run `npm run test` to ensure all tests pass
- [ ] Run `cd frontend && npm run build` to test frontend build
- [ ] Run `npm run validate` to check environment configuration

### Security Review
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Check no sensitive data is committed to git
- [ ] Confirm admin address is correct for production
- [ ] Review smart contract for security vulnerabilities
- [ ] Ensure proper access controls are in place

## Blockchain Deployment

### Sepolia Testnet
- [ ] Run `npm run deploy:sepolia` to deploy to Sepolia
- [ ] Verify contract deployment on Sepolia Etherscan
- [ ] Test admin functions work with production admin address
- [ ] Run `npm run verify:sepolia <CONTRACT_ADDRESS>` to verify contract source
- [ ] Update `VITE_CONTRACT_ADDRESS` in frontend environment

### Mainnet (Production)
- [ ] Complete thorough testing on Sepolia
- [ ] Run `npm run deploy:mainnet` to deploy to mainnet
- [ ] Verify contract deployment on Etherscan
- [ ] Run `npm run verify:mainnet <CONTRACT_ADDRESS>` to verify contract source
- [ ] Update production frontend environment variables

## Frontend Deployment

### Vercel Setup
- [ ] Connect GitHub repository to Vercel
- [ ] Configure build settings:
  - Build Command: `cd frontend && npm run build`
  - Output Directory: `frontend/dist`
  - Root Directory: `./`
- [ ] Add all required environment variables to Vercel
- [ ] Set `VITE_NODE_ENV=production`
- [ ] Set `VITE_NETWORK_NAME=sepolia` (or mainnet)
- [ ] Set correct `VITE_CONTRACT_ADDRESS`
- [ ] Deploy and test application

### Post-Deployment Testing
- [ ] Test wallet connection on deployed site
- [ ] Verify contract address is correct
- [ ] Test admin functions work
- [ ] Test user registration process
- [ ] Test campaign creation and voting
- [ ] Test IPFS uploads work correctly
- [ ] Check all environment variables are loaded

## Monitoring & Maintenance

### Initial Monitoring
- [ ] Monitor contract transactions on Etherscan
- [ ] Check frontend logs in Vercel dashboard
- [ ] Test application performance
- [ ] Monitor gas usage and costs
- [ ] Check IPFS uploads are working

### Documentation
- [ ] Update README with production URLs
- [ ] Document admin procedures
- [ ] Create user guide
- [ ] Set up monitoring alerts
- [ ] Plan backup and recovery procedures

## Rollback Plan

### Emergency Procedures
- [ ] Document rollback procedures
- [ ] Keep previous deployment artifacts
- [ ] Have admin access to pause contracts if needed
- [ ] Monitor for any issues in first 24 hours
- [ ] Have contact information for immediate support

## Success Criteria

### Deployment Success
- [ ] Smart contract deployed and verified
- [ ] Frontend accessible and functional
- [ ] Admin can manage campaigns
- [ ] Users can register and vote
- [ ] All security measures in place
- [ ] Performance meets requirements

### Sign-off
- [ ] Development team approval
- [ ] Security review completed
- [ ] Admin training completed
- [ ] Documentation updated
- [ ] Monitoring in place
- [ ] Ready for production use

---

**Note**: This checklist should be completed for each deployment. Keep a record of deployment dates, contract addresses, and any issues encountered.
