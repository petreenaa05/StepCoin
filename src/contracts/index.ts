// Contract ABIs and addresses
import StepCoinABI from "./abis/StepCoin.json";
import ProofVerifierABI from "./abis/ProofVerifier.json";

// Contract addresses from environment variables
export const STEP_COIN_ADDRESS = process.env
  .NEXT_PUBLIC_STEP_COIN_CONTRACT_ADDRESS as `0x${string}`;
export const PROOF_VERIFIER_ADDRESS = process.env
  .NEXT_PUBLIC_PROOF_VERIFIER_CONTRACT_ADDRESS as `0x${string}`;

// Export ABIs
export const STEP_COIN_ABI = StepCoinABI.abi;
export const PROOF_VERIFIER_ABI = ProofVerifierABI.abi;

// Contract configurations for wagmi
export const stepCoinConfig = {
  address: STEP_COIN_ADDRESS,
  abi: STEP_COIN_ABI,
} as const;

export const proofVerifierConfig = {
  address: PROOF_VERIFIER_ADDRESS,
  abi: PROOF_VERIFIER_ABI,
} as const;
