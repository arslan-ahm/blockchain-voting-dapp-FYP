@echo off
REM Complete deployment script for production (Windows)
echo 🚀 Starting production deployment...

REM Check if required environment variables are set
echo [INFO] Checking environment variables...

if "%SEPOLIA_RPC_URL%"=="" (
    echo [ERROR] SEPOLIA_RPC_URL not set
    exit /b 1
)

if "%PRIVATE_KEY%"=="" (
    echo [ERROR] PRIVATE_KEY not set
    exit /b 1
)

if "%ETHERSCAN_API_KEY%"=="" (
    echo [WARNING] ETHERSCAN_API_KEY not set - contract verification will be skipped
)

echo [SUCCESS] Environment variables check passed

REM Install dependencies
echo [INFO] Installing dependencies...

if exist package.json (
    call npm install
    echo [SUCCESS] Root dependencies installed
)

if exist frontend\package.json (
    cd frontend
    call npm install
    cd ..
    echo [SUCCESS] Frontend dependencies installed
)

REM Compile contracts
echo [INFO] Compiling smart contracts...
call npx hardhat compile

if %errorlevel% neq 0 (
    echo [ERROR] Contract compilation failed
    exit /b 1
)
echo [SUCCESS] Contracts compiled successfully

REM Deploy to Sepolia
echo [INFO] Deploying contracts to Sepolia testnet...
call npx hardhat run scripts/deploy-sepolia.js --network sepolia

if %errorlevel% neq 0 (
    echo [ERROR] Contract deployment failed
    exit /b 1
)
echo [SUCCESS] Contracts deployed successfully

REM Verify contracts
if not "%ETHERSCAN_API_KEY%"=="" (
    echo [INFO] Verifying contracts on Etherscan...
    call npx hardhat run scripts/verify-sepolia.js --network sepolia
    
    if %errorlevel% neq 0 (
        echo [WARNING] Contract verification failed - but deployment continues
    ) else (
        echo [SUCCESS] Contracts verified successfully
    )
) else (
    echo [WARNING] Skipping contract verification - ETHERSCAN_API_KEY not set
)

REM Build frontend
echo [INFO] Building frontend for production...
cd frontend
call npm run build

if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed
    cd ..
    exit /b 1
)
echo [SUCCESS] Frontend built successfully
cd ..

REM Deploy to Vercel (if Vercel CLI is available)
where vercel >nul 2>nul
if %errorlevel% equ 0 (
    echo [INFO] Deploying frontend to Vercel...
    cd frontend
    call vercel --prod
    
    if %errorlevel% neq 0 (
        echo [WARNING] Vercel deployment failed - deploy manually
    ) else (
        echo [SUCCESS] Frontend deployed to Vercel successfully
    )
    cd ..
) else (
    echo [WARNING] Vercel CLI not found - deploy frontend manually
    echo [INFO] Manual deployment steps:
    echo 1. cd frontend
    echo 2. vercel --prod
    echo 3. Follow Vercel prompts
)

echo.
echo [SUCCESS] 🎉 Deployment completed!

REM Show deployment summary
if exist deployments\sepolia.json (
    echo.
    echo [INFO] 📋 Deployment Summary:
    echo Contract deployed on Sepolia testnet
    
    REM Read contract address from deployment file
    for /f "delims=" %%i in ('node -pe "JSON.parse(require('fs').readFileSync('deployments/sepolia.json', 'utf8')).contractAddress"') do set CONTRACT_ADDRESS=%%i
    echo Contract Address: %CONTRACT_ADDRESS%
    echo Explorer: https://sepolia.etherscan.io/address/%CONTRACT_ADDRESS%
    
    echo.
    echo [INFO] 📝 Next Steps:
    echo 1. Verify environment variables are set in Vercel dashboard
    echo 2. Test the deployed application
    echo 3. Monitor contract interactions on Etherscan
)

pause
