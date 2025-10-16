import { cookieStorage, createStorage } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

// Create a single, stable wagmi config for the whole app.
// Keeping this outside of any React component prevents re-creation
// on re-renders or route changes, preserving connection state.
export const wagmiConfig = getDefaultConfig({
  appName: 'Mandat',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});
