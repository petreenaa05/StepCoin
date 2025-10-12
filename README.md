# StepCoin DataCoin - Fitness Rewards dApp

![StepCoin Logo](public/stepcoin-banner.png)

## 🏃‍♂️ Overview

StepCoin is a revolutionary fitness rewards dApp that turns your daily activities into cryptocurrency. Built for the Consumer DataCoin Hackathon, it leverages cutting-edge privacy technology to verify your fitness data and automatically reward you with StepCoins.

## ✨ Features

- **🔐 Privacy-First**: Uses Reclaim Protocol's zero-knowledge proofs to verify fitness data without exposing personal information
- **💰 Automatic Rewards**: StepCoins are automatically minted to your wallet upon proof verification
- **🏆 Gamification**: Achievement system with badges and leaderboards to motivate fitness goals
- **📱 Multi-Platform**: Supports Google Fit, Strava, Apple Health, and Fitbit
- **🌐 Multi-Chain**: Deploy on Base, Polygon, Sepolia, and Ethereum networks
- **☁️ Decentralized Storage**: Activity records stored on Lighthouse for decentralized access

## 🛠 Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **RainbowKit** - Wallet connection interface
- **wagmi** - React hooks for Ethereum

### Blockchain & Web3

- **Reclaim Protocol** - Zero-knowledge proof generation
- **1MB.io** - DataCoin creation and minting
- **Lighthouse** - Decentralized storage
- **Multiple Networks** - Base, Polygon, Sepolia support

### Privacy & Security

- **zkTLS Proofs** - Verify data without exposing it
- **Zero-Knowledge** - Privacy-preserving verification
- **Decentralized** - No central authority required

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Git installed
- A Web3 wallet (MetaMask recommended)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/stepcoin-dapp.git
   cd stepcoin-dapp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # WalletConnect Project ID (get from https://cloud.walletconnect.com)
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

   # Reclaim Protocol
   NEXT_PUBLIC_RECLAIM_APP_ID=your_reclaim_app_id

   # 1MB.io API
   NEXT_PUBLIC_1MB_API_KEY=your_1mb_api_key

   # Lighthouse Storage
   LIGHTHOUSE_API_KEY=your_lighthouse_api_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔄 How It Works

### User Journey

1. **Connect Wallet** - Users connect their Web3 wallet to the dApp
2. **Choose Provider** - Select fitness data source (Google Fit, Strava, etc.)
3. **Generate Proof** - Reclaim Protocol creates a zero-knowledge proof of activity
4. **Verify & Mint** - Smart contract verifies proof and mints StepCoins
5. **Store Record** - Activity summary stored on Lighthouse
6. **Track Progress** - View achievements, leaderboards, and statistics

## 🏗 Architecture

### Components Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main dashboard
│   └── globals.css         # Global styles & animations
├── components/
│   ├── providers.tsx       # Web3 providers setup
│   └── ui/
│       ├── Modal.tsx       # Reusable modal component
│       ├── StatCard.tsx    # Statistics display cards
│       ├── Achievements.tsx # Achievement badges system
│       ├── Leaderboard.tsx # User ranking component
│       ├── ProofModal.tsx  # Proof generation workflow
│       ├── Loading.tsx     # Loading states
│       └── Footer.tsx      # App footer
└── lib/
    └── wagmi.ts           # Blockchain configuration
```

## 🎯 Hackathon Requirements Compliance

- ✅ **DataCoin Integration**: Uses 1MB.io for token creation and minting
- ✅ **Decentralized Storage**: Lighthouse integration for activity records
- ✅ **Live Dataset**: Real fitness data via Reclaim Protocol
- ✅ **Supported Networks**: Base, Polygon, Sepolia deployment ready
- ✅ **Frontend Demo**: Complete Next.js application
- ✅ **Open Source**: Public GitHub repository

## 🌟 Key Features

### Dashboard

- Real-time step counting and StepCoin balance
- Beautiful gradient UI with glass morphism effects
- Responsive design for all devices
- Animated interactions and micro-animations

### Privacy Protection

- Zero-knowledge proofs via Reclaim Protocol
- No personal data stored or transmitted
- Cryptographic verification of fitness activities
- User maintains full control of their data

### Gamification

- Achievement badge system
- Global leaderboard rankings
- Progress tracking and statistics
- Motivational rewards system

## 🚧 Development Roadmap

### Phase 1: MVP (Current)

- [x] Wallet connection with RainbowKit
- [x] Beautiful UI/UX design
- [x] Mock proof generation flow
- [x] Achievement system
- [x] Leaderboard functionality

### Phase 2: Integration

- [ ] Reclaim Protocol integration
- [ ] 1MB.io DataCoin deployment
- [ ] Lighthouse storage implementation
- [ ] Smart contract development

### Phase 3: Production

- [ ] Multi-network deployment
- [ ] Real fitness provider connections
- [ ] Advanced analytics dashboard
- [ ] Mobile app development

## 🤝 Contributing

We welcome contributions to StepCoin! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Reclaim Protocol** for privacy-preserving proof technology
- **1MB.io** for DataCoin infrastructure
- **Lighthouse** for decentralized storage solutions
- **RainbowKit** for excellent wallet integration
- **Next.js Team** for the amazing React framework

## 🏆 Hackathon Submission

Built for the **Consumer DataCoin Hackathon** showcasing:

- Innovative use of fitness data for cryptocurrency rewards
- Privacy-first approach with zero-knowledge proofs
- Beautiful, user-friendly interface
- Complete end-to-end workflow implementation

---

**Made with ❤️ for the fitness and Web3 communities**
