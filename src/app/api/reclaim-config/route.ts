import { NextRequest, NextResponse } from 'next/server';

interface ReclaimConfig {
  applicationId: string;
  providerId: string;
  callbackUrl: string;
  supportedProviders: {
    id: string;
    name: string;
    description: string;
    parameterNames: string[];
  }[];
}

/**
 * GET /api/reclaim-config
 * Returns configuration for Reclaim Protocol integration
 */
export async function GET(request: NextRequest): Promise<NextResponse<ReclaimConfig>> {
  try {
    // Get the base URL for the callback
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const callbackUrl = `${protocol}://${host}/api/reclaim-callback`;

    const config: ReclaimConfig = {
      // TODO: Replace with your actual Reclaim application ID
      applicationId: process.env.RECLAIM_APPLICATION_ID || 'your-app-id-here',
      
      // Default provider ID for fitness data
      providerId: 'google-fit-steps',
      
      // Callback URL where Reclaim will send proofs
      callbackUrl,
      
      // Supported fitness providers
      supportedProviders: [
        {
          id: 'google-fit-steps',
          name: 'Google Fit',
          description: 'Verify daily step count from Google Fit',
          parameterNames: ['steps', 'date']
        },
        {
          id: 'apple-health-steps',
          name: 'Apple Health',
          description: 'Verify daily step count from Apple Health',
          parameterNames: ['stepCount', 'date']
        },
        {
          id: 'fitbit-steps',
          name: 'Fitbit',
          description: 'Verify daily step count from Fitbit',
          parameterNames: ['daily_steps', 'date']
        },
        {
          id: 'samsung-health-steps',
          name: 'Samsung Health',
          description: 'Verify daily step count from Samsung Health',
          parameterNames: ['steps', 'date']
        }
      ]
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error getting Reclaim config:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get Reclaim configuration',
        applicationId: '',
        providerId: '',
        callbackUrl: '',
        supportedProviders: []
      } as any,
      { status: 500 }
    );
  }
}