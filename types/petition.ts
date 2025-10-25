import { Interface } from "readline";

export type PetitionState = "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";

export type PetitionCategory =
  | "SOCIAL"
  | "POLITICAL"
  | "ENVIRONMENTAL"
  | "EDUCATION"
  | "HEALTH"
  | "HUMAN_RIGHTS"
  | "ANIMAL_RIGHTS"
  | "ECONOMIC"
  | "TECHNOLOGY"
  | "CULTURAL"
  | "OTHER";

/**
 * PetitionData from Smart Contract (Raw)
 * Matches the struct from petitionNFT.json ABI
 */
export interface PetitionData {
  id: string;                    // bytes32
  tokenId: bigint;               // uint256
  owner: string;                 // address
  metadataURI: string;           // string
  category: bigint;              // uint256
  tags: string[];                // string[]
  startDate: bigint;             // uint256
  endDate: bigint;               // uint256
  signatureCount: bigint;        // uint256
  targetSignatures: bigint;      // uint256
  status: number;                // uint8 (0: PUBLISHED, 1: COMPLETED, 2: CANCELLED)
  createdAt: bigint;             // uint256
}

/**
 * PetitionMetadata for UI (Processed)
 * Converted from PetitionData for easier use in React components
 */
export interface PetitionMetadata {
  // IDs
  id: string;                    // bytes32 petition ID
  tokenId: string;               // uint256 as string

  // State & Owner
  state: PetitionState;          // Converted from status
  owner: string;                 // Creator address
  creator: string;               // Alias for owner

  // Metadata
  metadataURI: string;           // IPFS URI
  title: string;                 // From IPFS metadata
  description?: string;          // From IPFS metadata
  image: string;                 // From IPFS metadata (converted to https)

  // Category & Tags
  category: PetitionCategory;    // Converted from number
  tags: string[];                // Array of tags

  // Documents (optional from IPFS metadata)
  documents?: Array<{
    name: string;
    url: string;
    uploadedAt: number;
  }>;

  // Dates
  createdAt: Date;               // Converted from timestamp
  publishedAt: Date | null;      // Optional publish date
  startDate: Date;               // Converted from timestamp
  endDate: Date;                 // Converted from timestamp

  // Signatures
  signatureCount: string;        // As string for display
  targetSignatures: string;      // As string for display
  progress: string;              // Percentage as string (e.g., "45.50")

  // UI States
  canSign: boolean;              // Can current user sign?
  isDraft: boolean;              // Is this a draft?
  isCompleted?: boolean;         // Is petition completed?
  isExpired?: boolean;           // Has petition expired?
}

export interface PetitionCore {
  creator: string;
  category: number;
  createdAt: bigint;
  publishedAt: bigint;
  startDate: bigint;
  endDate: bigint;
}

/**
 * Signature data from Smart Contract
 * Used in getSignatures() function
 */
export interface Signer {
  signer: string;                // address
  timestamp: bigint;             // uint256
  message: string;               // comment/message
}

/**
 * Petition Store Interface
 * Used in Zustand store for state management
 */
export interface IPetitionStore {
  petitions: PetitionMetadata[];
  loading: boolean;
  error: string | null;
  fetchPetitions: () => Promise<void>;
  fetchPetitionsByCategory: (category: PetitionCategory) => Promise<void>;
}

/**
 * IPFS Metadata Structure
 * Stored on IPFS and referenced by metadataURI
 */
export interface PetitionIPFSMetadata {
  name: string;                  // Petition title
  description: string;           // Petition description
  image: string;                 // IPFS image URI
  petitionData?: {
    richTextContent?: string;
    category?: string;
    tags?: string[];
    documents?: Array<{
      name: string;
      url: string;
      uploadedAt: number;
    }>;
    targetSignatures?: string;
    startDate?: string;
    endDate?: string;
  };
}