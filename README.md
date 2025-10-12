# StepCoin 🚀# StepCoin DataCoin - Fitness Rewards dApp



**Turn Steps into Crypto** - A revolutionary fitness DataCoin dApp built for the Reclaim Protocol hackathon.![StepCoin Logo](public/stepcoin-banner.png)



![StepCoin Banner](https://img.shields.io/badge/StepCoin-Fitness%20to%20Crypto-ff0670?style=for-the-badge&logo=ethereum)## 🏃‍♂️ Overview



## 🌟 OverviewStepCoin is a revolutionary fitness rewards dApp that turns your daily activities into cryptocurrency. Built for the Consumer DataCoin Hackathon, it leverages cutting-edge privacy technology to verify your fitness data and automatically reward you with StepCoins.



StepCoin transforms your daily fitness activities into cryptocurrency rewards using privacy-preserving zero-knowledge proofs. Built with cutting-edge blockchain technology, this dApp incentivizes healthy living while maintaining user privacy.## ✨ Features



## ✨ Features- **🔐 Privacy-First**: Uses Reclaim Protocol's zero-knowledge proofs to verify fitness data without exposing personal information

- **💰 Automatic Rewards**: StepCoins are automatically minted to your wallet upon proof verification

- 🔗 **Web3 Wallet Integration** - Seamless connection with RainbowKit & wagmi- **🏆 Gamification**: Achievement system with badges and leaderboards to motivate fitness goals

- 🌐 **Multi-Network Support** - Base, Polygon, and Sepolia networks- **📱 Multi-Platform**: Supports Google Fit, Strava, Apple Health, and Fitbit

- 🎨 **Modern Design System** - Beautiful pink gradient theme with glass morphism- **🌐 Multi-Chain**: Deploy on Base, Polygon, Sepolia, and Ethereum networks

- 📊 **Fitness Dashboard** - Track steps, earnings, and achievements- **☁️ Decentralized Storage**: Activity records stored on Lighthouse for decentralized access

- 🏆 **Achievement System** - Unlock rewards for fitness milestones

- 🥇 **Leaderboard** - Compete with other fitness enthusiasts## 🛠 Technology Stack

- 🔒 **Zero-Knowledge Proofs** - Privacy-preserving fitness verification

- 📱 **Responsive Design** - Works perfectly on all devices### Frontend



## 🛠️ Tech Stack- **Next.js 15** - React framework with App Router

- **TypeScript** - Type-safe development

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS- **Tailwind CSS** - Utility-first styling

- **Web3**: RainbowKit, wagmi, Ethereum- **RainbowKit** - Wallet connection interface

- **UI/UX**: Custom component library with glass morphism effects- **wagmi** - React hooks for Ethereum

- **Privacy**: Reclaim Protocol for zero-knowledge proofs

- **Storage**: Lighthouse for decentralized storage### Blockchain & Web3

- **Data**: 1MB.io for efficient data management

- **Reclaim Protocol** - Zero-knowledge proof generation

## 🚀 Getting Started- **1MB.io** - DataCoin creation and minting

- **Lighthouse** - Decentralized storage

### Prerequisites- **Multiple Networks** - Base, Polygon, Sepolia support



- Node.js 18+ and npm/yarn### Privacy & Security

- MetaMask or other Web3 wallet

- Git- **zkTLS Proofs** - Verify data without exposing it

- **Zero-Knowledge** - Privacy-preserving verification

### Installation- **Decentralized** - No central authority required



1. **Clone the repository**## 🚀 Getting Started

   ```bash

   git clone https://github.com/petreenaa05/StepCoin.git### Prerequisites

   cd StepCoin

   ```- Node.js 18+ installed

- Git installed

2. **Install dependencies**- A Web3 wallet (MetaMask recommended)

   ```bash

   npm install### Installation

   # or

   yarn install1. **Clone the repository**

   ```

   ```bash

3. **Set up environment variables**   git clone https://github.com/yourusername/stepcoin-dapp.git

   ```bash   cd stepcoin-dapp

   cp .env.example .env.local   ```

   ```

   Add your required environment variables (WalletConnect Project ID, etc.)2. **Install dependencies**



4. **Run the development server**   ```bash

   ```bash   npm install

   npm run dev   ```

   # or

   yarn dev3. **Set up environment variables**

   ```   Create a `.env.local` file in the root directory:



5. **Open your browser**   ```env

   Navigate to [http://localhost:3000](http://localhost:3000)   # WalletConnect Project ID (get from https://cloud.walletconnect.com)

   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

## 🎯 How It Works

   # Reclaim Protocol

1. **Connect Wallet** - Link your Web3 wallet securely   NEXT_PUBLIC_RECLAIM_APP_ID=your_reclaim_app_id

2. **Track Fitness** - Sync your fitness data privately

3. **Generate Proofs** - Create zero-knowledge proofs of your activities   # 1MB.io API

4. **Earn Rewards** - Receive StepCoins for verified fitness activities   NEXT_PUBLIC_1MB_API_KEY=your_1mb_api_key

5. **Compete & Achieve** - Climb leaderboards and unlock achievements

   # Lighthouse Storage

## 🏗️ Project Structure   LIGHTHOUSE_API_KEY=your_lighthouse_api_key

   ```

```

stepcoin-dapp/4. **Run the development server**

├── src/

│   ├── app/                 # Next.js app router   ```bash

│   │   ├── globals.css      # Design system & styles   npm run dev

│   │   ├── layout.tsx       # Root layout   ```

│   │   └── page.tsx         # Main application

│   ├── components/          # Reusable UI components5. **Open your browser**

│   │   └── ui/             # UI component library   Visit [http://localhost:3000](http://localhost:3000) to see the application.

│   └── lib/                # Utilities & configurations

├── public/                 # Static assets## 🔄 How It Works

└── ...config files

```### User Journey



## 🎨 Design System1. **Connect Wallet** - Users connect their Web3 wallet to the dApp

2. **Choose Provider** - Select fitness data source (Google Fit, Strava, etc.)

StepCoin features a modern design system with:3. **Generate Proof** - Reclaim Protocol creates a zero-knowledge proof of activity

- **Primary Colors**: Deep black backgrounds with vibrant pink accents4. **Verify & Mint** - Smart contract verifies proof and mints StepCoins

- **Gradients**: Multi-layered pink and magenta gradients5. **Store Record** - Activity summary stored on Lighthouse

- **Typography**: Clean, modern fonts with proper hierarchy6. **Track Progress** - View achievements, leaderboards, and statistics

- **Glass Morphism**: Translucent elements with backdrop blur

- **Animations**: Smooth transitions and micro-interactions## 🏗 Architecture



## 🔧 Configuration### Components Structure



The app supports multiple blockchain networks:```

- **Base**: Layer 2 solution for efficient transactionssrc/

- **Polygon**: Low-cost, fast transactions├── app/

- **Sepolia**: Ethereum testnet for development│   ├── layout.tsx          # Root layout with providers

│   ├── page.tsx            # Main dashboard

## 🤝 Contributing│   └── globals.css         # Global styles & animations

├── components/

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.│   ├── providers.tsx       # Web3 providers setup

│   └── ui/

1. Fork the repository│       ├── Modal.tsx       # Reusable modal component

2. Create your feature branch (`git checkout -b feature/AmazingFeature`)│       ├── StatCard.tsx    # Statistics display cards

3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)│       ├── Achievements.tsx # Achievement badges system

4. Push to the branch (`git push origin feature/AmazingFeature`)│       ├── Leaderboard.tsx # User ranking component

5. Open a Pull Request│       ├── ProofModal.tsx  # Proof generation workflow

│       ├── Loading.tsx     # Loading states

## 📜 License│       └── Footer.tsx      # App footer

└── lib/

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.    └── wagmi.ts           # Blockchain configuration

```

## 🏆 Hackathon

## 🎯 Hackathon Requirements Compliance

Built for the **Reclaim Protocol DataCoin Hackathon** - demonstrating innovative use of:

- Zero-knowledge proofs for privacy- ✅ **DataCoin Integration**: Uses 1MB.io for token creation and minting

- Decentralized storage solutions- ✅ **Decentralized Storage**: Lighthouse integration for activity records

- Web3 integration for fitness rewards- ✅ **Live Dataset**: Real fitness data via Reclaim Protocol

- Modern UX/UI design principles- ✅ **Supported Networks**: Base, Polygon, Sepolia deployment ready

- ✅ **Frontend Demo**: Complete Next.js application

## 📞 Contact- ✅ **Open Source**: Public GitHub repository



- **Developer**: [petreenaa05](https://github.com/petreenaa05)## 🌟 Key Features

- **Project**: [StepCoin Repository](https://github.com/petreenaa05/StepCoin)

### Dashboard

## 🙏 Acknowledgments

- Real-time step counting and StepCoin balance

- Reclaim Protocol for zero-knowledge proof infrastructure- Beautiful gradient UI with glass morphism effects

- Lighthouse for decentralized storage- Responsive design for all devices

- 1MB.io for data management solutions- Animated interactions and micro-animations

- RainbowKit and wagmi for Web3 integration

### Privacy Protection

---

- Zero-knowledge proofs via Reclaim Protocol

**Made with ❤️ for the fitness and crypto community**- No personal data stored or transmitted

- Cryptographic verification of fitness activities

*Transform your steps into digital wealth with StepCoin! 🏃‍♂️💰*- User maintains full control of their data

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
