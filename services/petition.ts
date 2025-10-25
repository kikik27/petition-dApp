import { CONTRACT_ABI_V2, CONTRACT_ADDRESS } from "@/constants";
import { publicClient } from "@/lib/wagmi-client";
import { PetitionCategory, PetitionData, PetitionMetadata, PetitionState, Signer } from "@/types/petition";

export const PetitionService = {
  /**
   * Get all petitions from smart contract
   * Returns array of PetitionData structs directly
   */
  async getAllPetitions(): Promise<PetitionMetadata[]> {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI_V2,
        functionName: "getAllPetitions",
      });

      // Handle empty result (0x)
      if (!result || (Array.isArray(result) && result.length === 0)) {
        return [];
      }

      const petitionsData = result as PetitionData[];

      // Convert each PetitionData to PetitionMetadata
      const petitions = await Promise.all(
        petitionsData.map((data, index) =>
          this.convertToMetadata(data).catch((err) => {
            console.error(`Error converting petition ${index}:`, err);
            return null;
          })
        )
      );

      // Filter out null values (failed conversions)
      const validPetitions = petitions.filter((p): p is PetitionMetadata => p !== null);

      return validPetitions;
    } catch (error: any) {
      console.error("Error fetching petitions:", error?.message);

      // Handle specific "0x" return error
      if (error?.message?.includes("returned no data") || error?.message?.includes("0x")) {
        return [];
      }

      // Return empty array instead of throwing
      return [];
    }
  },

  /**
   * Get single petition by petitionId (bytes32) or tokenId (number)
   * @param identifier - bytes32 petition ID or tokenId string/number
   */
  async getPetitionById(identifier: string | number): Promise<PetitionMetadata> {
    let petitionData: PetitionData;

    // Check if identifier is bytes32 (hex string starting with 0x, 66 chars)
    const isByteString = typeof identifier === 'string' &&
      identifier.startsWith('0x') &&
      identifier.length === 66;

    if (isByteString) {
      // Direct petitionId lookup
      petitionData = (await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI_V2,
        functionName: "getPetition",
        args: [identifier as `0x${string}`],
      })) as PetitionData;
    } else {
      // Convert tokenId to petitionId first, then fetch
      const tokenId = BigInt(identifier);

      const petitionId = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI_V2,
        functionName: "getPetitionIdByTokenId",
        args: [tokenId],
      }) as string;

      petitionData = (await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI_V2,
        functionName: "getPetition",
        args: [petitionId as `0x${string}`],
      })) as PetitionData;
    }

    return this.convertToMetadata(petitionData);
  },  /**
   * Convert PetitionData from contract to PetitionMetadata for UI
   * @param data - Raw petition data from smart contract
   */
  async convertToMetadata(data: PetitionData): Promise<PetitionMetadata> {
    // Fetch metadata from IPFS
    const url = data.metadataURI.replace("ipfs://", "https://ipfs.io/ipfs/");

    let meta;
    try {
      const response = await fetch(url);
      meta = await response.json();
    } catch (err) {
      console.error("Failed to fetch IPFS metadata:", err);
      throw err;
    }

    // Convert numeric values
    const target = Number(data.targetSignatures);
    const signatures = Number(data.signatureCount);
    const progress = target > 0 ? Math.min((signatures / target) * 100, 100).toFixed(2) : "0";

    // Category mapping
    const categoryNames: PetitionCategory[] = [
      "SOCIAL",
      "POLITICAL",
      "ENVIRONMENTAL",
      "EDUCATION",
      "HEALTH",
      "HUMAN_RIGHTS",
      "ANIMAL_RIGHTS",
      "ECONOMIC",
      "TECHNOLOGY",
      "CULTURAL",
      "OTHER",
    ];

    // State mapping (0: PUBLISHED, 1: COMPLETED, 2: CANCELLED)
    const stateNames: PetitionState[] = ["PUBLISHED", "COMPLETED", "CANCELLED"];
    const state = stateNames[Number(data.status)] || "PUBLISHED";

    // Check if completed or expired
    const now = new Date();
    const endDate = new Date(Number(data.endDate) * 1000);
    const isCompleted = state === "COMPLETED";
    const isExpired = now > endDate && state !== "COMPLETED";

    // Parse tags - handle both array and individual strings
    let tags: string[] = [];
    if (Array.isArray(data.tags)) {
      tags = data.tags;
    } else if (data.tags) {
      tags = [String(data.tags)];
    }

    // Parse documents from IPFS metadata (if exists)
    let documents: Array<{ name: string; url: string; uploadedAt: number }> | undefined;
    if (meta.petitionData?.documents && Array.isArray(meta.petitionData.documents)) {
      documents = meta.petitionData.documents.map((doc: any) => ({
        name: doc.name || "Unknown Document",
        url: doc.url?.replace("ipfs://", "https://ipfs.io/ipfs/") || doc.url,
        uploadedAt: doc.uploadedAt || Date.now(),
      }));
    }

    // Build metadata object
    const petition: PetitionMetadata = {
      // IDs
      id: data.id,
      tokenId: data.tokenId.toString(),

      // State & Owner
      state,
      owner: data.owner,
      creator: data.owner,

      // Metadata
      metadataURI: data.metadataURI,
      title: meta.name ?? "-",
      description: meta.description ?? "-",
      image: meta.image?.replace("ipfs://", "https://ipfs.io/ipfs/") ?? "",

      // Category & Tags
      category: categoryNames[Number(data.category)] || "OTHER",
      tags,

      // Documents (optional)
      documents,

      // Dates
      createdAt: new Date(Number(data.createdAt) * 1000),
      publishedAt: null,
      startDate: new Date(Number(data.startDate) * 1000),
      endDate,

      // Signatures
      signatureCount: signatures.toString(),
      targetSignatures: target.toString(),
      progress,

      // UI States
      canSign: !isCompleted && !isExpired,
      isDraft: false,
      isCompleted,
      isExpired,
    };

    return petition;
  },

  /**
   * Get signers for a petition
   * @param petitionId - bytes32 petition ID or tokenId (will be converted)
   */
  async getSigners(petitionId: string): Promise<Signer[]> {
    try {
      // Ensure petitionId is a valid bytes32 hex string (66 chars with 0x prefix)
      let validPetitionId = petitionId;

      // If it's a tokenId (number), we need to get the actual petitionId first
      if (petitionId.length < 66 || !petitionId.startsWith('0x')) {
        try {
          const result = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI_V2,
            functionName: "getPetitionIdByTokenId",
            args: [BigInt(petitionId)],
          });

          validPetitionId = result as string;
        } catch (err) {
          throw new Error(`Invalid petitionId format and cannot convert from tokenId: ${petitionId}`);
        }
      }

      // Validate bytes32 format
      if (!validPetitionId.startsWith('0x') || validPetitionId.length !== 66) {
        throw new Error(`Invalid bytes32 format: ${validPetitionId}`);
      }

      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI_V2,
        functionName: "getSignatures",
        args: [validPetitionId as `0x${string}`],
      });

      const signers = (result as Signer[]) || [];

      return signers;
    } catch (error: any) {
      console.error("Error fetching signers:", error.message);
      return [];
    }
  },  /**
   * Get petitions by category
   * @param category - Category number (0-9)
   */
  async getPetitionsByCategory(category: number): Promise<PetitionMetadata[]> {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI_V2,
        functionName: "getPetitionsByCategory",
        args: [BigInt(category)],
      });

      if (!result || (Array.isArray(result) && result.length === 0)) {
        return [];
      }

      const petitionsData = result as PetitionData[];
      const petitions = await Promise.all(
        petitionsData.map((data) => this.convertToMetadata(data).catch(() => null))
      );

      return petitions.filter((p): p is PetitionMetadata => p !== null);
    } catch (error) {
      console.error(`Error fetching petitions by category ${category}:`, error);
      return [];
    }
  },
};
