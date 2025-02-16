# DAIOS - Decentralized AI Organization System

DAIOS is a modern web3 platform that combines decentralized autonomous organizations (DAOs) with AI capabilities, built on the T3 Stack and Ethereum blockchain.

## 🌟 Features

- **Smart Contract Integration**: Create and manage DAOs using Ethereum smart contracts
- **AI-Powered Chat**: Integrated AI chat system for DAO management and decision making
- **Web3 Authentication**: Secure wallet-based authentication using Web3Modal
- **Modern UI**: Beautiful and responsive interface built with Next.js 15 and Tailwind CSS
- **Type Safety**: End-to-end type safety with TypeScript

## 🚀 Tech Stack

- **Frontend**:

  - Next.js 15 (App Router)
  - React 18
  - Tailwind CSS
  - shadcn/ui components
  - Framer Motion for animations
  - Web3Modal for wallet connections

- **Blockchain**:

  - Wagmi for Ethereum interactions
  - Viem for Ethereum data handling
  - Custom Solidity smart contracts

- **AI & Backend**:
  - OpenAI integration
  - Next.js API routes
  - Environment variable management with T3 Env

## 📦 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git
- Foundry (for smart contract development)
- MetaMask or any Web3 wallet
- OpenAI API key

## 🛠 Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/daios.git
   cd daios
   ```

2. **Install dependencies**

   ```bash
   # Install main project dependencies
   npm install

   # Install and update smart contract dependencies
   cd contracts
   forge install
   ```

3. **Environment Setup**

   ```bash
   # Copy the example env file
   cp .env.example .env

   # Fill in required environment variables:
   # - AUTH_SECRET (generate with: npx auth secret)
   # - AUTH_DISCORD_ID and AUTH_DISCORD_SECRET (from Discord Developer Portal)
   # - Other required variables for your deployment
   ```

4. **Smart Contract Setup**
   ```bash
   cd contracts
   forge build
   ```

## 🏃‍♂️ Development

1. **Start the development server**

   ```bash
   npm run dev
   ```

2. **Run smart contract tests**

   ```bash
   cd contracts
   forge test
   ```

3. **Code Quality**

   ```bash
   # Type checking
   npm run typecheck

   # Linting
   npm run lint

   # Format code
   npm run format:write
   ```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check
- `npm run format:write` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🌐 Deployment

1. **Frontend**

   - Deploy to Vercel (recommended)
   - Or follow deployment guides for [Netlify](https://create.t3.gg/en/deployment/netlify) or [Docker](https://create.t3.gg/en/deployment/docker)

2. **Smart Contracts**
   - Deploy using Foundry to your chosen network
   - Update contract addresses in the frontend configuration

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [T3 Stack](https://create.t3.gg/)
- [OpenZeppelin](https://www.openzeppelin.com/) for smart contract libraries
- [shadcn/ui](https://ui.shadcn.com/) for UI components
