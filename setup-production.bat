@echo off
echo 🚀 Blockchain Voting System - Quick Production Setup
echo ====================================================
echo.

REM Check if .env exists
if not exist .env (
    echo [INFO] Creating .env file from example...
    copy .env.example .env >nul 2>&1
    echo [SUCCESS] .env file created
    echo [WARNING] Please edit .env file with your actual values
    echo.
)

REM Check if frontend .env.production exists
if not exist frontend\.env.production (
    echo [INFO] Creating frontend .env.production file...
    copy frontend\.env.example frontend\.env.production >nul 2>&1
    echo [SUCCESS] Frontend .env.production file created
    echo [WARNING] Please edit frontend/.env.production with your actual values
    echo.
)

echo [INFO] Environment files ready. Next steps:
echo.
echo 1. Edit .env file with your values:
echo    - SEPOLIA_RPC_URL (get from Infura)
echo    - PRIVATE_KEY (your wallet private key)
echo    - ETHERSCAN_API_KEY (for contract verification)
echo    - ADMIN_ADDRESS (your admin wallet address)
echo    - PINATA_API_KEY and PINATA_SECRET_KEY
echo.
echo 2. Edit frontend/.env.production with your values:
echo    - VITE_INFURA_PROJECT_ID
echo    - VITE_ADMIN_ADDRESS
echo    - VITE_PINATA_API_KEY, VITE_PINATA_SECRET_KEY, VITE_PINATA_JWT
echo.
echo 3. Run deployment:
echo    npm run deploy:production
echo.
echo 4. Deploy frontend to Vercel:
echo    cd frontend
echo    vercel --prod
echo.

pause
