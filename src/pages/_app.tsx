import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cookieStorage, createStorage, WagmiProvider } from 'wagmi';
import { darkTheme, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { sepolia } from 'wagmi/chains';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';
import { ThemeProvider } from '@/components/theme-provider';

const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {

  const config = getDefaultConfig({
    storage: createStorage({
      storage: cookieStorage
    }),
    appName: 'Mandat',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [sepolia],
    ssr: true
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider appInfo={{
          appName: 'Mandat',
        }} theme={darkTheme()} showRecentTransactions={true} modalSize="compact">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-foreground">
              <AppHeader />
              <Component {...pageProps} />
              <AppFooter />
            </div>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
