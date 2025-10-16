import { create } from 'zustand';
import { IThemeStore } from '@/types/theme';

// Export the zustand hook directly. Components should call useTheme() to access state/actions.
const useTheme = create<IThemeStore>((set) => ({
  isLoading: false,
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

export default useTheme;