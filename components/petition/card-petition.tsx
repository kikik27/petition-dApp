import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/constant";
import { useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, Edit, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CardPetition = ({ petitionId, userAddress }: { petitionId: number; userAddress?: string }) => {
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
      <Card className="hover:shadow-lg transition-shadow bg-black/10">
        <CardHeader>
          {imageUrl && (
            <Image src={imageUrl} alt={title} width={500} height={200} className="w-full h-48 object-cover rounded-t-lg mb-4" />
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
              <div key={idx} className="p-3 rounded-lg font-mono text-sm">
                {signer}
              </div>
            ))}
            {(!signers || (signers as any[]).length === 0) && (
              <p className="text-center text-gray-500 py-8">No signatures yet</p>
            )}
          </TabsContent>

          <TabsContent value="updates" className="space-y-2 max-h-96 overflow-y-auto">
            {(updateLogs as any[])?.map((log, idx) => (
              <div key={idx} className="p-3 rounded-lg">
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

export default CardPetition;