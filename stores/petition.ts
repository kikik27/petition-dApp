import { PetitionService } from "@/services/petition";
import { IPetitionStore } from "@/types";
import { create } from "zustand";

export const usePetitionStore = create<IPetitionStore>((set, get) => ({
  petitions: [],
  loading: false,
  error: null,

  fetchPetitions: async () => {
    try {
      set({ loading: true, error: null });
      const petitions = await PetitionService.getAllPetitions();
      set({ petitions, loading: false });
    } catch (err: any) {
      console.error("Fetch petitions failed:", err);
      set({
        error: err?.message ?? "Failed to fetch petitions",
        loading: false,
      });
    }
  },
}));