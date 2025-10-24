/**
 * Test Contract Connection
 * Run this in browser console to debug contract issues
 */

import { publicClient } from "@/lib/wagmi-client";
import { CONTRACT_ADDRESS, CONTRACT_ABI_V2 } from "@/constants";

export async function testContractRead() {
  console.log("🧪 === TESTING CONTRACT CONNECTION ===");

  try {
    // 1. Check network
    const chainId = await publicClient.getChainId();
    const chainName = chainId === 84532 ? "Base Sepolia" :
      chainId === 11155111 ? "Ethereum Sepolia" :
        chainId === 31337 ? "Hardhat Local" :
          "Unknown";
    console.log("✅ Connected to:", chainName);
    console.log("   Chain ID:", chainId);
    console.log("   Expected: Base Sepolia (84532)");

    if (chainId !== 84532) {
      console.warn("⚠️ WARNING: Chain ID mismatch!");
      console.warn("   You are connected to:", chainName, `(${chainId})`);
      console.warn("   Contract is on: Base Sepolia (84532)");
      console.warn("   → Please switch your wallet network to Base Sepolia");
    }

    // 2. Check contract address
    console.log("\n📍 Contract Address:", CONTRACT_ADDRESS);
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "undefined") {
      console.error("❌ CONTRACT_ADDRESS is not set!");
      console.error("   Please set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local");
      return false;
    }

    // 3. Check if contract is deployed
    console.log("\n📦 Checking contract deployment...");
    const bytecode = await publicClient.getBytecode({
      address: CONTRACT_ADDRESS as `0x${string}`,
    });

    const isDeployed = bytecode && bytecode !== "0x";
    console.log(isDeployed ? "✅ Contract IS deployed" : "❌ Contract NOT deployed");
    if (bytecode) {
      console.log("   Bytecode length:", bytecode.length, "characters");
    }

    if (!isDeployed) {
      console.error("❌ No contract found at this address on", chainName);
      console.error("   Possible reasons:");
      console.error("   1. Wrong contract address in .env.local");
      console.error("   2. Contract not deployed on this network");
      console.error("   3. Wrong network (check wallet)");
      return false;
    }

    // 4. Try getTotalPetitions
    console.log("\n📊 Testing getTotalPetitions()...");
    try {
      const total = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI_V2,
        functionName: "getTotalPetitions",
      });
      console.log("✅ Total Petitions:", total?.toString());

      if (Number(total) === 0) {
        console.log("ℹ️  No petitions created yet. Create one first!");
      }
    } catch (err: any) {
      console.error("❌ getTotalPetitions() failed:", err.message);
      if (err.message.includes("0x")) {
        console.error("   → Function doesn't exist or contract is wrong");
      }
    }

    // 5. Try getAllPetitions
    console.log("\n📋 Testing getAllPetitions()...");
    try {
      const petitions = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI_V2,
        functionName: "getAllPetitions",
      });
      console.log("✅ getAllPetitions() SUCCESS!");
      console.log("   Type:", typeof petitions);
      console.log("   Is Array:", Array.isArray(petitions));
      console.log("   Length:", Array.isArray(petitions) ? petitions.length : "N/A");

      if (Array.isArray(petitions) && petitions.length > 0) {
        console.log("\n🔍 First petition breakdown:");
        const first = petitions[0] as any;
        console.log("   Full object:", first);
        console.log("\n   Struct fields:");
        console.log("   - id (bytes32):", first[0] || first.id);
        console.log("   - tokenId (uint256):", first[1]?.toString() || first.tokenId?.toString());
        console.log("   - owner (address):", first[2] || first.owner);
        console.log("   - metadataURI:", first[3] || first.metadataURI);
        console.log("   - category:", first[4]?.toString() || first.category?.toString());
        console.log("   - tags:", first[5] || first.tags);
        console.log("   - startDate:", first[6]?.toString() || first.startDate?.toString());
        console.log("   - endDate:", first[7]?.toString() || first.endDate?.toString());
        console.log("   - signatureCount:", first[8]?.toString() || first.signatureCount?.toString());
        console.log("   - targetSignatures:", first[9]?.toString() || first.targetSignatures?.toString());
        console.log("   - status:", first[10]?.toString() || first.status?.toString());
        console.log("   - createdAt:", first[11]?.toString() || first.createdAt?.toString());
      } else {
        console.log("ℹ️  No petitions returned (empty array)");
      }
    } catch (err: any) {
      console.error("❌ getAllPetitions() FAILED");
      console.error("   Error:", err.message);
      console.error("   Code:", err.code);

      if (err.message.includes("0x") || err.message.includes("no data")) {
        console.error("\n💡 This usually means:");
        console.error("   1. Contract function doesn't exist (ABI mismatch)");
        console.error("   2. Wrong contract address");
        console.error("   3. Wrong network (wallet vs code)");
        console.error("   4. Contract not properly deployed");
      }
    }

    console.log("\n🧪 === TEST COMPLETE ===");
    console.log("\n📝 Summary:");
    console.log("   Chain:", chainName, `(${chainId})`);
    console.log("   Contract:", CONTRACT_ADDRESS);
    console.log("   Status:", isDeployed ? "Deployed ✅" : "Not Found ❌");

    return true;
  } catch (error: any) {
    console.error("❌ Test failed:", error);
    console.error("   Message:", error.message);
    return false;
  }
}

// Make it available in browser console
if (typeof window !== 'undefined') {
  (window as any).testContractRead = testContractRead;
  console.log("💡 TIP: Run testContractRead() in console to debug contract issues");
}