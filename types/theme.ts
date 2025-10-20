export interface IThemeStore {
  isLoading: boolean;
  loadingMessage: string;
  loadingDescription?: string;
  setLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  setLoadingDescription: (description: string) => void;
}