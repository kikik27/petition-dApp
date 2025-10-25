import { PetitionService } from "@/services/petition";
import { IPetitionStore } from "@/types";
import { PetitionCategory } from "@/types/petition";
import { create } from "zustand";

export const usePetitionStore = create<IPetitionStore>((set, get) => ({
  petitions: [],
  loading: false,
  error: null,

  fetchPetitions: async () => {
    try {
      set({ loading: true, error: null });
      const petitions = await PetitionService.getAllPetitions();

      // Even if empty, clear error state
      set({ petitions: petitions || [], loading: false, error: null });
    } catch (err: any) {
      // Handle specific contract errors
      let errorMessage = "Failed to fetch petitions";

      if (err?.message?.includes("returned no data") || err?.message?.includes("0x")) {
        errorMessage = "Contract not deployed or network mismatch. Please check your connection.";
      } else if (err?.message?.includes("does not have the function")) {
        errorMessage = "Contract ABI mismatch. Please verify contract address.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      set({
        error: errorMessage,
        loading: false,
        petitions: [], // Clear petitions on error
      });
    }
  },

  fetchPetitionsByCategory: async (category: PetitionCategory) => {
    try {
      set({ loading: true, error: null });

      // Convert category string to number (0-10)
      const categoryMap: Record<PetitionCategory, number> = {
        'SOCIAL': 0,
        'POLITICAL': 1,
        'ENVIRONMENTAL': 2,
        'EDUCATION': 3,
        'HEALTH': 4,
        'HUMAN_RIGHTS': 5,
        'ANIMAL_RIGHTS': 6,
        'ECONOMIC': 7,
        'TECHNOLOGY': 8,
        'CULTURAL': 9,
        'OTHER': 10,
      };

      const categoryNumber = categoryMap[category];
      const petitions = await PetitionService.getPetitionsByCategory(categoryNumber);

      set({ petitions: petitions || [], loading: false, error: null });
    } catch (err: any) {
      let errorMessage = `Failed to fetch ${category} petitions`;

      if (err?.message?.includes("returned no data") || err?.message?.includes("0x")) {
        errorMessage = "No petitions found for this category.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      set({
        error: errorMessage,
        loading: false,
        petitions: [],
      });
    }
  },
}));