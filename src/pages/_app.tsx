import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';

import { Metadata } from 'next';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { sepolia } from 'wagmi/chains';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import CryptoWalletLottie from '@/components/lottie/crypto-wallet-lottie';
import useTheme from '@/stores/theme';
import { wagmiConfig } from '@/lib/wagmi';

const client = new QueryClient();

export const metadata: Metadata = {
  title: "Mandat",
  description: "Mandat - A decentralized petition platform",
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Mandat',
    description: 'Mandat - A decentralized petition platform',
    siteName: 'Mandat',
    locale: 'en-US',
    type: 'website',
  }
};

function MyApp({ Component, pageProps }: AppProps) {
  const { isLoading } = useTheme();

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <title>Mandat - A decentralized petition platform</title>
      </Head>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={client}>
          <RainbowKitProvider coolMode appInfo={{
            appName: 'Mandat - A decentralized petition platform', learnMoreUrl: 'https://mandat-dapp.vercel.app'
          }} theme={darkTheme()} showRecentTransactions={true} modalSize="compact">
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange>

                <main className={isLoading ? 'min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-foreground' : `min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-foreground`}>
                {isLoading && (
                  <>
                  <style jsx global>{`
                    body {
                    overflow: hidden;
                    }
                  `}</style>
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900/80 via-gray-950/80 to-gray-900/80 z-[99999] fixed">
                    <CryptoWalletLottie />
                  </div>
                  </>
                )}

                <AppHeader />
                <Component {...pageProps} />
                <AppFooter />
                <Toaster />

                </main>

            </ThemeProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default MyApp;
