'use client'
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import useTheme from '@/stores/theme';

import { usePetitionStore } from '@/stores/petition'
import { CardPetition } from '@/components/petition/card-petition';

export default function Home() {
  const { setLoading } = useTheme();
  const { isConnected, isConnecting, isReconnecting } = useAccount();

  useEffect(() => {
    if (isConnecting || isReconnecting) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [isConnecting, isReconnecting, setLoading])

  return (
    <main className="min-h-screen mx-auto my-au p-4 flex justify-center items-center">
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
        <div>
            <h2 className="mb-4 text-xl font-black text-white sm:text-2xl">
              Sign Petition
            </h2>
          <div className='grid lg:grid-cols-3 gap-4 sm:grid-cols-1 md:grid-cols-2'>
              <PetitionList />
          </div>
        </div>
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

  return petitions.map((petition) => {
    return <CardPetition key={petition.tokenId} petition={petition} />;
  });
}