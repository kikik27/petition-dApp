import CIVIX_ABI from "@/abi/civicToken.json";
import BADGE_ABI from "@/abi/supportBadge.json";
import PETITION_ABI from "@/abi/petitionNFT.json";

import PETITION_ABI_OLD from "@/abi/petitionV2.json";

import { Globe2, HeartHandshake, Megaphone, AlertTriangle } from "lucide-react";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const CONTRACT_ABI_V2 = PETITION_ABI_OLD.abi;

export const CONTRACT_ABI_V3 = {
  civicToken: {
    address: process.env.CIVIC_TOKEN_CA,
    abi: CIVIX_ABI,
  },
  supportBadge: {
    address: process.env.SUPPORT_BADGE_CA,
    abi: BADGE_ABI,
  },
  petition: {
    address: process.env.PETITION_NFT_CA,
    abi: PETITION_ABI,
  },
}

export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "string", name: "imageUrl", type: "string" },
      { internalType: "uint256", name: "startDate", type: "uint256" },
      { internalType: "uint256", name: "endDate", type: "uint256" }
    ],
    name: "createPetition",
    outputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    name: "signPetition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    name: "getPetition",
    outputs: [{
      components: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "string", name: "title", type: "string" },
        { internalType: "string", name: "description", type: "string" },
        { internalType: "string", name: "imageUrl", type: "string" },
        { internalType: "uint256", name: "startDate", type: "uint256" },
        { internalType: "uint256", name: "endDate", type: "uint256" },
        { internalType: "uint256", name: "signatureCount", type: "uint256" },
        { internalType: "bool", name: "isActive", type: "bool" },
        { internalType: "uint256", name: "createdAt", type: "uint256" }
      ],
      internalType: "struct Petition.PetitionData",
      name: "",
      type: "tuple"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTotalPetitions",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "petitionId", type: "uint256" },
      { internalType: "address", name: "signer", type: "address" }
    ],
    name: "hasAddressSigned",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    name: "getSigners",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    name: "getUpdateLogs",
    outputs: [{
      components: [
        { internalType: "uint256", name: "timestamp", type: "uint256" },
        { internalType: "string", name: "fieldUpdated", type: "string" },
        { internalType: "string", name: "oldValue", type: "string" },
        { internalType: "string", name: "newValue", type: "string" }
      ],
      internalType: "struct Petition.UpdateLog[]",
      name: "",
      type: "tuple[]"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "petitionId", type: "uint256" },
      { internalType: "string", name: "newTitle", type: "string" }
    ],
    name: "updateTitle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "petitionId", type: "uint256" },
      { internalType: "string", name: "newDescription", type: "string" }
    ],
    name: "updateDescription",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "petitionId", type: "uint256" },
      { internalType: "string", name: "newImageUrl", type: "string" }
    ],
    name: "updateImage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

export const PetitionCategory = [
  'SOCIAL', 'POLITICAL', 'ENVIRONMENTAL', 'EDUCATION',
  'HEALTH', 'HUMAN_RIGHTS', 'ANIMAL_RIGHTS', 'ECONOMIC',
  'TECHNOLOGY', 'OTHER'
];

export const CATEGORY_MAP: Record<number, { label: string; color: string; icon: any }> = {
  0: { label: "Social", color: "bg-blue-500/20 text-blue-400", icon: HeartHandshake },
  1: { label: "Political", color: "bg-red-500/20 text-red-400", icon: Megaphone },
  2: { label: "Environmental", color: "bg-green-500/20 text-green-400", icon: Globe2 },
  3: { label: "Education", color: "bg-yellow-500/20 text-yellow-400", icon: AlertTriangle },
  4: { label: "Health", color: "bg-pink-500/20 text-pink-400", icon: HeartHandshake },
  5: { label: "Human Rights", color: "bg-purple-500/20 text-purple-400", icon: AlertTriangle },
  6: { label: "Animal Rights", color: "bg-orange-500/20 text-orange-400", icon: AlertTriangle },
  7: { label: "Economic", color: "bg-cyan-500/20 text-cyan-400", icon: Globe2 },
  8: { label: "Technology", color: "bg-indigo-500/20 text-indigo-400", icon: Globe2 },
  9: { label: "Other", color: "bg-gray-500/20 text-gray-300", icon: Globe2 },
};

export const STATE_MAP: Record<number, { label: string; color: string }> = {
  0: { label: "Draft", color: "bg-gray-500/20 text-gray-400" },
  1: { label: "Published", color: "bg-green-500/20 text-green-400" },
  2: { label: "Completed", color: "bg-blue-500/20 text-blue-400" },
  3: { label: "Cancelled", color: "bg-red-500/20 text-red-400" },
};