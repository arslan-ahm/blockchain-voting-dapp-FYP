
<h1 align="center"> 🏛️ Decentralized Blockchain Voting DApp</h1>

<div align="center">

<!-- <img src="assets/blockchain-voting-logo.png" alt="Blockchain Voting DApp Logo" style="max-width: 100%; width: 300px;"> -->

A decentralized voting application built on blockchain technology, providing secure and transparent voting solutions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum-blue)](https://ethereum.org)
[![Frontend](https://img.shields.io/badge/Frontend-React%20Vite-orange)](https://vitejs.dev)
[![Backend](https://img.shields.io/badge/Backend-Hardhat%20Solidity-green)](https://hardhat.org)

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

## 📋 Prerequisites

- [Bun](https://bun.sh/) for frontend (v1.0 or higher)
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Hardhat](https://hardhat.org/) for blockchain development
- [MetaMask](https://metamask.io/) for blockchain interactions
- [Pinata API Key](https://pinata.cloud/) for IPFS storage

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/arslan-ahm/blockchain-voting-dapp-FYP.git
cd blockchain-voting-dapp-FYP
```

### 2. Install Dependencies
```bash
# Install backend dependencies
bun install

# Install frontend dependencies
cd frontend
bun install
```

### 3. Compile Smart Contracts
```bash
bun run compile
```
> Move **Voting.json** from `artifacts/contracts/Voting.sol/Voting.json` to `/frontend/src/constants/`

## 🚀 Development

### Running the Frontend
```bash
# Start the frontend development server
bun run dev
```

### Running the Backend
```bash
# Start the Hardhat node
bun run server

# (In new terminal)
bun run deploy:local
```

### Start Project
> Copy **contract address** after `bun run deploy:local`, and add it to `frontend/.env`

> Also write **admin address** in `frontend/.env`

## 🏗️ Project Structure

```
.
├── contracts/          # Smart contracts
├── frontend/           # React frontend application
├── scripts/            # Deployment and utility scripts
├── tests/              # Test files
└── README.md
```

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
