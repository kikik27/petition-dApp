'use client'
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import useTheme from '@/stores/theme';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import CreatePetitionFormV2 from '@/components/petition/create-petitionV2';
import { usePetitionStore } from '@/stores/petition'
import { CardPetition } from '@/components/petition/card-petition';

export default function Home() {
  const { setLoading } = useTheme();
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isConnecting || isReconnecting) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [isConnecting, isReconnecting, setLoading])

  return (
    <main className="min-h-screen mx-auto flex justify-center items-center">
      {!isConnected ? (
        <div className="mx-auto max-w-4xl text-center items-center py-40">
          <h1 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Decentralized Petitions for the{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Future of Governance
            </span>
          </h1>
          <p className="text-gray-300 mb-8">Please connect your wallet to create and sign petitions !</p>
        </div>
      ) : (
        <Tabs defaultValue="browse" className="w-full py-6">
          <TabsList className="grid bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-700 w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="browse">Browse Petitions</TabsTrigger>
            <TabsTrigger value="create">Create Petition</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <PetitionList
            />
          </TabsContent>

          <TabsContent value="create">
            <CreatePetitionFormV2 onSuccess={() => setRefreshKey(prev => prev + 1)} />
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}

function PetitionList() {
  const { petitions, loading, error, fetchPetitions } = usePetitionStore();
  const { setLoading, setLoadingMessage, setLoadingDescription } = useTheme();

  useEffect(() => {
    fetchPetitions();
  }, [fetchPetitions]);

  useEffect(() => {
    if (loading) {
      setLoading(true);
      setLoadingMessage("Fetching petitions...");
      setLoadingDescription("Please wait while we load petitions from the blockchain.");
    } else {
      setLoading(false);
    }
  }, [loading, setLoading, setLoadingMessage, setLoadingDescription]);

 useEffect(() => {
    if (error) {
      setLoading(true);
      setLoadingMessage("⚠️ Error loading petitions");
      setLoadingDescription(error);
    }
  }, [error, setLoading, setLoadingMessage, setLoadingDescription]);

  // === Render UI ===
  if (loading) return null; // biar loading handled oleh Theme
  if (error && !petitions.length) return null; // biar error modal tampil dari Theme

  return (<div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 p-6">
      {petitions.map((petition) => {
        return <CardPetition key={petition.tokenId} petition={petition} />;
      })}
    </div>
  );
}