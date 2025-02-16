import { type Metadata } from "next";
import { use } from "react";

// Mock data store - replace with actual data fetching
const mockDaos = {
  "defi-governance": {
    name: "DeFi Governance DAO",
    description: "Decentralized financial protocols governance",
  },
  "nft-creators": {
    name: "NFT Creators Guild",
    description: "Digital artists and NFT creators collective",
  },
  "climate-action": {
    name: "Climate Action DAO",
    description: "Funding climate change initiatives",
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dao = mockDaos[slug as keyof typeof mockDaos];

  if (!dao) {
    return {
      title: "DAO Not Found",
      description: "The requested DAO does not exist.",
    };
  }

  return {
    title: `${dao.name} - dAIos Platform`,
    description: dao.description,
  };
}

export default function DaoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
