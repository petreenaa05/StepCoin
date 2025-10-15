import { useReadContract, useWriteContract } from "wagmi";
import { STEP_COIN_ABI, STEP_COIN_ADDRESS } from "../contracts";

// Hook to read StepCoin balance
export function useStepCoinBalance(address?: `0x${string}`) {
  return useReadContract({
    address: STEP_COIN_ADDRESS as `0x${string}`,
    abi: STEP_COIN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!STEP_COIN_ADDRESS,
    },
  });
}

// Hook to read user activity
export function useUserActivity(address?: `0x${string}`) {
  return useReadContract({
    address: STEP_COIN_ADDRESS as `0x${string}`,
    abi: STEP_COIN_ABI,
    functionName: "getUserActivity",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!STEP_COIN_ADDRESS,
    },
  });
}

// Hook to calculate rewards
export function useCalculateRewards(
  address?: `0x${string}`,
  steps?: number,
  calories?: number,
  distance?: number
) {
  return useReadContract({
    address: STEP_COIN_ADDRESS as `0x${string}`,
    abi: STEP_COIN_ABI,
    functionName: "calculateRewards",
    args:
      address &&
      steps !== undefined &&
      calories !== undefined &&
      distance !== undefined
        ? [address, BigInt(steps), BigInt(calories), BigInt(distance)]
        : undefined,
    query: {
      enabled:
        !!address &&
        steps !== undefined &&
        calories !== undefined &&
        distance !== undefined &&
        !!STEP_COIN_ADDRESS,
    },
  });
}

// Hook to get total supply
export function useStepCoinTotalSupply() {
  return useReadContract({
    address: STEP_COIN_ADDRESS as `0x${string}`,
    abi: STEP_COIN_ABI,
    functionName: "totalSupply",
    query: {
      enabled: !!STEP_COIN_ADDRESS,
    },
  });
}

// Hook to get reward metrics for 1MB.io DataCoin
export function useRewardMetrics() {
  return useReadContract({
    address: STEP_COIN_ADDRESS as `0x${string}`,
    abi: STEP_COIN_ABI,
    functionName: "getRewardMetrics",
    query: {
      enabled: !!STEP_COIN_ADDRESS,
    },
  });
}

// Hook to write to StepCoin contract
export function useStepCoinWrite() {
  return useWriteContract();
}
