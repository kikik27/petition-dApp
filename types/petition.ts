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
  | "OTHER";

export interface PetitionMetadata {
  tokenId: string;
  state: PetitionState;
  creator: string;
  category: PetitionCategory;
  createdAt: Date;
  publishedAt: Date | null;
  startDate: Date;
  endDate: Date;
  signatureCount: string;
  targetSignatures: string;
  progress: string;
  canSign: boolean;
  isDraft: boolean;
  tags: string[];
  title: string;
  description?: string;
  image: string;
}

export interface PetitionCore {
  creator: string;
  category: number;
  createdAt: bigint;
  publishedAt: bigint;
  startDate: bigint;
  endDate: bigint;
}

export interface IPetitionStore {
  petitions: PetitionMetadata[];
  loading: boolean;
  error: string | null;
  fetchPetitions: () => Promise<void>;
}