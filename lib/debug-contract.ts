import { CONTRACT_ABI_V2, CONTRACT_ADDRESS } from "@/constants";
import { publicClient } from "./wagmi-client";

/**
 * Debug utility to check contract connection
 */
export async function debugContractConnection() {
  console.log("🔍 === Contract Debug Info ===");

  try {
    // 1. Check contract address
    console.log("📍 Contract Address:", CONTRACT_ADDRESS);

    // 2. Check network
    const chainId = await publicClient.getChainId();
    console.log("🌐 Chain ID:", chainId);

    // 3. Check if address has code (is a contract)
    const code = await publicClient.getBytecode({
      address: CONTRACT_ADDRESS as `0x${string}`,
    });

    if (!code || code === "0x") {
      console.error("❌ No contract deployed at this address!");
      console.log("Possible solutions:");
      console.log("  1. Deploy the contract first");
      console.log("  2. Check if CONTRACT_ADDRESS in .env is correct");
      console.log("  3. Make sure you're on the right network");
      return false;
    }

    console.log("✅ Contract code found (deployed)");
    console.log("📝 Code length:", code.length);

    // 4. Check ABI has getAllPetitions
    const hasGetAllPetitions = CONTRACT_ABI_V2.some(
      (item: any) => item.name === "getAllPetitions" && item.type === "function"
    );

    if (!hasGetAllPetitions) {
      console.error("❌ getAllPetitions function not found in ABI!");
      return false;
    }

    console.log("✅ getAllPetitions function found in ABI");

    // 5. Try to call the function
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI_V2,
        functionName: "getAllPetitions",
      });

      console.log("✅ getAllPetitions() call successful");
      console.log("📊 Result:", result);
      console.log("📊 Result type:", typeof result);
      console.log("📊 Is array:", Array.isArray(result));

      if (Array.isArray(result)) {
        console.log("📊 Array length:", result.length);
      }

      return true;
    } catch (callError: any) {
      console.error("❌ Error calling getAllPetitions():", callError.message);
      return false;
    }

  } catch (error: any) {
    console.error("❌ Debug failed:", error.message);
    return false;
  } finally {
    console.log("🔍 === End Debug Info ===");
  }
}

/**
 * Quick check if contract is properly configured
 */
export async function isContractReady(): Promise<boolean> {
  try {
    if (!CONTRACT_ADDRESS) {
      console.error("❌ CONTRACT_ADDRESS not set in .env");
      return false;
    }

    const code = await publicClient.getBytecode({
      address: CONTRACT_ADDRESS as `0x${string}`,
    });

    return !(!code || code === "0x");
  } catch {
    return false;
  }
}
