import { create } from 'zustand';
import { IThemeStore } from '@/types/theme';

const useTheme = create<IThemeStore>((set) => ({
  isLoading: false,
  loadingMessage: '',
  loadingDescription: '',

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setLoadingMessage: (message: string) => set({ loadingMessage: message }),
  setLoadingDescription: (description: string) => set({ loadingDescription: description }),
}));

export default useTheme;