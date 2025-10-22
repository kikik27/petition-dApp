"use client";

import { useState, useEffect } from "react";
import { PetitionService } from "@/services/petition";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import useTheme from "@/stores/theme";
import { CONTRACT_ABI_V2, CONTRACT_ABI_V3, CONTRACT_ADDRESS } from "@/constants";
import { Signer } from "@/types";

interface PetitionDetailProps {
  tokenId: string;
}

export default function PetitionDetail({ tokenId }: PetitionDetailProps) {
  const { address } = useAccount();

  const [petition, setPetition] = useState<any | null>(null);
  const [signers, setSigners] = useState<Signer[]>([]);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { setLoading, setLoadingMessage, setLoadingDescription } = useTheme();
  const [signing, setSigning] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPetition();
  }, [tokenId]);

  useEffect(() => {
    PetitionService.getSigners(BigInt(tokenId)).then(setSigners);
  }, [tokenId]);

  async function loadPetition() {
    try {
      setLoading(true);
      setLoadingMessage("Loading petition...");
      setLoadingDescription("Fetching petition details from the blockchain.");
      const data = await PetitionService.getPetitionById(BigInt(tokenId));
      setPetition(data);
    } catch (error) {
      toast.error("Failed to load petition", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSign() {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setSigning(true);
      setLoading(true);
      setLoadingMessage("Signing petition...");
      setLoadingDescription("Please confirm the transaction in your wallet.");

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI_V2,
        functionName: "signPetition",
        args: [tokenId, message],
      });

      setLoadingDescription("Transaction confirmed. Updating petition data...");
      toast.success("Petition signed successfully");
      setMessage("");

      await loadPetition();

    } catch (error: any) {
      const msg = error?.shortMessage || error?.message || "Failed to sign petition";
      toast.error("Transaction failed", { description: msg });
      console.error("Error signing petition:", error);
    } finally {
      setSigning(false);
    }
  }

  async function claimReward() {
    const { data: hasSigned } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI_V3,
      functionName: "hasSigned",
      args: [tokenId, address], // (tokenId, userAddress)
    });

    const { data: claimed } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI_V3,
      functionName: "completionClaimed",
      args: [tokenId, address],
    });

    const { data: bonus } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI_V3,
      functionName: "bonusPerSigner",
      args: [tokenId],
    });

  }

  if (!petition) {
    return (
      <div className="text-center py-10 text-gray-500">
        Petition not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 space-y-4 text-gray-200">
      <h1 className="text-3xl font-bold text-center">{petition.title}</h1>
      <div className="my-4 relative w-full max-w-2xl mx-auto">
        <Image
          src={petition.image}
          alt={petition.title}
          width={800}
          height={400}
          className="rounded-xl w-full aspect-video object-contain bg-gray-900/90"
          priority
        />
      </div>

      {signers.length > 0 && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold">Signers</h2>
          <ul className="list-disc list-inside">
            {signers.map((signer) => (
              <li key={signer.timestamp}>{signer.message}</li>
            ))}
          </ul>
        </div>
      )}

      <Card className="bg-gray-900 border !py-0 border-gray-800 text-gray-200 shadow-xl rounded-xl overflow-hidden max-w-2xl mx-auto">
        <CardHeader>
          <p className="text-gray-400 text-sm">
            Created by {petition.creator.slice(0, 6)}...{petition.creator.slice(-4)}
          </p>
          <p className="text-gray-500 text-sm">
            {petition.category} — {petition.state}
          </p>
        </CardHeader>

        <CardContent>
          <p className="text-gray-300 whitespace-pre-line leading-relaxed">
            {petition.description}
          </p>
          <div className="mt-6">
            <Progress value={parseFloat(petition.progress)} className="h-2" />
            <p className="text-sm text-gray-400 mt-1">
              {petition.signatureCount}/{petition.targetSignatures} signatures ({petition.progress}%)
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Textarea
            placeholder="Add a message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100"
          />

          <Button
            disabled={signing}
            onClick={handleSign}
            className="bg-green-600 hover:bg-green-700 text-white w-full"
          >
            {signing ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" /> Signing...
              </>
            ) : (
              "Sign Petition"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
