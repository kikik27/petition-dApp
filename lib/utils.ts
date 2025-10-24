import { BaseError, ContractFunctionRevertedError } from "viem";
import { CATEGORY_MAP, STATE_MAP } from "@/constants";
import { clsx, type ClassValue } from "clsx"
import { Globe2 } from "lucide-react";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryInfo(categorySearch?: number | string) {
  const defaultCategory = { label: "Unknown", color: "bg-gray-500/20 text-gray-400", icon: Globe2 };

  if (categorySearch === undefined || categorySearch === null) {
    return defaultCategory;
  }

  if (typeof categorySearch === 'number') {
    return CATEGORY_MAP[categorySearch] ?? defaultCategory;
  }

  // Search by category name
  const category = Object.values(CATEGORY_MAP).find(
    cat => cat.label.toLowerCase() === categorySearch.toLowerCase()
  );
  return category ?? defaultCategory;
}

export function getStateInfo(stateSearch?: number | string) {
  const defaultState = { label: "Unknown", color: "bg-gray-500/20 text-gray-400" };

  if (stateSearch === undefined || stateSearch === null) {
    return defaultState;
  }

  if (typeof stateSearch === 'number') {
    return STATE_MAP[stateSearch] ?? defaultState;
  }

  // Search by state name
  const state = Object.values(STATE_MAP).find(
    st => st.label.toLowerCase() === stateSearch.toLowerCase()
  );
  return state ?? defaultState;
}


export function isUserRejected(e: unknown) {
  const msg = (e as any)?.shortMessage || (e as any)?.message || "";
  return /user rejected|user rejected the request|request rejected/i.test(msg);
}

/**
 * Convert technical error messages to user-friendly messages
 */
export function getReadableError(e: unknown): string {
  const fullMessage = (e as any)?.message || (e as any)?.shortMessage || "";
  const lowerMsg = fullMessage.toLowerCase();

  // Rate limiting errors
  if (lowerMsg.includes("rate limit") || lowerMsg.includes("too many requests")) {
    return "You're making requests too quickly. Please wait a moment and try again.";
  }

  // Already signed errors
  if (lowerMsg.includes("already signed") || lowerMsg.includes("duplicate signature")) {
    return "You have already signed this petition.";
  }

  // Petition ended/expired errors
  if (lowerMsg.includes("petition has ended") || lowerMsg.includes("petition expired")) {
    return "This petition has already ended and is no longer accepting signatures.";
  }

  // Petition not started errors
  if (lowerMsg.includes("not started") || lowerMsg.includes("too early")) {
    return "This petition hasn't started yet. Please wait until the start date.";
  }

  // Insufficient permissions
  if (lowerMsg.includes("not authorized") || lowerMsg.includes("only owner")) {
    return "You don't have permission to perform this action.";
  }

  // Gas/fee errors
  if (lowerMsg.includes("insufficient funds") || lowerMsg.includes("gas")) {
    return "Insufficient funds to complete this transaction. Please add more ETH to your wallet.";
  }

  // Network errors
  if (lowerMsg.includes("network") || lowerMsg.includes("connection")) {
    return "Network connection issue. Please check your internet and try again.";
  }

  // IPFS errors
  if (lowerMsg.includes("ipfs") || lowerMsg.includes("failed to fetch")) {
    return "Failed to upload data to storage. Please try again.";
  }

  // Contract reverted (generic)
  if (lowerMsg.includes("reverted") || lowerMsg.includes("execution reverted")) {
    // Extract reason if available
    const reasonMatch = fullMessage.match(/reason:\s*(.+?)(?:\n|Contract Call:|$)/i);
    if (reasonMatch && reasonMatch[1]) {
      const reason = reasonMatch[1].trim();
      // If reason is too technical, return generic message
      if (reason.length > 100 || reason.includes("0x")) {
        return "Transaction failed. Please check the petition details and try again.";
      }
      return `Transaction failed: ${reason}`;
    }
    return "Transaction failed. The smart contract rejected this action.";
  }

  // Timeout errors
  if (lowerMsg.includes("timeout") || lowerMsg.includes("timed out")) {
    return "Request timed out. Please try again.";
  }

  // User rejection (should be caught earlier but just in case)
  if (lowerMsg.includes("user rejected") || lowerMsg.includes("user denied")) {
    return "You cancelled the transaction.";
  }

  // Invalid input
  if (lowerMsg.includes("invalid") || lowerMsg.includes("malformed")) {
    return "Invalid input. Please check your data and try again.";
  }

  // Default: Try to show only the first sentence if too long
  if (e instanceof ContractFunctionRevertedError) {
    return "Transaction failed. The smart contract rejected this action.";
  }

  if (e instanceof BaseError) {
    const shortMsg = e.shortMessage ?? e.message;
    // If message is too long or contains technical terms, simplify it
    if (shortMsg.length > 150 || shortMsg.includes("Contract Call:") || shortMsg.includes("0x")) {
      return "Transaction failed. Please try again or contact support if the issue persists.";
    }
    return shortMsg;
  }

  // Fallback
  const errorMsg = (e as any)?.message || "An unexpected error occurred";
  if (errorMsg.length > 150 || errorMsg.includes("0x")) {
    return "Transaction failed. Please try again.";
  }

  return errorMsg;
}
