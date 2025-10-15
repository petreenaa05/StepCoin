import StepCoinArtifact from "../contracts/abis/StepCoin.json";
import ProofVerifierArtifact from "../contracts/abis/ProofVerifier.json";

// Contract addresses from deployment
export const STEP_COIN_ADDRESS =
  process.env.NEXT_PUBLIC_STEP_COIN_CONTRACT_ADDRESS ||
  process.env.STEP_COIN_CONTRACT_ADDRESS ||
  "";
export const PROOF_VERIFIER_ADDRESS =
  process.env.NEXT_PUBLIC_PROOF_VERIFIER_CONTRACT_ADDRESS ||
  process.env.PROOF_VERIFIER_CONTRACT_ADDRESS ||
  "";

// Contract ABIs
export const STEP_COIN_ABI = StepCoinArtifact.abi;
export const PROOF_VERIFIER_ABI = ProofVerifierArtifact.abi;

// Contract configuration for wagmi
export const contracts = {
  stepCoin: {
    address: STEP_COIN_ADDRESS as `0x${string}`,
    abi: STEP_COIN_ABI,
  },
  proofVerifier: {
    address: PROOF_VERIFIER_ADDRESS as `0x${string}`,
    abi: PROOF_VERIFIER_ABI,
  },
} as const;

// Network configuration
export const SUPPORTED_CHAINS = [
  {
    id: 31337,
    name: "Hardhat",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: {
        http: ["http://127.0.0.1:8545"],
      },
    },
  },
  {
    id: 84532,
    name: "Base Sepolia",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: {
        http: ["https://sepolia.base.org"],
      },
    },
    blockExplorers: {
      default: {
        name: "BaseScan",
        url: "https://sepolia.basescan.org",
      },
    },
  },
] as const;
