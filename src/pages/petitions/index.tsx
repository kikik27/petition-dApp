'use client'
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Edit } from 'lucide-react';


import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constant';
import CardPetition from '@/components/petition/card-petition';
import CreatePetitionForm from '@/components/petition/create-petition';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [selectedPetition, setSelectedPetition] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="container min-h-screen mx-auto px-4 py-8">
      {!isConnected ? (
        <div className="mx-auto max-w-4xl text-center py-40">
          <h1 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Decentralized Petitions for the{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Future of Governance
            </span>
          </h1>
          <p className="text-gray-400 mb-8">Connect your wallet to create and sign petitions</p>
          <ConnectButton.Custom>
            {
              ({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === 'authenticated');

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-700 hover:to-purple-700" onClick={openConnectModal} type="button">
                            Connect Wallet
                          </Button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <Button className="bg-red-600 text-white hover:bg-red-700" onClick={openChainModal} type="button">
                            Wrong network
                          </Button>
                        );
                      }

                      return (
                        <div style={{ display: 'flex', gap: 12 }}>
                          <Button
                            className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-700 hover:to-purple-700"
                            onClick={openChainModal}
                            style={{ display: 'flex', alignItems: 'center' }}
                            type="button"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 12,
                                  height: 12,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <Image
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    width={12}
                                    height={12}
                                  />
                                )}
                              </div>
                            )}
                            {chain.name}
                          </Button>

                          <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-700 hover:to-purple-700" onClick={openAccountModal} type="button">
                            {account.displayName}
                            {account.displayBalance
                              ? ` (${account.displayBalance})`
                              : ''}
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
          </ConnectButton.Custom>
        </div>
      ) : (
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-700 w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="browse">Browse Petitions</TabsTrigger>
            <TabsTrigger value="create">Create Petition</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <PetitionList
              key={refreshKey}
              onSelectPetition={setSelectedPetition}
              userAddress={address}
            />
          </TabsContent>

          <TabsContent value="create">
            <CreatePetitionForm onSuccess={() => setRefreshKey(prev => prev + 1)} />
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}

function PetitionList({ onSelectPetition, userAddress }: { onSelectPetition: (id: number) => void; userAddress?: string }) {
  const { data: totalPetitions } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getTotalPetitions'
  });

  const total = totalPetitions ? Number(totalPetitions) : 0;

  console.log('Total Petitions:', total);

  return (
    <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: total }, (_, i) => (
        <CardPetition key={i} petitionId={i} userAddress={userAddress} />
      ))}
      {total === 0 && (
        <div className="col-span-full h-screen text-center py-20 text-gray-400">
          No petitions yet. Be the first to create one!
        </div>
      )}
    </div>
  );
}

function PetitionDetailsDialog({
  open,
  onClose,
  petitionId,
  isOwner
}: {
  open: boolean;
  onClose: () => void;
  petitionId: number;
  isOwner: boolean;
}) {
  const { data: signers } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getSigners',
    args: [BigInt(petitionId)],
    query: { enabled: open }
  });

  const { data: updateLogs } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getUpdateLogs',
    args: [BigInt(petitionId)],
    query: { enabled: open }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Petition Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="signers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signers">Signers ({(signers as any[])?.length || 0})</TabsTrigger>
            <TabsTrigger value="updates">Update Logs ({(updateLogs as any[])?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="signers" className="space-y-2 max-h-96 overflow-y-auto">
            {(signers as any[])?.map((signer, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
                {signer}
              </div>
            ))}
            {(!signers || (signers as any[]).length === 0) && (
              <p className="text-center text-gray-500 py-8">No signatures yet</p>
            )}
          </TabsContent>

          <TabsContent value="updates" className="space-y-2 max-h-96 overflow-y-auto">
            {(updateLogs as any[])?.map((log, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Edit className="h-4 w-4" />
                  <span className="font-semibold">{log.fieldUpdated}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(Number(log.timestamp) * 1000).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-gray-600">From: <span className="text-red-600">{log.oldValue}</span></p>
                  <p className="text-gray-600">To: <span className="text-green-600">{log.newValue}</span></p>
                </div>
              </div>
            ))}
            {(!updateLogs || (updateLogs as any[]).length === 0) && (
              <p className="text-center text-gray-500 py-8">No updates yet</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}