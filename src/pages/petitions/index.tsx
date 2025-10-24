'use client'
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import useTheme from '@/stores/theme';
import { debugContractConnection } from '@/lib/debug-contract';
import { testContractRead } from '@/lib/test-contract';

import { usePetitionStore } from '@/stores/petition'
import { CardPetition } from '@/components/petition/card-petition';
import { motion } from 'framer-motion';
import { getCategoryInfo } from '@/lib/utils';
import { PetitionCategory } from '@/types/petition';
import { Sparkles, TrendingUp, Users, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { setLoading } = useTheme();
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const { petitions } = usePetitionStore();

  useEffect(() => {
    if (isConnecting || isReconnecting) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [isConnecting, isReconnecting, setLoading])

  // Calculate stats
  const totalPetitions = petitions.length;
  const activePetitions = petitions.filter(p => !p.isExpired && !p.isCompleted).length;
  const totalSignatures = petitions.reduce((sum, p) => sum + Number(p.signatureCount), 0);

  return (
    <main className="min-h-screen mx-auto p-6 lg:p-8">
      {!isConnected ? (
        <div className="mx-auto max-w-4xl text-center py-40">
          <h1 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Decentralized Petitions for the{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Future of Governance
            </span>
          </h1>
          <p className="text-gray-300 mb-8">Please connect your wallet to create and sign petitions !</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Gradient background blur */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10" />

            <div className="text-center space-y-4 py-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full text-sm text-cyan-300 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4" />
                Empowering Change Through Blockchain
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black">
                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Discover Petitions That
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Shape Our Future
                </span>
              </h1>

              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Join a global community driving real change. Sign petitions, create movements,
                and make your voice heard on the blockchain—transparent, immutable, unstoppable.
              </p>

              {/* Stats */}
              <div className="flex justify-center gap-8 pt-6 flex-wrap">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                    {totalPetitions}
                  </div>
                  <div className="text-gray-500 text-sm flex items-center gap-1 justify-center">
                    <FileText className="w-3.5 h-3.5" />
                    Total Petitions
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                    {activePetitions}
                  </div>
                  <div className="text-gray-500 text-sm flex items-center gap-1 justify-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Active Now
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                    {totalSignatures.toLocaleString()}
                  </div>
                  <div className="text-gray-500 text-sm flex items-center gap-1 justify-center">
                    <Users className="w-3.5 h-3.5" />
                    Signatures
                  </div>
                </motion.div>
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="pt-4"
              >
                <Link href="/petitions/create">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative px-8 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-white font-semibold rounded-xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-2">
                      Start Your Petition
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Filter Section */}
          <CategoryFilter />

          {/* Petitions Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'>
            <PetitionList />
          </div>
        </div>
      )}
    </main>
  );
}

// Category Filter Component
function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState<PetitionCategory | 'ALL'>('ALL');
  const { fetchPetitions, fetchPetitionsByCategory } = usePetitionStore();

  const categories: Array<{ value: PetitionCategory | 'ALL', label: string }> = [
    { value: 'ALL', label: 'All Petitions' },
    { value: 'SOCIAL', label: 'Social' },
    { value: 'POLITICAL', label: 'Political' },
    { value: 'ENVIRONMENTAL', label: 'Environmental' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'HEALTH', label: 'Health' },
    { value: 'HUMAN_RIGHTS', label: 'Human Rights' },
    { value: 'ANIMAL_RIGHTS', label: 'Animal Rights' },
    { value: 'ECONOMIC', label: 'Economic' },
    { value: 'TECHNOLOGY', label: 'Technology' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleCategoryChange = async (category: PetitionCategory | 'ALL') => {
    setSelectedCategory(category);
    if (category === 'ALL') {
      await fetchPetitions();
    } else {
      await fetchPetitionsByCategory(category);
    }
  };

  return (
    <div className="relative">
      {/* Title */}
      <div className="mb-4 border-t border-gray-800/50 pt-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-1">
          Filter by Category
        </h3>
      </div>

      {/* Horizontal Scrollable Filter */}
      <div className="relative overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2">
        <div className="flex gap-3 mt-1 min-w-max">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.value;
            const categoryInfo = category.value !== 'ALL' ? getCategoryInfo(category.value as PetitionCategory) : null;
            const Icon = categoryInfo?.icon;

            return (
              <motion.button
                key={category.value}
                onClick={() => handleCategoryChange(category.value)}
                whileHover={{ scale: 0.95 }}
                whileTap={{ scale: 0.5 }}
                className={`
                  relative px-6 py-3 rounded-xl font-medium text-sm
                  transition-all duration-300 whitespace-nowrap
                  ${isSelected
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-500  text-white border-0'
                    : 'bg-gray-800/30 border border-gray-700/50 text-gray-300 hover:border-cyan-500/50 hover:bg-gray-800/50'
                  }
                `}
              >
                {/* Subtle glow effect on selected - no blur */}
                {isSelected && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl opacity-20" />
                )}

                <span className="relative flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  {category.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


function PetitionList() {
  const { petitions, loading, error, fetchPetitions } = usePetitionStore();
  const { setLoading, setLoadingMessage, setLoadingDescription } = useTheme();

  useEffect(() => {
    // Run debug on mount (only in development)
    if (process.env.NODE_ENV === 'development') {
      debugContractConnection();
    }

    fetchPetitions();
  }, [fetchPetitions]); useEffect(() => {
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
      setLoading(false); // Stop loading on error
      setLoadingMessage("⚠️ Error loading petitions");
      setLoadingDescription(error);
    }
  }, [error, setLoading, setLoadingMessage, setLoadingDescription]);

  // === Render UI ===
  if (loading) return null; // biar loading handled oleh Theme

  // Handle error state
  if (error && !petitions.length) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-lg"
        >
          {/* Error Icon with gradient */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-20 blur-xl" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Oops! Connection Lost
            </h3>
            <p className="text-gray-400 text-base leading-relaxed">
              We couldn't fetch petitions from the blockchain. This might be due to network issues or contract configuration.
            </p>
            <p className="text-gray-500 text-sm font-mono bg-gray-800/30 px-4 py-2 rounded-lg border border-gray-700/50">
              {error}
            </p>
          </div>

          <motion.button
            onClick={() => fetchPetitions()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2 justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Handle empty state (no petitions)
  if (!loading && petitions.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-lg"
        >
          {/* Empty state icon with gradient */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-20 blur-2xl animate-pulse" />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              No Petitions Found
            </h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              The blockchain is empty and waiting for change-makers like you.
              <br />
              <span className="text-cyan-400">Be the first to start a movement!</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Link href="/petitions/create">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative w-full px-8 py-3 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2 justify-center">
                  <Sparkles className="w-5 h-5" />
                  Create Your First Petition
                </span>
              </motion.button>
            </Link>

            <motion.button
              onClick={() => fetchPetitions()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-3 bg-gray-800/30 border border-gray-700/50 text-gray-300 font-medium rounded-xl hover:bg-gray-800/50 hover:border-cyan-500/50 transition-all"
            >
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Petitions
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return petitions.map((petition) => {
    return <CardPetition key={petition.tokenId} petition={petition} />;
  });
}