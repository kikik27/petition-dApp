'use client'
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CheckCircle2, Users, Calendar, Edit } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConnectButton } from '@rainbow-me/rainbowkit/dist/components/ConnectButton/ConnectButton';
import Image from 'next/image';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "string", name: "imageUrl", type: "string" },
      { internalType: "uint256", name: "startDate", type: "uint256" },
      { internalType: "uint256", name: "endDate", type: "uint256" }
    ],
    name: "createPetition",
    outputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    name: "signPetition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    name: "getPetition",
    outputs: [{
      components: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "string", name: "title", type: "string" },
        { internalType: "string", name: "description", type: "string" },
        { internalType: "string", name: "imageUrl", type: "string" },
        { internalType: "uint256", name: "startDate", type: "uint256" },
        { internalType: "uint256", name: "endDate", type: "uint256" },
        { internalType: "uint256", name: "signatureCount", type: "uint256" },
        { internalType: "bool", name: "isActive", type: "bool" },
        { internalType: "uint256", name: "createdAt", type: "uint256" }
      ],
      internalType: "struct Petition.PetitionData",
      name: "",
      type: "tuple"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTotalPetitions",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "petitionId", type: "uint256" },
      { internalType: "address", name: "signer", type: "address" }
    ],
    name: "hasAddressSigned",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    name: "getSigners",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "petitionId", type: "uint256" }],
    name: "getUpdateLogs",
    outputs: [{
      components: [
        { internalType: "uint256", name: "timestamp", type: "uint256" },
        { internalType: "string", name: "fieldUpdated", type: "string" },
        { internalType: "string", name: "oldValue", type: "string" },
        { internalType: "string", name: "newValue", type: "string" }
      ],
      internalType: "struct Petition.UpdateLog[]",
      name: "",
      type: "tuple[]"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "petitionId", type: "uint256" },
      { internalType: "string", name: "newTitle", type: "string" }
    ],
    name: "updateTitle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "petitionId", type: "uint256" },
      { internalType: "string", name: "newDescription", type: "string" }
    ],
    name: "updateDescription",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "petitionId", type: "uint256" },
      { internalType: "string", name: "newImageUrl", type: "string" }
    ],
    name: "updateImage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

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
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
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

// ============================================
// Create Petition Form Component
// ============================================
function CreatePetitionForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    startDate: '',
    endDate: ''
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      setFormData({ title: '', description: '', imageUrl: '', startDate: '', endDate: '' });
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startTimestamp = Math.floor(new Date(formData.startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(formData.endDate).getTime() / 1000);

    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'createPetition',
      args: [
        formData.title,
        formData.description,
        formData.imageUrl,
        BigInt(startTimestamp),
        BigInt(endTimestamp)
      ]
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Petition</CardTitle>
        <CardDescription>Start a petition and gather support for your cause</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter petition title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your petition in detail"
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {isSuccess && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Petition created successfully!</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Petition'}
          </Button>
        </CardFooter>
      </form>
    </Card>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: total }, (_, i) => (
        <PetitionCard key={i} petitionId={i} userAddress={userAddress} />
      ))}
      {total === 0 && (
        <div className="col-span-full text-center py-20 text-gray-500">
          No petitions yet. Be the first to create one!
        </div>
      )}
    </div>
  );
}

// ============================================
// Petition Card Component
// ============================================
function PetitionCard({ petitionId, userAddress }: { petitionId: number; userAddress?: string }) {
  const [showDetails, setShowDetails] = useState(false);

  type PetitionData = {
    id: bigint;
    owner: string;
    title: string;
    description: string;
    imageUrl: string;
    startDate: bigint;
    endDate: bigint;
    signatureCount: bigint;
    isActive: boolean;
    createdAt: bigint;
  };

  const { data: petition } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getPetition',
    args: [BigInt(petitionId)]
  }) as { data: PetitionData | undefined };

  const { data: hasSigned } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'hasAddressSigned',
    args: [BigInt(petitionId), userAddress as `0x${string}`],
    query: { enabled: !!userAddress }
  });

  const { writeContract, isPending } = useWriteContract();

  if (!petition) return null;

  const { owner, title, description, imageUrl, startDate, endDate, signatureCount, isActive } = petition;

  const handleSign = () => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'signPetition',
      args: [BigInt(petitionId)]
    });
  };

  const isOwner = userAddress?.toLowerCase() === owner.toLowerCase();
  const now = Math.floor(Date.now() / 1000);
  const hasStarted = now >= Number(startDate);
  const hasEnded = now > Number(endDate);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          {imageUrl && (
            <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded-t-lg mb-4" />
          )}
          <CardTitle className="line-clamp-2">{title}</CardTitle>
          <CardDescription className="line-clamp-3">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span className="font-semibold">{Number(signatureCount)} signatures</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Ends {formatDistanceToNow(new Date(Number(endDate) * 1000), { addSuffix: true })}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {isActive && <Badge variant="default">Active</Badge>}
              {hasEnded && <Badge variant="secondary">Ended</Badge>}
              {!!hasSigned && <Badge variant="outline">Signed</Badge>}
              {isOwner && <Badge variant="destructive">Owner</Badge>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            className="flex-1"
            onClick={handleSign}
            disabled={isPending || !!hasSigned || !isActive || !hasStarted || hasEnded}
          >
            {hasSigned ? 'Already Signed' : isPending ? 'Signing...' : 'Sign Petition'}
          </Button>
          <Button variant="outline" onClick={() => setShowDetails(true)}>
            Details
          </Button>
        </CardFooter>
      </Card>

      <PetitionDetailsDialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        petitionId={petitionId}
        isOwner={isOwner}
      />
    </>
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