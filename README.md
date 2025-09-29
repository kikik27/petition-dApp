# DeApp Vote 🗳️

A decentralized voting application built with [RainbowKit](https://rainbowkit.com), [wagmi](https://wagmi.sh), and [Next.js](https://nextjs.org/). This dApp enables secure, transparent, and immutable voting on the Ethereum blockchain.

## Features

- 🔐 **Secure Wallet Connection** - Connect using various Ethereum wallets through RainbowKit
- 🗳️ **Decentralized Voting** - Cast votes directly on the blockchain
- 📊 **Real-time Results** - View voting results in real-time
- 🎨 **Modern UI** - Built with Tailwind CSS and Shadcn/ui components
- ⚡ **Fast Development** - Powered by Next.js with Turbopack

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Blockchain**: Ethereum, wagmi, viem
- **Wallet**: RainbowKit for wallet connections
- **Styling**: Tailwind CSS, Shadcn/ui components
- **State Management**: TanStack Query

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MetaMask or other Ethereum wallet

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd deapp-vote
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── pages/
│   ├── index.tsx      # Home page
│   ├── vote/          # Voting interface
│   └── _app.tsx       # App configuration
├── components/
│   └── ui/            # Reusable UI components
├── lib/
│   └── utils.ts       # Utility functions
└── styles/            # Global styles
```

## Usage

1. **Connect Wallet**: Click the connect button to link your Ethereum wallet
2. **Browse Proposals**: View active voting proposals on the main page
3. **Cast Vote**: Navigate to the voting page to cast your vote
4. **View Results**: See real-time voting results and participation stats

## Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server

## Learn More

### Blockchain Development
- [wagmi Documentation](https://wagmi.sh) - Learn how to interact with Ethereum
- [viem Documentation](https://viem.sh) - TypeScript Interface for Ethereum
- [RainbowKit Documentation](https://rainbowkit.com) - Wallet connection flows

### Frontend Development
- [Next.js Documentation](https://nextjs.org/docs) - Learn Next.js features
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Re-usable components

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

## License

This project is open source and available under the [MIT License](LICENSE).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
