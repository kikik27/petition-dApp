# Decentralized Petition Platform - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Smart Contract Integration](#smart-contract-integration)
5. [Key Features](#key-features)
6. [Data Flow](#data-flow)
7. [IPFS Integration](#ipfs-integration)
8. [User Experience](#user-experience)
9. [Security Considerations](#security-considerations)
10. [Development Setup](#development-setup)

---

## Overview

The Decentralized Petition Platform is a blockchain-based application that enables users to create, sign, and manage petitions in a transparent, immutable, and censorship-resistant manner. Built on the Base Sepolia testnet, this application leverages Web3 technology to ensure petition integrity and prevent tampering.

### Key Objectives
- **Transparency**: All petitions and signatures are recorded on-chain, providing full visibility
- **Immutability**: Once created, petitions cannot be altered or deleted
- **Decentralization**: No central authority controls the petition data
- **Verification**: Cryptographic signatures ensure authentic participation
- **Accessibility**: User-friendly interface for non-technical users

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer (Browser)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Next.js    │  │  React UI    │  │  Framer Motion      │  │
│  │   Frontend   │  │  Components  │  │  Animations         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Web3 Integration Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Wagmi v2   │  │   Viem v2    │  │  WalletConnect v2   │  │
│  │   Hooks      │  │   ABI Calls  │  │  Wallet Provider    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
┌──────────────────────────┐  ┌─────────────────────────┐
│   Blockchain Layer       │  │   Storage Layer         │
│  ┌──────────────────┐   │  │  ┌──────────────────┐  │
│  │  Base Sepolia    │   │  │  │  Pinata IPFS     │  │
│  │  Smart Contract  │   │  │  │  Metadata Storage│  │
│  │  (PetitionV2)    │   │  │  │  File Storage    │  │
│  └──────────────────┘   │  │  └──────────────────┘  │
└──────────────────────────┘  └─────────────────────────┘
```

### Component Architecture

```
src/
├── pages/                      # Next.js pages (routing)
│   ├── index.tsx              # Landing page
│   ├── petitions/
│   │   ├── index.tsx          # Petition list with hero section
│   │   ├── [id].tsx           # Petition detail page
│   │   └── create/
│   │       └── index.tsx      # Create petition page
│   └── api/                   # API routes for IPFS operations
│       └── ipfs/
│           ├── upload-petition.ts
│           ├── upload-file.ts
│           └── fetch.ts
│
├── components/                 # React components
│   ├── petition/
│   │   ├── create-petitionV2.tsx    # Multi-step petition creation
│   │   ├── petition-detail.tsx      # Petition details & signing
│   │   └── card-petition.tsx        # Petition card (futuristic design)
│   ├── ui/                    # Reusable UI components
│   └── global/                # Global components (toast, dialogs)
│
├── services/                   # Service layer
│   └── petition.ts            # Smart contract interaction logic
│
├── stores/                     # State management (Zustand)
│   ├── petition.ts            # Petition state & pagination
│   └── theme.ts               # Theme state
│
├── lib/                        # Utilities
│   ├── wagmi-config.ts        # Wagmi configuration
│   ├── wagmi-client.ts        # Viem client setup
│   ├── ipfs.ts                # IPFS helper functions
│   └── utils.ts               # General utilities & error handling
│
├── types/                      # TypeScript type definitions
│   ├── petition.ts
│   ├── ipfs.ts
│   └── index.ts
│
├── constants/                  # Application constants
│   ├── petition.ts            # Petition categories, states
│   └── index.tsx              # General constants
│
└── abi/                        # Smart contract ABIs
    ├── petitionV2.json
    ├── civicToken.json
    └── supportBadge.json
```

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.x | React framework with SSR, routing, and API routes |
| **React** | 18.x | UI library for component-based architecture |
| **TypeScript** | 5.x | Type-safe JavaScript for better DX |
| **Tailwind CSS** | 3.x | Utility-first CSS framework for styling |
| **Framer Motion** | 11.x | Animation library for smooth transitions |
| **Lucide React** | Latest | Icon library with 50+ icons |
| **date-fns** | 3.x | Date manipulation and formatting |

### Web3 Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Wagmi** | 2.x | React Hooks for Ethereum interactions |
| **Viem** | 2.38.0 | TypeScript library for Ethereum |
| **WalletConnect** | v2 | Wallet connection protocol |
| **Base Sepolia** | Testnet | Layer 2 blockchain network |

### State Management & Storage

| Technology | Purpose |
|------------|---------|
| **Zustand** | Lightweight state management |
| **Pinata IPFS** | Decentralized file storage |
| **NFT.Storage** | Alternative IPFS provider |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and formatting |
| **PostCSS** | CSS processing |
| **Git** | Version control |

---

## Smart Contract Integration

### Contract Details

- **Network**: Base Sepolia (Chain ID: 84532)
- **Contract Address**: `0xDCd408BC70846d274A7B3f5cF814C01589BfDCf2`
- **Contract Version**: PetitionV2
- **Language**: Solidity

### Key Contract Functions

#### Read Functions

```typescript
// Get all petitions (on-chain data only)
getAllPetitions() → IPetitionData[]

// Get petitions by category
getPetitionsByCategory(category: uint8) → IPetitionData[]

// Get petition by ID
getPetition(petitionId: uint256) → IPetitionData

// Get signatures for a petition
getSignatures(petitionId: uint256) → ISignature[]

// Check if user has signed
hasUserSigned(petitionId: uint256, userAddress: address) → bool
```

#### Write Functions

```typescript
// Create new petition
createPetition(
  metadataURI: string,
  category: uint8,
  targetSignatures: uint256,
  startDate: uint256,
  endDate: uint256,
  requiredDocuments: string[]
)

// Sign a petition
signPetition(
  petitionId: uint256,
  supportingDocumentsURI: string
)
```

### Contract Data Structure

```solidity
struct IPetitionData {
  uint256 id;              // Unique petition identifier
  address creator;         // Petition creator address
  string metadataURI;      // IPFS hash for petition metadata
  uint8 category;          // Category enum (0-10)
  uint256 targetSignatures; // Goal for signatures
  uint256 currentSignatures; // Current signature count
  uint256 startDate;       // Petition start timestamp
  uint256 endDate;         // Petition end timestamp
  uint8 state;             // State enum (0: Draft, 1: Active, 2: Closed)
  bool isActive;           // Quick active status check
  uint256 createdAt;       // Creation timestamp
}
```

### Petition Categories

| ID | Category | Icon | Use Case |
|----|----------|------|----------|
| 0 | SOCIAL | Users | Community and social issues |
| 1 | POLITICAL | Flag | Government and policy changes |
| 2 | ENVIRONMENTAL | Leaf | Climate and nature conservation |
| 3 | EDUCATION | GraduationCap | Academic and learning reforms |
| 4 | HEALTH | Heart | Healthcare and medical issues |
| 5 | HUMAN_RIGHTS | Scale | Justice and equality |
| 6 | ANIMAL_RIGHTS | Paw | Animal welfare |
| 7 | ECONOMIC | TrendingUp | Financial and economic matters |
| 8 | TECHNOLOGY | Cpu | Tech policy and digital rights |
| 9 | CULTURAL | Palette | Arts and cultural preservation |
| 10 | OTHER | Globe2 | Miscellaneous topics |

---

## Key Features

### 1. Petition Creation
- **Multi-step Form**: Guided petition creation process
- **Rich Text Editor**: Lexical editor with formatting support
- **File Upload**: Support for documents and images
- **Category Selection**: 11 predefined categories
- **Date Range**: Start and end date configuration
- **Target Goals**: Set signature targets
- **IPFS Storage**: Metadata and files stored on IPFS

### 2. Petition Browsing
- **Hero Section**: Real-time statistics dashboard
- **Category Filter**: Filter by 11 categories with icons
- **Pagination**: Load more functionality (9 per page)
- **Futuristic Design**: Gradient borders, glow effects
- **Date Status Badges**: Visual indicators (Not Started/Active/Ended)
- **Performance Optimization**: No IPFS fetch in list view

### 3. Petition Signing
- **One-Click Signing**: Sign with wallet authentication
- **Document Upload**: Optional supporting documents
- **Duplicate Prevention**: Smart contract prevents double signing
- **Transaction Status**: Real-time feedback during signing
- **Event Listening**: Automatic UI update on success

### 4. Error Handling
- **User-Friendly Messages**: Technical errors translated to plain language
- **Rejection Detection**: Graceful handling of wallet rejections
- **Loading States**: Clear feedback during transactions
- **Validation**: Form and smart contract validation

### 5. User Experience Enhancements
- **Smooth Animations**: Framer Motion for transitions
- **Responsive Design**: Mobile, tablet, and desktop support
- **Dark Theme**: Modern dark mode interface
- **Toast Notifications**: Non-intrusive feedback
- **Confirmation Dialogs**: Important action confirmations

---

## Data Flow

### Creating a Petition

```
User Input (Form)
    ↓
Client-Side Validation
    ↓
Upload Files to IPFS (via Pinata API)
    ↓
Generate Metadata JSON
    ↓
Upload Metadata to IPFS
    ↓
Get IPFS Hash (CID)
    ↓
Connect Wallet (WalletConnect)
    ↓
Call Smart Contract: createPetition(metadataURI, ...)
    ↓
User Confirms Transaction in Wallet
    ↓
Transaction Sent to Base Sepolia
    ↓
Wait for Confirmation
    ↓
Listen for PetitionCreated Event
    ↓
Update UI + Show Success Message
    ↓
Redirect to Petition Detail Page
```

### Signing a Petition

```
User Clicks "Sign Petition"
    ↓
Check if Already Signed
    ↓
(Optional) Upload Supporting Documents to IPFS
    ↓
Connect Wallet
    ↓
Call Smart Contract: signPetition(petitionId, documentsURI)
    ↓
User Confirms Transaction
    ↓
Transaction Sent to Blockchain
    ↓
Wait for Confirmation
    ↓
Listen for PetitionSigned Event
    ↓
Update Signature Count
    ↓
Show Success Toast
```

### Loading Petition List

```
User Visits Petition List Page
    ↓
Fetch Petitions from Smart Contract
    ↓
Use getAllPetitionsBasic() (No IPFS)
    ↓
Generate Placeholder Data:
  - Title: "{CATEGORY} Petition #{id}"
  - Image: Dicebear Avatar API
    ↓
Display Cards with On-Chain Data:
  - Signatures, Progress, Dates
    ↓
User Clicks "Load More"
    ↓
Fetch Next Page (Pagination)
    ↓
Append to Existing List
```

### Loading Petition Detail

```
User Clicks Petition Card
    ↓
Navigate to /petitions/[id]
    ↓
Fetch Petition from Smart Contract
    ↓
Get metadataURI from Contract
    ↓
Fetch Full Metadata from IPFS
    ↓
Parse JSON Metadata:
  - Title, Description, Images
  - Creator Info, Documents
    ↓
Fetch Signatures from Smart Contract
    ↓
Render Complete Petition View
```

---

## IPFS Integration

### Why IPFS?

IPFS (InterPlanetary File System) is used for decentralized storage because:
- **Decentralization**: No single point of failure
- **Immutability**: Content addressing ensures data integrity
- **Cost-Effective**: Reduces on-chain storage costs
- **Censorship-Resistant**: Distributed network prevents takedowns

### Storage Architecture

```
Smart Contract (On-Chain)
    ↓ (stores only)
IPFS Hash (CID) → "QmXxx..."
    ↓ (points to)
IPFS Network (Off-Chain)
    ↓ (contains)
Petition Metadata JSON
    ├── title
    ├── description
    ├── images[] (IPFS hashes)
    ├── documents[] (IPFS hashes)
    └── creator info
```

### Pinata Configuration

```typescript
// API Endpoints
PINATA_API_URL = "https://api.pinata.cloud"
PINATA_GATEWAY_URL = "https://red-fashionable-vole-313.myptinata.cloud"

// Authentication
PINATA_API_KEY = "290e997eda8a23d22a18"
PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Operations
- Upload File → POST /pinning/pinFileToIPFS
- Upload JSON → POST /pinning/pinJSONToIPFS
- Fetch Content → GET {gateway}/ipfs/{CID}
- Unpin → DELETE /pinning/unpin/{CID}
```

### Metadata Schema

```json
{
  "title": "Save the Amazon Rainforest",
  "description": "Petition to protect endangered forests...",
  "category": "ENVIRONMENTAL",
  "targetSignatures": 10000,
  "startDate": 1729800000,
  "endDate": 1732392000,
  "creator": {
    "address": "0x1234...",
    "name": "John Doe"
  },
  "images": [
    "QmAbC123...",
    "QmDeF456..."
  ],
  "documents": [
    {
      "name": "research-paper.pdf",
      "hash": "QmGhI789...",
      "size": 1048576
    }
  ],
  "requiredDocuments": [
    "ID Card",
    "Proof of Residence"
  ]
}
```

---

## User Experience

### Design Philosophy

1. **Futuristic Aesthetic**
   - Gradient borders and backgrounds
   - Glow effects instead of heavy shadows
   - Glass morphism for depth
   - Smooth animations and transitions

2. **Intuitive Navigation**
   - Clear visual hierarchy
   - Consistent component patterns
   - Breadcrumb navigation
   - Progress indicators

3. **Feedback & Communication**
   - User-friendly error messages
   - Real-time transaction status
   - Toast notifications for actions
   - Loading states with descriptions

4. **Accessibility**
   - Keyboard navigation support
   - Screen reader friendly
   - High contrast text
   - Responsive touch targets

### Key UI Components

#### Petition Card
```tsx
Features:
- Gradient border with glow on hover
- Floating badges (state, category, documents)
- Progress bar with animated gradient
- Date status badges (color-coded)
- Stats grid (signatures, progress)
- Smooth scale animation on interaction
```

#### Hero Section
```tsx
Features:
- Animated badge with gradient
- Epic title and description
- Real-time stats dashboard
- CTA button with hover effects
- Responsive layout
```

#### Category Filter
```tsx
Features:
- Horizontal scroll (hidden scrollbar)
- Icon + label for each category
- Subtle glow on selected (no blur)
- Smooth transitions
- 11 predefined categories
```

---

## Security Considerations

### Smart Contract Security

1. **Duplicate Prevention**: Contract enforces one signature per address
2. **Access Control**: Only creator can modify certain petition properties
3. **Date Validation**: Start/end dates validated on creation
4. **Reentrancy Protection**: Standard OpenZeppelin patterns

### Frontend Security

1. **Wallet Verification**: All transactions require wallet signature
2. **Input Validation**: Client-side validation before blockchain calls
3. **Error Handling**: User rejections handled gracefully
4. **IPFS Content**: Pinata gateway with security headers

### Best Practices

```typescript
// 1. Always validate user input
if (!title || !description) {
  throw new Error("Required fields missing");
}

// 2. Handle user rejections
if (isUserRejected(error)) {
  toast.error("Transaction cancelled by user");
  return;
}

// 3. Reset loading states on error
useEffect(() => {
  if (writeError) {
    setLoading(false);
    setIsSubmitting(false);
  }
}, [writeError]);

// 4. Use read-only calls when possible
const { data } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: petitionABI,
  functionName: 'getPetition',
  args: [petitionId]
});
```

---

## Development Setup

### Prerequisites

```bash
- Node.js 18+ or 20+
- npm or yarn
- MetaMask or compatible Web3 wallet
- Base Sepolia testnet ETH (faucet available)
```

### Environment Variables

```env
# Wallet Connection
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Smart Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0xDCd408BC70846d274A7B3f5cF814C01589BfDCf2

# IPFS (Pinata)
PINATA_API_URL=https://api.pinata.cloud
PINATA_API_KEY=your_api_key
PINATA_SECRET_KEY=your_secret_key
PINATA_JWT=your_jwt_token
PINATA_GATEWAY_URL=https://your-gateway.myptinata.cloud

# Alternative: NFT.Storage
NFT_STORAGE_API_KEY=your_nft_storage_key
NEXT_PUBLIC_NFT_STORAGE_URL=https://api.nft.storage/v1
```

### Installation

```bash
# Clone repository
git clone https://github.com/kikik27/petition-dApp.git
cd petition-dApp

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

### Build & Deploy

```bash
# Production build
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel deploy
```

### Testing

```bash
# Lint code
npm run lint

# Type check
npm run type-check

# Format code
npm run format
```

---

## API Routes

### IPFS Operations

#### Upload Petition
```typescript
POST /api/ipfs/upload-petition
Body: {
  title: string
  description: string
  images: string[]  // IPFS hashes
  documents: Array<{name, hash, size}>
  category: string
  creator: object
}
Response: {
  success: boolean
  ipfsHash: string
  url: string
}
```

#### Upload File
```typescript
POST /api/ipfs/upload-file
Content-Type: multipart/form-data
Body: FormData with file
Response: {
  success: boolean
  ipfsHash: string
  url: string
  size: number
}
```

#### Fetch Metadata
```typescript
GET /api/ipfs/fetch?cid={ipfsHash}
Response: {
  success: boolean
  data: object  // Petition metadata
}
```

---

## Performance Optimizations

### 1. Lazy Loading
- Images loaded progressively
- Components code-split with Next.js
- Route-based code splitting

### 2. Pagination Strategy
```typescript
// Fast list view (no IPFS fetch)
getAllPetitionsBasic(page: 1, limit: 9)
  → Returns on-chain data only
  → 10x faster than full fetch
  → Placeholder titles and images

// Full detail view (with IPFS)
getPetitionById(id)
  → Fetches complete metadata
  → Only when user clicks card
```

### 3. Caching
- Zustand store caches petition list
- IPFS gateway caching via Pinata
- Next.js automatic page caching

### 4. Optimistic Updates
- UI updates immediately after transaction
- Reverts if transaction fails
- Event listeners confirm success

---

## Future Enhancements

### Planned Features
1. **Petition Updates**: Allow creators to post updates
2. **Comment System**: Enable discussions on petitions
3. **Voting System**: Add support/oppose voting
4. **NFT Badges**: Reward active signers
5. **Analytics Dashboard**: Petition performance metrics
6. **Multi-Chain**: Deploy to multiple networks
7. **Mobile App**: React Native version
8. **Email Notifications**: Alert signers of updates

### Technical Improvements
1. **GraphQL Integration**: Replace REST with GraphQL
2. **Subgraph Indexing**: Use The Graph for queries
3. **PWA Support**: Add offline capabilities
4. **Web3 Social**: Integrate Lens Protocol
5. **ENS Support**: Resolve ENS names
6. **Multi-Language**: i18n support

---

## License

MIT License - See LICENSE file for details

---

## Support & Contact

- **GitHub**: [github.com/kikik27/petition-dApp](https://github.com/kikik27/petition-dApp)
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: GitHub Discussions for questions

---

## Acknowledgments

Built with:
- Next.js by Vercel
- Wagmi by Wevm
- Base by Coinbase
- Pinata IPFS
- shadcn/ui components
- Lucide Icons

---

**Last Updated**: October 25, 2025  
**Version**: 2.0.0  
**Network**: Base Sepolia Testnet
