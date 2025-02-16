"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import { Github, Twitter, Wallet, Heart, Loader2 } from "lucide-react";
import { type ChatResponse } from "@/types/chat";
import { useAccount, useSignMessage } from "wagmi";
import { type Address } from "viem";
import {
  connectGitHub,
  connectTwitter,
  connectWallet,
} from "@/services/connections";
import { toast } from "sonner";

type MessageType =
  | { type: "user" | "assistant"; content: string }
  | { type: "github" | "twitter" | "wallet" }
  | {
      type: "criteria";
      criteria: Array<{ title: string; description: string; icon: string }>;
    };

interface ToolCallCheck {
  type: string;
  account_type: string;
}

const isChatResponse = (data: unknown): data is ChatResponse => {
  if (
    typeof data !== "object" ||
    data === null ||
    !("message" in data) ||
    !("chatId" in data) ||
    !("status" in data)
  ) {
    return false;
  }

  const response = data as Record<string, unknown>;

  if (
    typeof response.message !== "string" ||
    typeof response.chatId !== "string" ||
    !["in_progress", "accepted", "rejected"].includes(response.status as string)
  ) {
    return false;
  }

  if (response.toolCalls) {
    if (!Array.isArray(response.toolCalls)) return false;

    for (const call of response.toolCalls) {
      const toolCall = call as ToolCallCheck;
      if (
        typeof toolCall !== "object" ||
        toolCall === null ||
        typeof toolCall.type !== "string" ||
        toolCall.type !== "connection_request" ||
        typeof toolCall.account_type !== "string" ||
        !["github", "twitter", "wallet"].includes(toolCall.account_type)
      ) {
        return false;
      }
    }
  }

  return true;
};

export function AIChatDialog({
  daoName,
  tokenSymbol,
  criteria,
}: {
  daoName: string;
  tokenSymbol: string;
  criteria: Array<{ title: string; description: string; icon: string }>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [status, setStatus] = useState<"in_progress" | "accepted" | "rejected">(
    "in_progress",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState({
    github: false,
    twitter: false,
    wallet: false,
  });
  const [connectedData, setConnectedData] = useState<{
    github?: string;
    twitter?: string;
    wallet?: Address;
  }>({});

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const { address } = useAccount();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const { signMessageAsync } = useSignMessage();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      void handleInitialMessage();
    }
  }, [isOpen]);

  const handleResponse = (data: ChatResponse) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const toolCalls = data.toolCalls ?? [];
    for (const toolCall of toolCalls) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (toolCall.type === "connection_request") {
        setMessages((prev) => [
          ...prev,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          { type: toolCall.account_type as "github" | "twitter" | "wallet" },
        ]);
      }
    }

    setMessages((prev) => [
      ...prev,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      { type: "assistant", content: data.message },
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data.status !== "in_progress") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      setStatus(data.status);
    }
  };

  const handleInitialMessage = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Hi, I'm interested in joining this DAO.",
          daoName,
          tokenSymbol,
          criteria,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Server responded with ${response.status}: ${errorText}`,
          {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
          },
        );
        throw new Error(
          `Failed to send message: ${response.status} ${response.statusText}`,
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await response.json();

      if (!isChatResponse(data)) {
        throw new Error("Invalid response format");
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      setChatId(data.chatId);
      setMessages([
        {
          type: "criteria",
          criteria,
        },
      ]);
      handleResponse(data);
    } catch (error) {
      console.error("Error in handleInitialMessage:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountConnection = async (
    type: "github" | "twitter" | "wallet",
  ) => {
    try {
      let result;
      if (type === "github") {
        result = await connectGitHub();
      } else if (type === "twitter") {
        result = await connectTwitter();
      } else {
        if (!address || !signMessageAsync) {
          toast.error("Please connect your wallet first");
          return;
        }
        result = await connectWallet(async (message) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          const signature = await signMessageAsync({ message });
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return address;
        });
      }

      if (!result.success || !result.data) {
        throw new Error(result.error ?? "Failed to connect account");
      }

      setConnectedAccounts((prev) => ({ ...prev, [type]: true }));
      setConnectedData((prev) => ({ ...prev, ...result.data }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${type} account connected: ${Object.values(result.data)[0]}`,
          chatId,
          daoName,
          tokenSymbol,
          criteria,
          accountConnection: {
            type,
            connected: true,
            data: result.data,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await response.json();

      if (!isChatResponse(data)) {
        throw new Error("Invalid response format");
      }

      handleResponse(data);
    } catch (error) {
      console.error("Error handling account connection:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to connect account",
      );
      setConnectedAccounts((prev) => ({ ...prev, [type]: false }));
      setConnectedData((prev) => {
        const newData = { ...prev };
        delete newData[type];
        return newData;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);

    try {
      setIsLoading(true);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          chatId,
          daoName,
          tokenSymbol,
          criteria,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await response.json();

      if (!isChatResponse(data)) {
        throw new Error("Invalid response format");
      }

      handleResponse(data);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
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
            {messages.map((message, index) => (
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
                      onClick={() =>
                        handleAccountConnection(
                          message.type as "github" | "twitter" | "wallet",
                        )
                      }
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
                          <Github size={18} />{" "}
                          {connectedAccounts.github
                            ? "Connected"
                            : "Connect GitHub"}
                        </>
                      )}
                      {message.type === "twitter" && (
                        <>
                          <Twitter size={18} />{" "}
                          {connectedAccounts.twitter
                            ? "Connected"
                            : "Connect Twitter"}
                        </>
                      )}
                      {message.type === "wallet" && (
                        <>
                          <Wallet size={18} />{" "}
                          {connectedAccounts.wallet
                            ? "Connected"
                            : "Connect Wallet"}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="relative max-w-[80%] rounded-2xl border border-[#3d3470] bg-[#13102b]/80 p-4 text-[#e0d9ff]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#14f195]" />
                    <span>Thinking...</span>
                  </div>
                  <div className="absolute -bottom-1 -left-1 h-4 w-4 rotate-45 border border-l-0 border-t-0 border-[#3d3470] bg-[#13102b]/80" />
                </div>
              </div>
            )}
          </ScrollArea>
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex items-center border-t border-[#3d3470] px-6 pt-4"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={status !== "in_progress" || isLoading}
              className="mr-2 flex-grow rounded-xl border-[#3d3470] bg-[#13102b]/80 text-[#e0d9ff] placeholder:text-[#b3a8e0] focus-visible:ring-1 focus-visible:ring-[#14f195]"
            />
            <Button
              type="submit"
              disabled={status !== "in_progress" || isLoading}
              className="rounded-xl bg-gradient-to-r from-[#14f195] to-[#0dc77b] text-[#13102b] shadow-[0_2px_8px_rgba(20,241,149,0.25)] transition-all duration-300 hover:scale-105 hover:shadow-[0_2px_12px_rgba(20,241,149,0.35)]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
