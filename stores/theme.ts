import { create } from 'zustand';
import { IThemeStore } from '@/types/theme';


export const useThemeStore = () => create<IThemeStore>((set) => ({
  isLoading: false,
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));