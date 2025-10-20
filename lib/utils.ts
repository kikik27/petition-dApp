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

export function getReadableError(e: unknown) {
  if (e instanceof ContractFunctionRevertedError) {
    return e.message; // berisi reason string kalau ada
  }
  if (e instanceof BaseError) {
    return e.shortMessage ?? e.message;
  }
  return (e as any)?.message ?? "Unknown error";
}
