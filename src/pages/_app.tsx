import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import type { AppProps } from 'next/app';

import { Metadata } from 'next';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';

import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import useTheme from '@/stores/theme';
import { wagmiConfig } from '@/lib/wagmi-config';
import { CryptoWalletLottie } from '@/components/lottie/lottieAnim';

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
  const { isLoading, loadingMessage, loadingDescription } = useTheme();

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

              <main
                className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-foreground overflow-x-hidden'                    >
                {isLoading && (
                  <>
                    <style jsx global>{`
        body {
          overflow: hidden;
        }
      `}</style>

                    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/90 via-gray-950/90 to-gray-900/90 backdrop-blur-sm">
                      <CryptoWalletLottie />
                      <div className="mt-6 text-center">
                        <h1 className="text-xl font-semibold text-white animate-pulse tracking-wide">
                          {loadingMessage || 'Processing...'}
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm">
                          {loadingDescription || 'Please wait while we complete your request.'}
                        </p>
                      </div>
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
