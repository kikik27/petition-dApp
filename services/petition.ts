import { CONTRACT_ABI_V2, CONTRACT_ADDRESS } from "@/constants";
import { publicClient } from "@/lib/wagmi-client";
import { PetitionCategory, PetitionMetadata, PetitionState, Signer } from "@/types/petition";

export const PetitionService = {
  async getAllPetitionIds(): Promise<bigint[]> {
    return (await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI_V2,
      functionName: "getAllPetitionIds",
    })) as bigint[];
  },

  async getPetitionById(tokenId: bigint): Promise<PetitionMetadata> {
    // 1. Get core & dynamic
    const [core, dynamic] = (await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI_V2,
      functionName: "getPetition",
      args: [tokenId],
    })) as [any, any];

    // 2. Get metadata
    const tokenURI = (await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI_V2,
      functionName: "tokenURI",
      args: [tokenId],
    })) as string;

    const url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
    const meta = await fetch(url).then((r) => r.json());

    // 3. Convert numeric to readable
    const target = Number(core.targetSignatures ?? core[7]);
    const signatures = Number(dynamic.signatureCount ?? dynamic[0]);
    const progress =
      target > 0 ? Math.min((signatures / target) * 100, 100).toFixed(2) : "0";

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
      "OTHER",
    ];

    const stateNames: PetitionState[] = ["PUBLISHED", "COMPLETED", "CANCELLED"];

    // 4. Build structured object
    const petition: PetitionMetadata = {
      tokenId: tokenId.toString(),
      state: stateNames[Number(core.state ?? core[3])] || "PUBLISHED",
      creator: core.creator ?? core[1],
      category: categoryNames[Number(core.category ?? core[2])] || "OTHER",
      createdAt: new Date(Number(core.createdAt ?? core[4]) * 1000),
      publishedAt: null,
      startDate: new Date(Number(core.startDate ?? core[5]) * 1000),
      endDate: new Date(Number(core.endDate ?? core[6]) * 1000),
      signatureCount: signatures.toString(),
      targetSignatures: target.toString(),
      progress,
      canSign: true,
      isDraft: false,
      tags: [],
      title: meta.name ?? "-",
      description: meta.description ?? "-",
      image: meta.image?.replace("ipfs://", "https://ipfs.io/ipfs/") ?? "",
    };

    return petition;
  },

  async getAllPetitions(): Promise<PetitionMetadata[]> {
    const ids = await this.getAllPetitionIds();
    if (!ids.length) return [];
    
    const petitions = await Promise.all(ids.map((id) => this.getPetitionById(id)));
    return petitions;
  },

  async getSigners(tokenId: bigint) : Promise<Signer[]> {
    return (await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI_V2,
      functionName: "getSignatures",
      args: [tokenId],
    })) as Signer[];
  }

};
