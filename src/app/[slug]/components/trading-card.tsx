"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  ArrowLeftRight,
  ArrowDown,
  Twitter,
  Search,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type TradingCardProps = {
  dao: {
    tokenSymbol: string;
    tokenPrice: string;
    tokenChange24h: string;
    members: Array<{
      name: string;
      twitter: string;
      avatar: string;
    }>;
  };
};

export default function TradingCard({ dao }: TradingCardProps) {
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [inputAmount, setInputAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Hardcoded exchange rate: 1 ETH = 10 DAO tokens
  const EXCHANGE_RATE = 10;

  const calculatePreview = () => {
    if (!inputAmount || isNaN(Number(inputAmount))) return "0";

    if (orderType === "buy") {
      // For buy: input is ETH, output is DAO tokens
      const ETHAmount = Number(inputAmount);
      return (ETHAmount * EXCHANGE_RATE).toFixed(2);
    } else {
      // For sell: input is percentage, output is ETH
      const percentage = Math.min(Math.max(Number(inputAmount), 0), 100);
      // Assuming user has 1000 tokens for this example
      const userTokens = 1000;
      const tokensToSell = (userTokens * percentage) / 100;
      return (tokensToSell / EXCHANGE_RATE).toFixed(4);
    }
  };

  const filteredMembers = dao.members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.twitter.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Card className="border-[#3d3470] bg-[#211d47]">
      <CardHeader>
        <CardTitle className="text-[#e0d9ff]">
          Trade {dao.tokenSymbol}
        </CardTitle>
        <div className="flex items-center gap-2 text-[#14f195]">
          <TrendingUp className="h-4 w-4" />
          <span>{dao.tokenPrice} USDC</span>
          <span className="text-sm">{dao.tokenChange24h}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={orderType === "buy" ? "default" : "outline"}
              className={
                orderType === "buy"
                  ? "flex-1 bg-[#14f195] text-[#13102b] hover:bg-[#0dc77b]"
                  : "flex-1 border-[#3d3470] text-[#14f195] hover:bg-[#14f195]/10"
              }
              onClick={() => {
                setOrderType("buy");
                setInputAmount("");
              }}
            >
              Buy
            </Button>
            <Button
              variant={orderType === "sell" ? "default" : "outline"}
              className={
                orderType === "sell"
                  ? "flex-1 bg-[#ff3333] text-white hover:bg-[#cc0000]"
                  : "flex-1 border-[#3d3470] text-[#ff3333] hover:bg-[#ff3333]/10"
              }
              onClick={() => {
                setOrderType("sell");
                setInputAmount("");
              }}
            >
              Sell
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-[#b3a8e0]">
              <span>
                {orderType === "buy"
                  ? "Amount (ETH)"
                  : "Amount (% of holdings)"}
              </span>
              {orderType === "sell" && (
                <span>Available: 1000 {dao.tokenSymbol}</span>
              )}
            </div>
            <Input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder={orderType === "buy" ? "0.0" : "0-100"}
              className="border-[#3d3470] bg-[#13102b] text-[#e0d9ff]"
              min={0}
              max={orderType === "sell" ? 100 : undefined}
            />
          </div>

          <div className="flex justify-center py-2">
            <ArrowDown className="h-6 w-6 text-[#b3a8e0]" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-[#b3a8e0]">
              <span>You will receive</span>
              <span className="font-medium text-[#e0d9ff]">
                {calculatePreview()}{" "}
                {orderType === "buy" ? dao.tokenSymbol : "ETH"}
              </span>
            </div>
            <div className="text-xs text-[#b3a8e0]">
              Rate: 1 ETH = {EXCHANGE_RATE} {dao.tokenSymbol}
            </div>
          </div>

          <Button
            className={
              orderType === "buy"
                ? "w-full bg-[#14f195] text-[#13102b] hover:bg-[#0dc77b]"
                : "w-full bg-[#ff3333] text-white hover:bg-[#cc0000]"
            }
            disabled={!inputAmount || isNaN(Number(inputAmount))}
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            {orderType === "buy" ? "Buy" : "Sell"} {dao.tokenSymbol}
          </Button>
        </div>

        <div className="space-y-4 border-t border-[#3d3470] pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-[#e0d9ff]">dAIo Members</h3>
            <span className="text-sm text-[#b3a8e0]">
              {dao.members.length} members
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#3d3470] bg-[#13102b] p-2">
            <Search className="h-5 w-5 text-[#b3a8e0]" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-transparent text-[#e0d9ff] placeholder:text-[#b3a8e0] focus-visible:ring-0"
            />
          </div>
          <ScrollArea className="h-[300px] rounded-lg">
            <div className="grid gap-2 pr-4">
              {filteredMembers.map((member, index) => (
                <Link
                  key={index}
                  href={`https://twitter.com/${member.twitter}`}
                  target="_blank"
                  className="flex items-center gap-3 rounded-lg border border-[#3d3470] bg-[#13102b]/50 p-3 transition-colors hover:border-[#14f195] hover:bg-[#13102b]"
                >
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="flex-1 text-sm text-[#e0d9ff]">
                    {member.name}
                  </span>
                  <span className="text-sm text-[#b3a8e0]">
                    @{member.twitter}
                  </span>
                  <Twitter className="h-4 w-4 text-[#14f195]" />
                </Link>
              ))}
            </div>
            <ScrollBar />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
