#!/bin/bash

# Complete deployment script for production
echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    if [ -z "$SEPOLIA_RPC_URL" ]; then
        print_error "SEPOLIA_RPC_URL not set"
        exit 1
    fi
    
    if [ -z "$PRIVATE_KEY" ]; then
        print_error "PRIVATE_KEY not set"
        exit 1
    fi
    
    if [ -z "$ETHERSCAN_API_KEY" ]; then
        print_warning "ETHERSCAN_API_KEY not set - contract verification will be skipped"
    fi
    
    print_success "Environment variables check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    if [ -f "package.json" ]; then
        npm install
        print_success "Root dependencies installed"
    fi
    
    # Install frontend dependencies
    if [ -f "frontend/package.json" ]; then
        cd frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed"
    fi
}

# Compile contracts
compile_contracts() {
    print_status "Compiling smart contracts..."
    npx hardhat compile
    
    if [ $? -eq 0 ]; then
        print_success "Contracts compiled successfully"
    else
        print_error "Contract compilation failed"
        exit 1
    fi
}

# Deploy to Sepolia
deploy_contracts() {
    print_status "Deploying contracts to Sepolia testnet..."
    npx hardhat run scripts/deploy-sepolia.js --network sepolia
    
    if [ $? -eq 0 ]; then
        print_success "Contracts deployed successfully"
    else
        print_error "Contract deployment failed"
        exit 1
    fi
}

# Verify contracts
verify_contracts() {
    if [ -n "$ETHERSCAN_API_KEY" ]; then
        print_status "Verifying contracts on Etherscan..."
        npx hardhat run scripts/verify-sepolia.js --network sepolia
        
        if [ $? -eq 0 ]; then
            print_success "Contracts verified successfully"
        else
            print_warning "Contract verification failed - but deployment continues"
        fi
    else
        print_warning "Skipping contract verification - ETHERSCAN_API_KEY not set"
    fi
}

# Build frontend
build_frontend() {
    print_status "Building frontend for production..."
    cd frontend
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Frontend built successfully"
        cd ..
    else
        print_error "Frontend build failed"
        cd ..
        exit 1
    fi
}

# Deploy to Vercel (if Vercel CLI is available)
deploy_frontend() {
    if command -v vercel &> /dev/null; then
        print_status "Deploying frontend to Vercel..."
        cd frontend
        vercel --prod
        
        if [ $? -eq 0 ]; then
            print_success "Frontend deployed to Vercel successfully"
            cd ..
        else
            print_warning "Vercel deployment failed - deploy manually"
            cd ..
        fi
    else
        print_warning "Vercel CLI not found - deploy frontend manually"
        print_status "Manual deployment steps:"
        echo "1. cd frontend"
        echo "2. vercel --prod"
        echo "3. Follow Vercel prompts"
    fi
}

# Main execution
main() {
    echo "🎯 Production Deployment Script"
    echo "================================"
    
    check_env_vars
    install_dependencies
    compile_contracts
    deploy_contracts
    verify_contracts
    build_frontend
    deploy_frontend
    
    echo ""
    print_success "🎉 Deployment completed!"
    
    # Show deployment summary
    if [ -f "deployments/sepolia.json" ]; then
        echo ""
        print_status "📋 Deployment Summary:"
        echo "Contract deployed on Sepolia testnet"
        
        # Extract contract address from deployment file
        CONTRACT_ADDRESS=$(node -pe "JSON.parse(require('fs').readFileSync('deployments/sepolia.json', 'utf8')).contractAddress")
        echo "Contract Address: $CONTRACT_ADDRESS"
        echo "Explorer: https://sepolia.etherscan.io/address/$CONTRACT_ADDRESS"
        
        echo ""
        print_status "📝 Next Steps:"
        echo "1. Verify environment variables are set in Vercel dashboard"
        echo "2. Test the deployed application"
        echo "3. Monitor contract interactions on Etherscan"
    fi
}

# Run main function
main
