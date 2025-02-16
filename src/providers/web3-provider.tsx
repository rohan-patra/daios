"use client";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { WagmiProvider } from "wagmi";
import { type ReactNode } from "react";
import { sepolia } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

const metadata = {
  name: "dAIo",
  description: "AI-powered DAO membership evaluation",
  url: "https://daio.xyz",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Configure Sepolia with custom RPC URL
const customSepolia = {
  ...sepolia,
  rpcUrls: {
    ...sepolia.rpcUrls,
    default: {
      http: ["https://ethereum-sepolia-rpc.publicnode.com"],
    },
    public: {
      http: ["https://ethereum-sepolia-rpc.publicnode.com"],
    },
  },
};

const chains = [customSepolia];
const config = defaultWagmiConfig({ chains, projectId, metadata });
const queryClient = new QueryClient();

createWeb3Modal({ wagmiConfig: config, projectId, chains });

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
