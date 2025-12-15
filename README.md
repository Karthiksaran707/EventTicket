# EventChain - Decentralized Event Ticketing Platform

A modern, blockchain-powered event ticketing platform built with React, TypeScript, and Ethereum smart contracts. EventChain allows organizers to create events and sell NFT-based tickets, while attendees can purchase, transfer, and manage their tickets securely on the blockchain.

## 🚀 Features

### For Event Organizers
- **Create Events**: Set up events with detailed information, pricing, and capacity
- **NFT Tickets**: Issue unique, transferable NFT tickets for each purchase
- **Real-time Analytics**: Track ticket sales, revenue, and event performance
- **Flexible Refunds**: Choose between auto-refund or buyer-claim refund modes
- **Dashboard**: Comprehensive organizer dashboard with sales metrics

### For Attendees
- **Browse Events**: Discover events with advanced filtering and search
- **Secure Purchases**: Buy tickets using cryptocurrency with instant NFT minting
- **Seat Selection**: Interactive seat maps for venue-based events
- **NFT Ownership**: Tickets are stored as ERC-721 NFTs in your wallet
- **Transferable**: Resell or transfer tickets on secondary markets

### Technical Features
- **Smart Contracts**: Solidity-based contracts using OpenZeppelin standards
- **Wallet Integration**: MetaMask and other Web3 wallet support
- **Responsive Design**: Mobile-first design with dark/light theme support
- **Real-time Updates**: Live event status and ticket availability
- **Gas Optimization**: Efficient contract design for cost-effective transactions

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Recharts** - Data visualization for analytics
- **Ethers.js** - Ethereum blockchain interaction

### Backend (Smart Contracts)
- **Solidity 0.8.20** - Smart contract language
- **Hardhat** - Ethereum development environment
- **OpenZeppelin** - Battle-tested smart contract libraries
- **ERC-721** - NFT standard for tickets

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Hardhat Testing** - Contract testing framework

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension (for wallet interaction)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd eventchain
```

### 2. Install Dependencies
```bash
# Install root dependencies (Hardhat)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
# For Sepolia deployment (optional)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_without_0x_prefix
ETHERSCAN_API_KEY=your_etherscan_api_key

# For Mainnet deployment (optional)
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
```

### 4. Start the Development Environment

#### Option A: Local Development (Recommended)
```bash
# Terminal 1: Start Hardhat local blockchain
npm run node

# Terminal 2: Start frontend development server
cd frontend
npm run dev
```

#### Option B: Deploy to Testnet
```bash
# Deploy contracts to Sepolia testnet
npm run deploy:sepolia

# Update frontend/src/deployments/EventTicket.json with deployment info
# Then start frontend
cd frontend
npm run dev
```

### 5. Access the Application
Open your browser and navigate to: **http://localhost:3005**

## 📖 Usage Guide

### Creating an Event
1. Connect your wallet using MetaMask
2. Navigate to the Admin Panel
3. Fill in event details (name, date, location, price, capacity)
4. Set refund mode (Auto-Refund or Buyer-Claim)
5. Submit the event creation transaction

### Purchasing Tickets
1. Browse available events on the home page
2. Click "View Seats" on an event
3. Select your preferred seat from the interactive map
4. Confirm purchase and approve the transaction
5. Receive your NFT ticket in your wallet

### Managing Events (Organizers)
1. Access the Organizer Dashboard
2. View sales analytics and revenue
3. Cancel events if needed (with refund processing)
4. Withdraw accumulated funds

## 🏗️ Project Structure

```
eventchain/
├── contracts/                 # Solidity smart contracts
│   └── EventTicket.sol       # Main event ticketing contract
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React context providers
│   │   ├── utils/           # Utility functions and contract interactions
│   │   ├── types/           # TypeScript type definitions
│   │   └── styles/          # CSS and styling
│   └── public/              # Static assets
├── scripts/                  # Deployment and utility scripts
├── test/                     # Smart contract tests
├── artifacts/               # Compiled contract artifacts
├── cache/                   # Hardhat compilation cache
└── typechain-types/         # Generated TypeScript types
```

## 🧪 Testing

### Smart Contract Tests
```bash
npm test
```

### Frontend Testing
```bash
cd frontend
npm run build  # Check for build errors
npm run lint   # Check code quality
```

## 🚢 Deployment

### Local Development
```bash
npm run node          # Start local Hardhat network
npm run deploy:local  # Deploy to localhost
```

### Testnet Deployment
```bash
npm run deploy:sepolia  # Deploy to Sepolia testnet
npm run verify:sepolia  # Verify contract on Etherscan
```

### Production Deployment
```bash
npm run deploy:mainnet  # Deploy to Ethereum mainnet
```

## 🔧 Configuration

### Hardhat Configuration
- **Network**: Localhost (8545), Sepolia, Mainnet
- **Solidity**: Version 0.8.20 with optimization
- **Gas**: 200 gwei gas price for testnet deployments

### Frontend Configuration
- **Port**: 3005 (development)
- **Build**: Optimized production builds
- **PWA**: Service worker for offline functionality

---

**EventChain** - Bringing transparency and security to event ticketing through blockchain technology.
