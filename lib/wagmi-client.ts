import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

// ⚠️ IMPORTANT: Must match the chain in wagmi-config.ts
// Currently using Base Sepolia (chainId: 84532)
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});