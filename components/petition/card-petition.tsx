import { getCategoryInfo, getStateInfo } from "@/lib/utils";
import Image from "next/image";
import { formatDistanceToNow, format, isBefore, isAfter } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { PetitionMetadata } from "@/types";
import Link from "next/link";
import { FileText, TrendingUp, Clock, Users, Calendar, CalendarCheck, CalendarX } from "lucide-react";

export const CardPetition = ({ petition }: { petition: PetitionMetadata }) => {
  console.log(petition.category)
  const categoryInfo = getCategoryInfo(petition.category)
  const stateInfo = getStateInfo(petition.state)
  const Icon = categoryInfo.icon;
  const timeAgo = formatDistanceToNow(petition.createdAt, { addSuffix: true });

  // Date status logic
  const now = new Date();
  const startDate = new Date(petition.startDate);
  const endDate = new Date(petition.endDate);
  const hasStarted = isAfter(now, startDate);
  const hasEnded = isAfter(now, endDate);
  
  // Format dates
  const formattedStartDate = format(startDate, 'MMM dd, yyyy');
  const formattedEndDate = format(endDate, 'MMM dd, yyyy');

  const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1a1a2e" offset="20%" />
      <stop stop-color="#16213e" offset="50%" />
      <stop stop-color="#1a1a2e" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1a1a2e" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

  const toBase64 = (str: string) =>
    typeof window === "undefined"
      ? Buffer.from(str).toString("base64")
      : window.btoa(str);

  return (
    <Link href={`/petitions/${petition.tokenId}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative"
      >
        {/* Futuristic glow border */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-500" />
        
        <Card className="relative bg-gradient-to-br !py-0 from-gray-900/95 via-gray-900/98 to-black/95 border border-gray-800/50 hover:border-cyan-500/50 backdrop-blur-xl rounded-2xl overflow-hidden text-gray-200 transition-all duration-300 cursor-pointer">
          {/* Image with overlay gradient */}
          <div className="relative h-48 overflow-hidden">
            <Image
              src={petition.image}
              alt={petition.title}
              placeholder="blur"
              loading="lazy"
              width={400}
              height={300}
              quality={80}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
            
            {/* Floating badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className={`${stateInfo.color} backdrop-blur-md border-0`}>
                {stateInfo.label}
              </Badge>
              {petition.documents && petition.documents.length > 0 && (
                <Badge className="bg-cyan-500/20 text-cyan-300 backdrop-blur-md border border-cyan-500/30">
                  <FileText className="w-3 h-3 mr-1" />
                  {petition.documents.length}
                </Badge>
              )}
            </div>

            {/* Category badge bottom right */}
            <div className="absolute bottom-3 right-3">
              <Badge className={`${categoryInfo.color} backdrop-blur-md border-0`}>
                <Icon className="w-3 h-3 mr-1" />
                {categoryInfo.label}
              </Badge>
            </div>
          </div>

          <CardHeader className="space-y-3 p-5 pb-3">
            <h3 className="text-xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent line-clamp-2 leading-tight">
              {petition.title}
            </h3>
            
            {/* Creator info with icon */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeAgo}</span>
              <span className="mx-1">•</span>
              <a 
                href={`https://etherscan.io/address/${petition.creator}`}
                className="hover:text-cyan-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {petition.creator.slice(0, 6)}...{petition.creator.slice(-4)}
              </a>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-4">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-3 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Signatures</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {petition.signatureCount}
                  <span className="text-xs text-gray-500 ml-1">/ {petition.targetSignatures}</span>
                </div>
              </div>

              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-3 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Progress</span>
                </div>
                <div className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {petition.progress}%
                </div>
              </div>
            </div>

            {/* Futuristic progress bar */}
            <div className="space-y-2">
              <div className="relative h-2 bg-gray-800/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${petition.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                >
                  {/* Animated glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse" />
                </motion.div>
              </div>
            </div>

            {/* Date Status - Start/End Info */}
            <div className="flex items-center justify-between text-xs border-t border-gray-800/50 pt-3">
              {!hasStarted ? (
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-medium">Starts {formattedStartDate}</span>
                </div>
              ) : hasEnded ? (
                <div className="flex items-center gap-1.5 text-red-400">
                  <CalendarX className="w-3.5 h-3.5" />
                  <span className="font-medium">Ended {formattedEndDate}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-green-400">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span className="font-medium">Active</span>
                </div>
              )}
              
              {!hasEnded && hasStarted && (
                <div className="text-gray-500">
                  Ends {formattedEndDate}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}