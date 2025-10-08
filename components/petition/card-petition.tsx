import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/constant";
import { useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

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
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          {imageUrl && (
            <Image src={imageUrl} alt={title} className="w-full h-48 object-cover rounded-t-lg mb-4" />
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

      {/* <PetitionDetailsDialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        petitionId={petitionId}
        isOwner={isOwner}
      /> */}
    </>
  );
}

export default CardPetition;