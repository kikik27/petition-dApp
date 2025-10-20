// ==================================================
// lib/ipfs.ts
// Client-side helper for IPFS operations via Next.js API
// ==================================================

import { DocumentMetadata, FetchResult, FileUploadResult, MultipleFilesUploadResult, PetitionData, PetitionUploadResult, StatusResult, UploadProgress, UploadResult } from "@/types";


/**
 * Upload petition metadata to IPFS
 */
export async function uploadMetadata(metadata: Record<string, any>): Promise<UploadResult> {
  try {
    const response = await fetch('/api/ipfs/upload-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading metadata:', error);
    throw error;
  }
}

/**
 * Upload single file to IPFS
 */
export async function uploadFile(file: File): Promise<FileUploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/ipfs/upload-file', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Upload multiple files to IPFS
 */
export async function uploadMultipleFiles(files: File[]): Promise<MultipleFilesUploadResult> {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch('/api/ipfs/upload-multiple', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
}

/**
 * Upload complete petition (metadata + files)
 */
export async function uploadCompletePetition(petitionData: PetitionData): Promise<PetitionUploadResult> {
  try {
    const formData = new FormData();

    // Add text fields
    formData.append('title', petitionData.title);
    formData.append('description', petitionData.description);
    formData.append('richTextContent', petitionData.richTextContent);
    formData.append('category', petitionData.category);
    formData.append('tags', JSON.stringify(petitionData.tags || []));
    formData.append('creator', petitionData.creator);
    formData.append('targetSignatures', petitionData.targetSignatures.toString());
    formData.append('startDate', petitionData.startDate.toString());
    formData.append('endDate', petitionData.endDate.toString());

    // Add cover image
    if (petitionData.coverImage) {
      formData.append('coverImage', petitionData.coverImage);
    }

    // Add documents
    if (petitionData.documents && petitionData.documents.length > 0) {
      petitionData.documents.forEach((doc) => {
        formData.append('documents', doc);
      });
    }

    const response = await fetch('/api/ipfs/upload-petition', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading petition:', error);
    throw error;
  }
}

/**
 * Check IPFS upload status
 */
export async function checkStatus(cid: string): Promise<StatusResult> {
  try {
    const response = await fetch(`/api/ipfs/check-status?cid=${cid}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Status check failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking status:', error);
    throw error;
  }
}

/**
 * Fetch content from IPFS
 */
export async function fetchFromIPFS(cid: string): Promise<FetchResult> {
  try {
    const response = await fetch(`/api/ipfs/fetch?cid=${cid}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Fetch failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw error;
  }
}

/**
 * Convert IPFS URI to gateway URL
 */
export function ipfsToGateway(ipfsUri: string, gateway: string = 'https://nftstorage.link/ipfs'): string {
  if (!ipfsUri) return '';

  if (ipfsUri.startsWith('ipfs://')) {
    const cid = ipfsUri.replace('ipfs://', '');
    return `${gateway}/${cid}`;
  }

  return ipfsUri;
}

/**
 * Upload petition with progress tracking
 */
export async function uploadPetitionWithProgress(
  petitionData: PetitionData,
  onProgress: (progress: UploadProgress) => void
): Promise<PetitionUploadResult> {
  try {
    // Step 1: Upload cover image
    onProgress({ step: 1, total: 4, message: 'Uploading cover image...' });
    let imageCID = '';
    if (petitionData.coverImage) {
      const imageResult = await uploadFile(petitionData.coverImage);
      imageCID = imageResult.cid;
    }

    // Step 2: Upload documents
    onProgress({ step: 2, total: 4, message: 'Uploading documents...' });
    const documentMetadata: DocumentMetadata[] = [];
    if (petitionData.documents && petitionData.documents.length > 0) {
      const docResults = await uploadMultipleFiles(petitionData.documents);
      documentMetadata.push(...docResults.files.map(f => ({
        name: f.filename,
        size: f.size,
        type: f.type,
        url: f.url,
        uploadedAt: Date.now()
      })));
    }

    // Step 3: Create and upload metadata
    onProgress({ step: 3, total: 4, message: 'Creating metadata...' });
    const metadata = {
      name: petitionData.title,
      description: petitionData.description,
      image: imageCID ? `ipfs://${imageCID}` : '',
      external_url: `https://yourpetitiondapp.com`,

      attributes: [
        {
          trait_type: 'Category',
          value: petitionData.category,
        },
        {
          trait_type: 'Target Signatures',
          value: petitionData.targetSignatures,
          display_type: 'number',
        },
      ],

      petitionData: {
        richTextContent: petitionData.richTextContent,
        category: petitionData.category,
        tags: petitionData.tags || [],
        creator: petitionData.creator,
        targetSignatures: petitionData.targetSignatures,
        startDate: petitionData.startDate,
        endDate: petitionData.endDate,
        documents: documentMetadata,
        version: 1,
        createdAt: Date.now(),
      },
    };

    // Step 4: Upload final metadata
    onProgress({ step: 4, total: 4, message: 'Finalizing upload...' });
    const metadataResult = await uploadMetadata(metadata);

    onProgress({ step: 4, total: 4, message: 'Upload complete!' });

    return {
      success: true,
      metadataCID: metadataResult.cid,
      imageCID: imageCID,
      documents: documentMetadata,
      url: metadataResult.url,
      gatewayUrl: metadataResult.gatewayUrl,
    };

  } catch (error) {
    console.error('Error uploading petition:', error);
    throw error;
  }
}

/**
 * Upload petition update/revision
 */
export async function uploadPetitionUpdate(
  previousCID: string,
  updateData: {
    newDocuments?: DocumentMetadata[];
    changeNote?: string;
  }
): Promise<UploadResult> {
  try {
    // Fetch previous metadata
    const previousMetadata = await fetchFromIPFS(previousCID);

    // Merge with updates
    const updatedMetadata = {
      ...previousMetadata.data,
      petitionData: {
        ...previousMetadata.data.petitionData,
        version: (previousMetadata.data.petitionData.version || 1) + 1,
        lastUpdated: Date.now(),

        // Add new documents if any
        documents: [
          ...previousMetadata.data.petitionData.documents,
          ...(updateData.newDocuments || []),
        ],

        // Revision history
        revisionHistory: [
          ...(previousMetadata.data.petitionData.revisionHistory || []),
          {
            version: previousMetadata.data.petitionData.version || 1,
            cid: previousCID,
            timestamp: Date.now(),
            changes: updateData.changeNote || 'Updated petition',
          },
        ],
      },
    };

    // Upload new version
    const result = await uploadMetadata(updatedMetadata);

    return result;

  } catch (error) {
    console.error('Error uploading update:', error);
    throw error;
  }
}

/**
 * Validate IPFS CID format
 */
export function isValidCID(cid: string): boolean {
  // Basic CID validation (v0 and v1)
  const cidV0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidV1Regex = /^[a-z0-9]{59}$/;

  return cidV0Regex.test(cid) || cidV1Regex.test(cid);
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Estimate IPFS upload time
 */
export function estimateUploadTime(totalSize: number): string {
  // Assume 1 MB/s average upload speed
  const seconds = totalSize / (1024 * 1024);

  if (seconds < 60) {
    return `~${Math.ceil(seconds)} seconds`;
  } else if (seconds < 3600) {
    return `~${Math.ceil(seconds / 60)} minutes`;
  } else {
    return `~${Math.ceil(seconds / 3600)} hours`;
  }
}