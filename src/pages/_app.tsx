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
import { Toaster } from '@/components/ui/sonner';

import { Metadata } from 'next';
import Head from 'next/head';

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
    url: 'https://mandat.pet',
    siteName: 'Mandat',
    images: [
      {
        url: 'https://mandat.pet/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mandat',
      },
    ],
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mandat',
    description: 'Mandat - A decentralized petition platform',
    images: ['https://mandat.pet/og-image.png'],
    creator: '@mandat_pet',
  },
};

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
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>
      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
          <RainbowKitProvider appInfo={{
            appName: 'Mandat - A decentralized petition platform',
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
                <Toaster />
              </div>
            </ThemeProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default MyApp;
