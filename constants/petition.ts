import CIVIX_ABI from "@/abi/civicToken.json";
import BADGE_ABI from "@/abi/supportBadge.json";
import PETITION_ABI_NFT from "@/abi/petitionNFT.json";
import PETITION_ABI_V2 from "@/abi/petitionV2.json";

import {
  Globe2,
  HeartHandshake,
  Megaphone,
  GraduationCap,
  Heart,
  Scale,
  Sprout,
  TrendingUp,
  Cpu,
  CircleDot,
  AlertTriangle,
  Users,
  Flag,
  Leaf,
  Dog,
  Palette
} from "lucide-react";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

// Choose which ABI to use:
// PETITION_ABI_NFT = Uses bytes32 petitionId + getAllPetitions() (older contract)
// PETITION_ABI_V2.abi = Uses uint256 tokenId + getAllPetitionIds() (newer contract)
export const CONTRACT_ABI_V2 = PETITION_ABI_NFT; // Using petitionNFT with bytes32 petitionId

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
    abi: PETITION_ABI_NFT,
  },
}

export const PetitionCategory = [
  'SOCIAL', 'POLITICAL', 'ENVIRONMENTAL', 'EDUCATION',
  'HEALTH', 'HUMAN_RIGHTS', 'ANIMAL_RIGHTS', 'ECONOMIC',
  'TECHNOLOGY', 'CULTURAL', 'OTHER'
];

export const CATEGORY_MAP: Record<number, { label: string; color: string; icon: any }> = {
  0: { label: "Social", color: "bg-blue-500/20 text-blue-400 text-sm", icon: Users },
  1: { label: "Political", color: "bg-red-500/20 text-red-400 text-sm", icon: Flag },
  2: { label: "Environmental", color: "bg-emerald-500/20 text-emerald-400 text-sm", icon: Leaf },
  3: { label: "Education", color: "bg-amber-500/20 text-amber-400 text-sm", icon: GraduationCap },
  4: { label: "Health", color: "bg-rose-500/20 text-rose-400 text-sm", icon: Heart },
  5: { label: "Human Rights", color: "bg-violet-500/20 text-violet-400 text-sm", icon: Scale },
  6: { label: "Animal Rights", color: "bg-orange-500/20 text-orange-400 text-sm", icon: Dog },
  7: { label: "Economic", color: "bg-cyan-500/20 text-cyan-400 text-sm", icon: TrendingUp },
  8: { label: "Technology", color: "bg-indigo-500/20 text-indigo-400 text-sm", icon: Cpu },
  9: { label: "Cultural", color: "bg-pink-500/20 text-pink-400 text-sm", icon: Palette },
  10: { label: "Other", color: "bg-slate-500/20 text-slate-400 text-sm", icon: Globe2 },
};

export const STATE_MAP: Record<number, { label: string; color: string }> = {
  0: { label: "Draft", color: "bg-gray-500/20 text-gray-400 text-sm" },
  1: { label: "Published", color: "bg-green-500/20 text-green-400 text-sm" },
  2: { label: "Completed", color: "bg-blue-500/20 text-blue-400 text-sm" },
  3: { label: "Cancelled", color: "bg-red-500/20 text-red-400 text-sm" },
};