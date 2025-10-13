/**
 * Reclaim Protocol Integration Utilities
 * Handles the frontend integration with Reclaim Protocol for fitness data verification
 */

export interface ReclaimProofRequest {
  applicationId: string;
  providerId: string;
  callbackUrl: string;
  userWallet?: string;
}

export interface ReclaimProofResponse {
  success: boolean;
  stepCount?: number;
  reward?: {
    stepCoins: number;
    multiplier: number;
  };
  error?: string;
  proofId?: string;
}

export interface FitnessProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  logo: string;
  supported: boolean;
}

/**
 * Supported fitness providers for Reclaim Protocol
 */
export const SUPPORTED_FITNESS_PROVIDERS: FitnessProvider[] = [
  {
    id: 'google-fit-steps',
    name: 'Google Fit',
    description: 'Verify your daily steps from Google Fit',
    icon: '🔍',
    logo: 'https://developers.google.com/static/fit/images/google-fit-logo.svg',
    supported: true
  },
  {
    id: 'apple-health-steps',
    name: 'Apple Health',
    description: 'Verify your daily steps from Apple Health',
    icon: '🍎',
    logo: 'https://developer.apple.com/assets/elements/icons/healthkit/healthkit-96x96_2x.png',
    supported: true
  },
  {
    id: 'fitbit-steps',
    name: 'Fitbit',
    description: 'Verify your daily steps from Fitbit',
    icon: '⌚',
    logo: 'https://logo.clearbit.com/fitbit.com',
    supported: true
  },
  {
    id: 'samsung-health-steps',
    name: 'Samsung Health',
    description: 'Verify your daily steps from Samsung Health',
    icon: '📱',
    logo: 'https://img.icons8.com/color/48/samsung-health.png',
    supported: false // Not yet implemented
  }
];

/**
 * Initiate Reclaim Protocol proof generation
 * This would typically open the Reclaim widget or redirect to Reclaim's proof generation flow
 */
export async function initiateReclaimProof(
  providerId: string, 
  userWallet: string
): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  try {
    // Get Reclaim configuration
    const configResponse = await fetch('/api/reclaim-config');
    if (!configResponse.ok) {
      throw new Error('Failed to get Reclaim configuration');
    }
    
    const config = await configResponse.json();
    
    // In a real implementation, this would:
    // 1. Initialize the Reclaim SDK
    // 2. Create a proof request with the specified provider
    // 3. Return a URL or open the Reclaim widget
    
    console.log('🚀 Initiating Reclaim proof for provider:', providerId);
    console.log('📋 Config:', config);
    
    // TODO: Replace with actual Reclaim SDK integration
    // const reclaimApp = await Reclaim.init(config.applicationId);
    // const request = reclaimApp.buildHttpsRequest(providerId);
    // const redirectUrl = await request.generateProofUrl();
    
    // For now, return a mock response
    const mockRedirectUrl = `https://reclaim.example.com/prove?provider=${providerId}&callback=${encodeURIComponent(config.callbackUrl)}&wallet=${userWallet}`;
    
    return {
      success: true,
      redirectUrl: mockRedirectUrl
    };
    
  } catch (error) {
    console.error('❌ Error initiating Reclaim proof:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if a proof has been submitted and processed
 * In a real implementation, this would query your backend for proof status
 */
export async function checkProofStatus(proofId: string): Promise<ReclaimProofResponse> {
  try {
    // TODO: Implement actual proof status checking
    // This would typically query your backend database for proof status
    
    console.log('🔍 Checking proof status:', proofId);
    
    // Mock response for development
    return {
      success: false,
      error: 'Proof status checking not yet implemented'
    };
    
  } catch (error) {
    console.error('❌ Error checking proof status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Calculate potential StepCoin rewards based on step count
 * This mirrors the calculation logic in the backend
 */
export function calculatePotentialReward(stepCount: number): { stepCoins: number; multiplier: number } {
  let baseReward = stepCount / 100;
  let multiplier = 1;

  // Progressive bonuses (same as backend)
  if (stepCount >= 20000) {
    multiplier = 3;
  } else if (stepCount >= 15000) {
    multiplier = 2.5;
  } else if (stepCount >= 10000) {
    multiplier = 2;
  } else if (stepCount >= 5000) {
    multiplier = 1.5;
  }

  const stepCoins = Math.round(baseReward * multiplier * 100) / 100;
  return { stepCoins, multiplier };
}

/**
 * Format step count with proper thousands separators
 */
export function formatStepCount(steps: number): string {
  return new Intl.NumberFormat().format(steps);
}

/**
 * Get user-friendly provider name
 */
export function getProviderDisplayName(providerId: string): string {
  const provider = SUPPORTED_FITNESS_PROVIDERS.find(p => p.id === providerId);
  return provider?.name || providerId;
}