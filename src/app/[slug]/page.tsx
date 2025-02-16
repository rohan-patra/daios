"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Twitter,
  Search,
  Github,
  Wallet,
  CheckCircle2,
  Heart,
} from "lucide-react";
import CopyButton from "./components/copy-button";
import TradingCard from "./components/trading-card";
import { AIChatDialog } from "./components/ai-chat-dialog";

// Mock data store - replace with actual data fetching
const mockDaos = {
  "defi-governance": {
    name: "DeFi Governance DAO",
    image: "https://i.imgur.com/hBKRN4C.png",
    description: "Decentralized financial protocols governance",
    tokenAddress: "0x1234567890123456789012345678901234567890",
    tokenSymbol: "DGOV",
    tokenPrice: "12.45",
    tokenChange24h: "+5.67%",
    discordUrl: "https://discord.gg/defigovernance",
    eligibilityCriteria: [
      {
        title: "GitHub Activity",
        description:
          "Active contributions to blockchain/DeFi projects, smart contract development experience",
        icon: "github",
      },
      {
        title: "Community Engagement",
        description:
          "Active participation in web3 discussions, meaningful interactions with other DAOs",
        icon: "twitter",
      },
      {
        title: "On-Chain Activity",
        description:
          "History of DeFi protocol usage, governance participation, and responsible token management",
        icon: "wallet",
      },
      {
        title: "Personal Qualities",
        description:
          "Eager to learn and share knowledge about DeFi, passionate about decentralized governance, and committed to collaborative decision-making",
        icon: "generic",
      },
    ],
    members: [
      {
        name: "Alice Crypto",
        twitter: "alicecrypto",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      {
        name: "Bob Blockchain",
        twitter: "bobblockchain",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      },
      {
        name: "Carol Chain",
        twitter: "carolchain",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      },
      {
        name: "David DeFi",
        twitter: "daviddefi",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      },
      {
        name: "Eva Ethereum",
        twitter: "evaethereum",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      },
      {
        name: "Frank Finance",
        twitter: "frankfinance",
        avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      },
      {
        name: "Grace Governance",
        twitter: "gracegovernance",
        avatar: "https://randomuser.me/api/portraits/women/4.jpg",
      },
      {
        name: "Henry Hodl",
        twitter: "henryhodl",
        avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      },
      {
        name: "Ivy Investment",
        twitter: "ivyinvestment",
        avatar: "https://randomuser.me/api/portraits/women/5.jpg",
      },
      {
        name: "Jack Yield",
        twitter: "jackyield",
        avatar: "https://randomuser.me/api/portraits/men/5.jpg",
      },
      {
        name: "Kelly Keys",
        twitter: "kellykeys",
        avatar: "https://randomuser.me/api/portraits/women/6.jpg",
      },
      {
        name: "Liam Liquidity",
        twitter: "liamliquidity",
        avatar: "https://randomuser.me/api/portraits/men/6.jpg",
      },
    ],
  },
  "nft-creators": {
    name: "NFT Creators Guild",
    image: "/placeholder-dao-2.png",
    description: "Digital artists and NFT creators collective",
    tokenAddress: "0x5678901234567890123456789012345678901234",
    tokenSymbol: "NFTG",
    tokenPrice: "8.32",
    tokenChange24h: "-2.14%",
    discordUrl: "https://discord.gg/nftcreators",
    eligibilityCriteria: [
      {
        title: "GitHub Activity",
        description:
          "Experience with NFT smart contracts and marketplace development",
        icon: "github",
      },
      {
        title: "Community Engagement",
        description:
          "Active participation in NFT communities and art collectives",
        icon: "twitter",
      },
      {
        title: "On-Chain Activity",
        description:
          "History of NFT creation, trading, and marketplace participation",
        icon: "wallet",
      },
      {
        title: "Personal Qualities",
        description:
          "Passionate about digital art and NFT innovation, willing to mentor others, and committed to fostering a creative community",
        icon: "generic",
      },
    ],
    members: [
      {
        name: "Charlie Digital",
        twitter: "charliedigital",
        avatar: "https://randomuser.me/api/portraits/men/7.jpg",
      },
      {
        name: "Diana NFT",
        twitter: "dianaNFT",
        avatar: "https://randomuser.me/api/portraits/women/7.jpg",
      },
      {
        name: "Emma Art",
        twitter: "emmaart",
        avatar: "https://randomuser.me/api/portraits/women/8.jpg",
      },
      {
        name: "Felix Pixel",
        twitter: "felixpixel",
        avatar: "https://randomuser.me/api/portraits/men/8.jpg",
      },
      {
        name: "Gina Gallery",
        twitter: "ginagallery",
        avatar: "https://randomuser.me/api/portraits/women/9.jpg",
      },
      {
        name: "Harry Hologram",
        twitter: "harryhologram",
        avatar: "https://randomuser.me/api/portraits/men/9.jpg",
      },
      {
        name: "Iris Illustrator",
        twitter: "irisillustrator",
        avatar: "https://randomuser.me/api/portraits/women/10.jpg",
      },
      {
        name: "Jake JPEG",
        twitter: "jakejpeg",
        avatar: "https://randomuser.me/api/portraits/men/10.jpg",
      },
      {
        name: "Kate Krypto",
        twitter: "katekrypto",
        avatar: "https://randomuser.me/api/portraits/women/11.jpg",
      },
      {
        name: "Leo Layers",
        twitter: "leolayers",
        avatar: "https://randomuser.me/api/portraits/men/11.jpg",
      },
    ],
  },
  "climate-action": {
    name: "Climate Action DAO",
    image: "/placeholder-dao-3.png",
    description: "Funding climate change initiatives",
    tokenAddress: "0x9012345678901234567890123456789012345678",
    tokenSymbol: "CLIM",
    tokenPrice: "15.67",
    tokenChange24h: "+10.45%",
    discordUrl: "https://discord.gg/climateaction",
    eligibilityCriteria: [
      {
        title: "GitHub Activity",
        description:
          "Contributions to environmental impact tracking and sustainability projects",
        icon: "github",
      },
      {
        title: "Community Engagement",
        description:
          "Active involvement in climate action initiatives and environmental communities",
        icon: "twitter",
      },
      {
        title: "On-Chain Activity",
        description:
          "Participation in green crypto initiatives and carbon offset programs",
        icon: "wallet",
      },
      {
        title: "Personal Qualities",
        description:
          "Dedicated to environmental sustainability, eager to educate others about climate action, and committed to driving positive ecological impact",
        icon: "generic",
      },
    ],
    members: [
      {
        name: "Eve Green",
        twitter: "evegreen",
        avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      },
      {
        name: "Frank Earth",
        twitter: "frankearth",
        avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      },
      {
        name: "Grace Garden",
        twitter: "gracegarden",
        avatar: "https://randomuser.me/api/portraits/women/13.jpg",
      },
      {
        name: "Hugo Habitat",
        twitter: "hugohabitat",
        avatar: "https://randomuser.me/api/portraits/men/13.jpg",
      },
      {
        name: "Iris Impact",
        twitter: "irisimpact",
        avatar: "https://randomuser.me/api/portraits/women/14.jpg",
      },
      {
        name: "Jack Justice",
        twitter: "jackjustice",
        avatar: "https://randomuser.me/api/portraits/men/14.jpg",
      },
      {
        name: "Karen Kind",
        twitter: "karenkind",
        avatar: "https://randomuser.me/api/portraits/women/15.jpg",
      },
      {
        name: "Luke Life",
        twitter: "lukelife",
        avatar: "https://randomuser.me/api/portraits/men/15.jpg",
      },
      {
        name: "Maya Mother",
        twitter: "mayamother",
        avatar: "https://randomuser.me/api/portraits/women/16.jpg",
      },
      {
        name: "Noah Nature",
        twitter: "noahnature",
        avatar: "https://randomuser.me/api/portraits/men/16.jpg",
      },
    ],
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default function DaoPage({ params }: Props) {
  const { slug } = use(params);
  const dao = mockDaos[slug as keyof typeof mockDaos];
  const [searchQuery, setSearchQuery] = useState("");

  if (!dao) {
    notFound();
  }

  const filteredMembers = dao.members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.twitter.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-[#1a1635] p-8 text-[#e0d9ff]">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src={dao.image}
              alt={`${dao.name} Logo`}
              width={100}
              height={100}
              className="rounded-full"
            />
            <div>
              <h1 className="text-3xl font-bold">{dao.name}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[#b3a8e0]">Token Address:</span>
                <code className="rounded bg-[#13102b] px-2 py-1 text-sm">
                  {`${dao.tokenAddress.slice(0, 6)}...${dao.tokenAddress.slice(-4)}`}
                </code>
                <CopyButton text={dao.tokenAddress} />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <AIChatDialog
              daoName={dao.name}
              tokenSymbol={dao.tokenSymbol}
              criteria={dao.eligibilityCriteria}
            />
            <Button
              variant="outline"
              className="h-11 border-[#3d3470] bg-[#6064f4] px-6 font-medium text-white hover:bg-transparent hover:text-white"
              asChild
            >
              <Link
                href={dao.discordUrl}
                target="_blank"
                className="inline-flex h-[44px] w-full items-center justify-center gap-2"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0"
                >
                  <circle
                    cx="512"
                    cy="512"
                    r="512"
                    style={{ fill: "#5865f2" }}
                  />
                  <path
                    d="M689.43 349a422.21 422.21 0 0 0-104.22-32.32 1.58 1.58 0 0 0-1.68.79 294.11 294.11 0 0 0-13 26.66 389.78 389.78 0 0 0-117.05 0 269.75 269.75 0 0 0-13.18-26.66 1.64 1.64 0 0 0-1.68-.79A421 421 0 0 0 334.44 349a1.49 1.49 0 0 0-.69.59c-66.37 99.17-84.55 195.9-75.63 291.41a1.76 1.76 0 0 0 .67 1.2 424.58 424.58 0 0 0 127.85 64.63 1.66 1.66 0 0 0 1.8-.59 303.45 303.45 0 0 0 26.15-42.54 1.62 1.62 0 0 0-.89-2.25 279.6 279.6 0 0 1-39.94-19 1.64 1.64 0 0 1-.16-2.72c2.68-2 5.37-4.1 7.93-6.22a1.58 1.58 0 0 1 1.65-.22c83.79 38.26 174.51 38.26 257.31 0a1.58 1.58 0 0 1 1.68.2c2.56 2.11 5.25 4.23 8 6.24a1.64 1.64 0 0 1-.14 2.72 262.37 262.37 0 0 1-40 19 1.63 1.63 0 0 0-.87 2.28 340.72 340.72 0 0 0 26.13 42.52 1.62 1.62 0 0 0 1.8.61 423.17 423.17 0 0 0 128-64.63 1.64 1.64 0 0 0 .67-1.18c10.68-110.44-17.88-206.38-75.7-291.42a1.3 1.3 0 0 0-.63-.63zM427.09 582.85c-25.23 0-46-23.16-46-51.6s20.38-51.6 46-51.6c25.83 0 46.42 23.36 46 51.6.02 28.44-20.37 51.6-46 51.6zm170.13 0c-25.23 0-46-23.16-46-51.6s20.38-51.6 46-51.6c25.83 0 46.42 23.36 46 51.6.01 28.44-20.17 51.6-46 51.6z"
                    style={{ fill: "#fff" }}
                  />
                </svg>
                <span>Discord</span>
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-8 md:col-span-2">
            <Card className="border-[#3d3470] bg-[#211d47]">
              <CardHeader>
                <CardTitle className="text-[#e0d9ff]">
                  {dao.tokenSymbol} Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full overflow-hidden rounded-lg">
                  <iframe
                    src="https://www.gmgn.cc/kline/eth/0x6982508145454ce325ddbe47a25d4ec3d2311933"
                    className="h-full w-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#3d3470] bg-[#211d47]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#e0d9ff]">
                  <CheckCircle2 className="h-5 w-5 text-[#14f195]" />
                  Eligibility Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {dao.eligibilityCriteria.map((criteria, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border border-[#3d3470] bg-[#13102b]/50 p-4"
                    >
                      {criteria.icon === "github" && (
                        <Github className="mt-1 h-5 w-5 shrink-0 text-[#14f195]" />
                      )}
                      {criteria.icon === "twitter" && (
                        <Twitter className="mt-1 h-5 w-5 shrink-0 text-[#14f195]" />
                      )}
                      {criteria.icon === "wallet" && (
                        <Wallet className="mt-1 h-5 w-5 shrink-0 text-[#14f195]" />
                      )}
                      {criteria.icon === "generic" && (
                        <Heart className="mt-1 h-5 w-5 shrink-0 text-[#14f195]" />
                      )}
                      <div>
                        <h3 className="font-medium text-[#e0d9ff]">
                          {criteria.title}
                        </h3>
                        <p className="text-sm text-[#b3a8e0]">
                          {criteria.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <TradingCard dao={dao} />
        </div>
      </div>
    </main>
  );
}
