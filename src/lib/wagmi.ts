import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "StepCoin DataCoin",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "default_project_id",
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: false, // Changed to false for client-side rendering
});
