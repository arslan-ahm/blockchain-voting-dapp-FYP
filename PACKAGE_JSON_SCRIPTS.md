# Package.json Scripts to Add

Add these scripts to your package.json file:

```json
{
  "scripts": {
    "check:account": "npx hardhat run scripts/check-deployment-account.js --network sepolia",
    "check:balance": "npx hardhat run scripts/check-sepolia-balance.js --network sepolia",
    "check:all": "npx hardhat run scripts/check-all-accounts.js --network sepolia",
    "verify:account": "npx hardhat run scripts/verify-account.js --network sepolia",
    "deploy:production": "node scripts/deploy-production.js",
    "deploy:sepolia": "npx hardhat run scripts/deploy-sepolia.js --network sepolia"
  }
}
```

Then you can use:
- `npm run check:account` - Check deployment account
- `npm run check:balance` - Check balance and gas cost
- `npm run check:all` - Check all configured accounts
- `npm run deploy:production` - Run full production deployment
- `npm run deploy:sepolia` - Deploy directly to Sepolia

Or with bun:
- `bun run check:account`
- `bun run deploy:production`
- etc.
