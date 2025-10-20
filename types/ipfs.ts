export interface UploadResult {
  success: boolean;
  cid: string;
  url: string;
  gatewayUrl: string;
}

export interface FileUploadResult extends UploadResult {
  filename: string;
  size: number;
  type: string;
  url: string;
  cid: string;
  pinSize: number;
  timestamp: string;
  gatewayUrl: string;
}

export interface MultipleFilesUploadResult {
  success: boolean;
  files: FileUploadResult[];
}

export interface DocumentMetadata {
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: number;
}

export interface PetitionUploadResult {
  success: boolean;
  metadataCID: string;
  imageCID: string;
  documents: DocumentMetadata[];
  url: string;
  gatewayUrl: string;
}

export interface PetitionData {
  title: string;
  description: string;
  richTextContent: string;
  category: string;
  tags: string[];
  creator: string;
  targetSignatures: number;
  startDate: number;
  endDate: number;
  coverImage?: File;
  documents?: File[];
}

export interface UploadProgress {
  step: number;
  total: number;
  message: string;
}

export interface StatusResult {
  success: boolean;
  cid: string;
  size: number;
  created: string;
  pin: {
    cid: string;
    status: string;
  };
  deals: any[];
}

export interface FetchResult {
  success: boolean;
  data: any;
  gateway: string;
}