"use client";
import { useState, useEffect, useCallback } from "react";
import { PetitionService } from "@/services/petition";
import { publicClient } from "@/lib/wagmi-client";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Users,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Share2,
  Flag,
  MessageSquare,
  Heart,
  FileText,
  Download,
  ExternalLink
} from "lucide-react";
import Image from "next/image";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import useTheme from "@/stores/theme";
import { CONTRACT_ABI_V2, CONTRACT_ABI_V3, CONTRACT_ADDRESS } from "@/constants";
import { PetitionMetadata, Signer } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getCategoryInfo, getStateInfo } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface PetitionDetailProps {
  tokenId: string;
}

export default function PetitionDetail({ tokenId }: PetitionDetailProps) {
  const { address } = useAccount();
  const [petition, setPetition] = useState<PetitionMetadata | null>(null);
  const [signers, setSigners] = useState<Signer[]>([]);
  const hasSigned = signers.some(signer => signer.signer.toLowerCase() === address?.toLowerCase());
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { setLoading, setLoadingMessage, setLoadingDescription } = useTheme();
  const [signing, setSigning] = useState(false);
  const [waitingForEvent, setWaitingForEvent] = useState(false);
  const [message, setMessage] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const loadPetition = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingMessage("Loading petition...");
      setLoadingDescription("Fetching petition details from the blockchain.");
      const data = await PetitionService.getPetitionById(tokenId);
      setPetition(data);
    } catch (error) {
      toast.error("Failed to load petition", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }, [setLoading, setLoadingMessage, setLoadingDescription, tokenId]);

  useEffect(() => {
    loadPetition();
  }, [loadPetition]);

  useEffect(() => {
    if (petition?.id) {
      PetitionService.getSigners(petition.id).then(setSigners);
    }
  }, [petition?.id]);

  // Auto-slide for signers carousel
  useEffect(() => {
    if (signers.length <= 4) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(1, signers.length - 3));
    }, 3000);

    return () => clearInterval(interval);
  }, [signers.length]);

  async function handleSign() {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (hasSigned) {
      toast.info("You've already signed this petition");
      return;
    }

    if (!petition?.id) {
      toast.error("Petition ID not found");
      return;
    }

    setSigning(true);
    setLoading(true);
    setWaitingForEvent(true);
    setLoadingMessage("Signing petition...");
    setLoadingDescription("Please confirm the transaction in your wallet.");

    // Use petition.id (bytes32) not tokenId
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI_V2,
      functionName: "signPetition",
      args: [petition.id as `0x${string}`, message || ""],
    });
  }

  // Listen to PetitionSigned event
  useEffect(() => {
    if (!hash || !waitingForEvent) return;

    const listenForSignEvent = async () => {
      try {
        setLoadingMessage("Waiting for Event...");
        setLoadingDescription("Listening to smart contract event PetitionSigned");

        const unwatch = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI_V2,
          eventName: "PetitionSigned",
          onLogs: async (logs: any[]) => {
            const log = logs[0];
            if (log && log.transactionHash === hash) {
              const signatureCount = log.args.signatureCount?.toString();

              toast.success("Petition signed successfully!", {
                description: `Thank you for your support! Total signatures: ${signatureCount}`
              });

              setMessage("");
              setLoading(false);
              setSigning(false);
              setWaitingForEvent(false);

              // Reload petition and signers
              await loadPetition();
              if (petition?.id) {
                await PetitionService.getSigners(petition.id).then(setSigners);
              }

              unwatch();
            }
          },
        });

        // Timeout after 30 seconds
        setTimeout(() => {
          unwatch();
          if (waitingForEvent) {
            toast.warning("Event timeout", {
              description: "Transaction confirmed but event not received. Please refresh."
            });
            setLoading(false);
            setSigning(false);
            setWaitingForEvent(false);
          }
        }, 30000);
      } catch (err) {
        console.error("Error listening for sign event:", err);
        setLoading(false);
        setSigning(false);
        setWaitingForEvent(false);
      }
    };

    listenForSignEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, waitingForEvent, tokenId, petition?.id, loadPetition, setLoading, setLoadingMessage, setLoadingDescription]);

  // Handle write errors from smart contract
  useEffect(() => {
    if (writeError) {
      console.log("Write error detected:", writeError); // Debug log

      // Check if user rejected the transaction
      const errorMsg = writeError?.message || "";
      const isRejected = errorMsg.includes("User rejected") ||
        errorMsg.includes("user rejected") ||
        errorMsg.includes("User denied") ||
        (writeError as any)?.code === 4001 ||
        (writeError as any)?.code === "ACTION_REJECTED";

      if (isRejected) {
        toast.info("Transaction Cancelled", {
          description: "You cancelled the transaction."
        });
      } else {
        // Use getReadableError for user-friendly messages
        const { getReadableError } = require("@/lib/utils");
        const friendlyMsg = getReadableError(writeError);

        toast.error("Transaction Failed", {
          description: friendlyMsg
        });
      }

      // Reset all loading states
      setSigning(false);
      setLoading(false);
      setWaitingForEvent(false);
      setLoadingMessage("");
      setLoadingDescription("");
    }
  }, [writeError, setLoading, setLoadingMessage, setLoadingDescription]);

  if (!petition) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading petition...</p>
        </div>
      </div>
    );
  }
  const isCompleted = petition.state === "COMPLETED";
  const isExpired = petition.state === "CANCELLED" || (petition.endDate && new Date() > new Date(petition.endDate));
  const canSign = !hasSigned && !isCompleted && !isExpired;
  const progressPercentage = parseFloat(petition.progress);

  const categoryInfo = getCategoryInfo(petition.category);
  const stateInfo = getStateInfo(petition.state);
  const Icon = categoryInfo.icon;

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative">
        <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden border-2 border-gray-900 shadow-2xl">
          <Image
            src={petition.image}
            alt={petition.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <Badge className={stateInfo.color}>{stateInfo.label}</Badge>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h1 className="text-xl md:text-4xl font-bold text-white drop-shadow-lg mb-3">
              {petition.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-white/90">
              <Badge className={categoryInfo.color}>
                <Icon className="w-3 h-3 mr-1 inline" /> {categoryInfo.label}
              </Badge>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                <span>{petition.signatureCount} supporters</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          <Card className="bg-black/10 shadow-lg !gap-2">
            <CardHeader>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                About This Petition
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {petition.description}
              </p>
            </CardContent>
          </Card>

          {/* Supporting Documents (if any) */}
          {petition.documents && petition.documents.length > 0 && (
            <Card className="bg-black/10 shadow-lg">
              <CardHeader>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  Supporting Documents ({petition.documents.length})
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Additional materials and evidence supporting this petition
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {petition.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/5 hover:bg-muted/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = doc.url;
                          link.download = doc.name;
                          link.target = '_blank';
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Progress Section */}
          <Card className="bg-black/10 shadow-lg">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Petition Progress</h3>
                </div>
                <span className="text-xl font-bold text-primary">
                  {petition.progress}%
                </span>
              </div>

              <Progress value={progressPercentage} className="h-3" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{petition.signatureCount}</strong> signatures
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Goal: <strong className="text-foreground">{petition.targetSignatures}</strong>
                </span>
              </div>

              {isCompleted && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      Victory! This petition has succeeded! 🎉
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Thank you to all {petition.signatureCount} supporters who made this possible.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Signers Carousel */}
          {signers.length > 0 && (
            <Card className="bg-black/10 shadow-lg overflow-hidden">
              <CardHeader>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Recent Supporters ({signers.length})
                </h2>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="relative overflow-hidden">
                  <div
                    className="flex gap-4 transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * (100 / Math.min(4, signers.length))}%)` }}
                  >
                    {signers.map((signer, index) => (
                      <div
                        key={index}
                        className="min-w-[calc(100%/4-12px)] md:min-w-[calc(100%/4-12px)]"
                      >
                        <Card className="bg-muted/10 border h-full">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border-2 border-primary/20">
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {signer?.signer ? signer.signer.slice(2, 4).toUpperCase() : '??'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-mono text-muted-foreground truncate">
                                  {signer?.signer ? `${signer.signer.slice(0, 6)}...${signer.signer.slice(-4)}` : 'Unknown'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {signer?.timestamp ? formatDistanceToNow(new Date(Number(signer.timestamp) * 1000), { addSuffix: true }) : 'Unknown time'}
                                </p>
                              </div>
                            </div>
                            {signer.message && (
                              <p className="text-sm text-muted-foreground uppercase line-clamp-2">
                                {signer.message}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>

                  {/* Carousel Indicators */}
                  {signers.length > 4 && (
                    <div className="flex justify-center gap-2 mt-4">
                      {Array.from({ length: Math.max(1, signers.length - 3) }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx
                            ? 'bg-primary w-6'
                            : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                            }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Sign Petition Card */}
          {canSign ? (
            <Card className="shadow-xl bg-black/10 !gap-3">
              <CardHeader className="">
                <h3 className="text-xl font-bold">Support This Petition</h3>
                <p className="text-sm text-muted-foreground">
                  Add your voice to this important cause
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Share why this matters to you (optional)..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {message.length}/500 characters
                </p>
              </CardContent>
              <CardFooter>
                {!address ? (
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <Button
                        onClick={openConnectModal}
                        className="w-full bg-gray-50/7 hover:bg-gray-50/3 p-4 border text-white"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Connect Wallet
                      </Button>
                    )}
                  </ConnectButton.Custom>
                ) : (
                  <Button
                    disabled={signing}
                    variant="outline"
                    onClick={handleSign}
                    className="w-full"
                  >
                    {signing ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        Signing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Sign Petition
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : hasSigned ? (
            <Card className="bg-green-500/10 shadow-xl">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
                    You&apos;ve Signed This!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Thank you for your support. Share this petition to gather more signatures!
                  </p>
                </div>
                {/* <Separator /> */}
                {/* {isCompleted && typeof bonus === 'bigint' && !claimed && (
                  <div className="space-y-3">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                      <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-center">
                        Reward Available!
                      </p>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        {bonus?.toString()} tokens
                      </p>
                    </div>
                    <Button onClick={claimReward} className="w-full" variant="outline">
                      <Award className="w-4 h-4 mr-2" />
                      Claim Reward
                    </Button>
                  </div>
                )}
                {Boolean(claimed) && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-sm text-center text-green-700 dark:text-green-400">
                      ✨ Reward claimed!
                    </p>
                  </div>
                )} */}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-black/10 shadow-xl">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <Flag className="w-10 h-10 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {isCompleted ? "Petition Completed" : "Petition Closed"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isCompleted
                      ? "This petition has reached its goal and is now closed."
                      : "This petition has expired and is no longer accepting signatures."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Petition Info */}
          <Card className="bg-black/10 shadow-lg">
            <CardHeader>
              <h3 className="font-bold">Petition Details</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Created by</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {petition.creator.slice(0, 10)}...{petition.creator.slice(-8)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-sm font-medium">Start Date</p>
                      <p className="text-xs text-muted-foreground">
                        {petition.startDate ? new Date(petition.startDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">End Date</p>
                      <p className="text-xs text-muted-foreground">
                        {petition.endDate ? new Date(petition.endDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {petition.tags && petition.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {petition.tags.map((tag: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Share Card */}
          <Card className="bg-black/10 shadow-lg !gap-2">
            <CardHeader>
              <h3 className="font-bold flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Share & Spread
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Help this petition reach more people
              </p>

              {/* QR Code */}
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`}
                  alt="QR Code"
                  width={150}
                  height={150}
                />
              </div>

              <Button variant="outline" className="w-full" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
              }}>
                <Share2 className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}