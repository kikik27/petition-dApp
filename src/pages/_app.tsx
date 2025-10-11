import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';

import { Metadata } from 'next';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cookieStorage, createStorage, WagmiProvider } from 'wagmi';
import { darkTheme, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { sepolia } from 'wagmi/chains';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import CryptoWalletLottie from '@/components/lottie/crypto-wallet-lottie';
import { useThemeStore } from '@/stores/theme';


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
  const themeStore = useThemeStore();
  const { isLoading } = themeStore();

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
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <title>Mandat - A decentralized petition platform</title>
      </Head>
      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
          <RainbowKitProvider coolMode appInfo={{
            appName: 'Mandat - A decentralized petition platform', learnMoreUrl: 'https://mandat-dapp.vercel.app'
          }} theme={darkTheme()} showRecentTransactions={true} modalSize="compact">
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange>
              {/* {isLoading ? <div className='w-full h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex justify-center items-center -z-10 opacity-20'>
                
              </div>
                :
              } */}
              <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-foreground">
                {isLoading && (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900/80 via-gray-950/80 to-gray-900/80 z-[99999] fixed">
                    <CryptoWalletLottie />
                  </div>
                )}
                <div
                  className={`
        flex flex-col w-full transition-all duration-300 ease-in-out 
        min-h-screen max-md:ml-0 max-md:w-full
      `}
                >

                  <AppHeader />
                  <Component {...pageProps} />
                  <AppFooter />
                  <Toaster />
                </div>
              </main>
            </ThemeProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default MyApp;
