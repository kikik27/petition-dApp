import { getCategoryInfo, getStateInfo } from "@/lib/utils";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { PetitionMetadata } from "@/types";

export const CardPetition = ({ petition }: { petition: PetitionMetadata }) => {
  const categoryInfo = getCategoryInfo(petition.category)
  const stateInfo = getStateInfo(petition.state)
  const Icon = categoryInfo.icon;
  const timeAgo = formatDistanceToNow(petition.createdAt, { addSuffix: true });

  const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

  const toBase64 = (str: string) =>
    typeof window === "undefined"
      ? Buffer.from(str).toString("base64")
      : window.btoa(str);

  return (
    <motion.div
      key={petition.tokenId}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 120 }}
    >
      <Card className="bg-gray-900/60 border !gap-1 !py-0 border-gray-800 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden text-gray-200">
        <Image
          src={petition.image}
          alt={petition.title}
          placeholder="blur"
          loading="lazy"
          width={400}
          height={300}
          quality={80}
          className="h-48 w-full object-cover rounded-t-2xl"
          blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
        />

        <CardHeader className="flex flex-col space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge className={stateInfo.color}>{stateInfo.label}</Badge>
            <Badge className={categoryInfo.color}>
              <Icon className="w-3 h-3 mr-1 inline" /> {categoryInfo.label}
            </Badge>
          </div>
          <h3 className="text-lg font-bold">{petition.title}</h3>
          <a href={`https://etherscan.io/address/${petition.creator}`} className="text-xs text-gray-400">
            Created {timeAgo} by {petition.creator.slice(0, 6)}...{petition.creator.slice(-4)}
          </a>
        </CardHeader>

        <Separator className="bg-gray-800" />

        <CardContent className="p-4 space-y-2">
          <p className="text-sm text-gray-300 line-clamp-3">{petition.description}</p>
          <div className="text-sm text-gray-400">
            Target: {petition.targetSignatures} | Signatures: {petition.signatureCount}
          </div>

          <Progress value={Number(petition.progress)} className="h-2 bg-gray-800 mt-2" />
          <p className="text-xs text-gray-500">{petition.progress}% reached</p>
        </CardContent>
        <Separator className="bg-gray-800" />
        <CardFooter className="p-4 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <div>Start: {petition.startDate.toLocaleDateString()}</div>
            <div>End: {petition.endDate.toLocaleDateString()}</div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-green-600 hover:bg-green-700 text-white text-sm">
              Sign
            </Button>
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 text-sm"
            >
              View
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}