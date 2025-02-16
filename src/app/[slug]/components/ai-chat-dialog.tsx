"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Wallet, Heart } from "lucide-react";

type MessageType =
  | { type: "user" | "assistant"; content: string }
  | { type: "github" | "twitter" | "wallet" }
  | {
      type: "criteria";
      criteria: Array<{ title: string; description: string; icon: string }>;
    };

const mockMessages: MessageType[] = [
  {
    type: "assistant",
    content: "Welcome to dAIo! I'm here to evaluate your application to join.",
  },
  {
    type: "user",
    content: "Hi! I'm interested in joining this DAO. What do I need to do?",
  },
  {
    type: "assistant",
    content:
      "I'll help assess if you're a good fit for our community. First, let me share our eligibility criteria:",
  },
  {
    type: "criteria",
    criteria: [
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
  },
  {
    type: "assistant",
    content:
      "To verify these criteria, could you please connect your accounts?",
  },
  { type: "github" },
  {
    type: "assistant",
    content:
      "Thanks for connecting your GitHub! I see you're active in blockchain development with several DeFi contributions. I'm particularly impressed by your smart contract work. Would you like to connect your Twitter to show your community engagement?",
  },
  { type: "user", content: "Sure, I'll connect my Twitter account now." },
  { type: "twitter" },
  {
    type: "assistant",
    content:
      "Excellent! I can see you're quite active in the web3 space, with thoughtful discussions about DeFi and governance. Your engagement with other DAOs shows valuable experience. Could you connect your wallet so I can verify your on-chain activity?",
  },
  { type: "wallet" },
  {
    type: "assistant",
    content:
      "Perfect! I've analyzed your profiles and on-chain activity. I can see you've been actively participating in DeFi protocols and have a history of governance voting. You seem like a great fit for our DAO. Could you tell me more about why you want to join and what you hope to contribute?",
  },
  {
    type: "user",
    content:
      "I'm passionate about DeFi governance and have experience in protocol design. I'd love to help shape the future of decentralized finance.",
  },
  {
    type: "assistant",
    content:
      "Your background in protocol design is very relevant to our mission. I see you've also contributed to several improvement proposals in other DAOs. What specific areas of our protocol interest you the most?",
  },
  {
    type: "user",
    content:
      "I'm particularly interested in optimizing the tokenomics model and improving governance participation through better incentive structures.",
  },
  {
    type: "assistant",
    content:
      "Those are exactly the areas we're focusing on! Your experience with incentive design could be valuable for our upcoming governance updates. One last question: how do you think DAOs can better balance decentralization with efficient decision-making?",
  },
  {
    type: "user",
    content:
      "I believe in implementing tiered governance structures with delegated voting for routine decisions, while maintaining full community participation for major protocol changes. This helps maintain both efficiency and decentralization.",
  },
  {
    type: "assistant",
    content:
      "Your understanding of governance dynamics is impressive! Based on your technical background, community engagement, and thoughtful approach to DAO governance, I'm happy to approve your membership. Welcome to the DAO! Would you like me to guide you through the onboarding process?",
  },
];

export function AIChatDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInput("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 bg-[#14f195] px-6 font-medium text-[#13102b] hover:bg-[#0dc77b]">
          Join dAIo
        </Button>
      </DialogTrigger>
      <DialogContent className="border-2 border-[#3d3470] bg-gradient-to-b from-[#211d47] to-[#13102b] shadow-[0_0_15px_rgba(20,241,149,0.1)] backdrop-blur-sm sm:h-full sm:max-h-[90vh] sm:w-full sm:max-w-[90vw]">
        <DialogHeader className="border-b border-[#3d3470] px-6 pb-4">
          <DialogTitle className="text-2xl font-light text-[#e0d9ff]">
            Join dAIo
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-grow flex-col overflow-hidden py-6">
          <ScrollArea className="flex-grow px-6">
            {mockMessages.map((message, index) => (
              <div key={index} className="mb-6 pr-4 last:mb-2">
                {message.type === "user" || message.type === "assistant" ? (
                  <div
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative max-w-[80%] rounded-2xl p-4 ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-[#14f195] to-[#0dc77b] text-[#13102b] shadow-[0_2px_8px_rgba(20,241,149,0.25)]"
                          : "border border-[#3d3470] bg-[#13102b]/80 text-[#e0d9ff] shadow-[0_2px_8px_rgba(19,16,43,0.5)]"
                      }`}
                    >
                      {message.content}
                      <div
                        className={`absolute -bottom-1 ${
                          message.type === "user" ? "-right-1" : "-left-1"
                        } h-4 w-4 rotate-45 ${
                          message.type === "user"
                            ? "bg-[#0dc77b]"
                            : "border border-l-0 border-t-0 border-[#3d3470] bg-[#13102b]/80"
                        }`}
                      />
                    </div>
                  </div>
                ) : message.type === "criteria" ? (
                  <div className="space-y-2 rounded-lg border border-[#3d3470] bg-[#13102b]/80 p-4">
                    {message.criteria.map((criteria, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        {criteria.icon === "github" && (
                          <Github className="mt-1 h-4 w-4 shrink-0 text-[#14f195]" />
                        )}
                        {criteria.icon === "twitter" && (
                          <Twitter className="mt-1 h-4 w-4 shrink-0 text-[#14f195]" />
                        )}
                        {criteria.icon === "wallet" && (
                          <Wallet className="mt-1 h-4 w-4 shrink-0 text-[#14f195]" />
                        )}
                        {criteria.icon === "generic" && (
                          <Heart className="mt-1 h-4 w-4 shrink-0 text-[#14f195]" />
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-[#e0d9ff]">
                            {criteria.title}
                          </h4>
                          <p className="text-xs text-[#b3a8e0]">
                            {criteria.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-start pl-4">
                    <Button
                      variant="outline"
                      className={`group relative flex items-center gap-2 overflow-hidden rounded-xl border-[#3d3470] p-3 transition-all duration-300 hover:scale-105 ${
                        message.type === "github"
                          ? "bg-gradient-to-r from-[#24292e] to-[#1a1f24] text-white hover:border-[#3d3470]/80"
                          : message.type === "twitter"
                            ? "bg-gradient-to-r from-[#1DA1F2] to-[#0c85d0] text-white hover:border-[#3d3470]/80"
                            : "bg-gradient-to-r from-[#3C3C3D] to-[#282829] text-white hover:border-[#3d3470]/80"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      {message.type === "github" && (
                        <>
                          <Github size={18} /> Connect GitHub
                        </>
                      )}
                      {message.type === "twitter" && (
                        <>
                          <Twitter size={18} /> Connect Twitter
                        </>
                      )}
                      {message.type === "wallet" && (
                        <>
                          <Wallet size={18} /> Connect Wallet
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex items-center border-t border-[#3d3470] px-6 pt-4"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="mr-2 flex-grow rounded-xl border-[#3d3470] bg-[#13102b]/80 text-[#e0d9ff] placeholder:text-[#b3a8e0] focus-visible:ring-1 focus-visible:ring-[#14f195]"
            />
            <Button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#14f195] to-[#0dc77b] text-[#13102b] shadow-[0_2px_8px_rgba(20,241,149,0.25)] transition-all duration-300 hover:scale-105 hover:shadow-[0_2px_12px_rgba(20,241,149,0.35)]"
            >
              Send
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
