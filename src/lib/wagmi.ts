import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "wagmi/chains";
import { defineChain } from "viem";

// Define Hardhat local network
export const hardhat = defineChain({
  id: 31337,
  name: "Hardhat",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
});

export const config = getDefaultConfig({
  appName: "StepCoin DataCoin",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "default_project_id",
  chains: [hardhat, sepolia, base, polygon, mainnet, optimism, arbitrum],
  ssr: false, // Changed to false for client-side rendering
});
