import PetitionDetail from "@/components/petition/petition-detail";
import { useRouter } from "next/router";

export default function PetitionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return null;

  return <PetitionDetail tokenId={id as string} />;
}
