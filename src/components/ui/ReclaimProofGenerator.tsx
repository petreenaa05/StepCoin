import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  SUPPORTED_FITNESS_PROVIDERS, 
  initiateReclaimProof, 
  calculatePotentialReward,
  formatStepCount,
  FitnessProvider 
} from '../../lib/reclaim';

interface ReclaimProofGeneratorProps {
  onProofComplete?: (stepCount: number, reward: { stepCoins: number; multiplier: number }) => void;
  onClose?: () => void;
}

export const ReclaimProofGenerator: React.FC<ReclaimProofGeneratorProps> = ({
  onProofComplete,
  onClose
}) => {
  const { address } = useAccount();
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [estimatedSteps, setEstimatedSteps] = useState(0);
  const [error, setError] = useState<string>('');

  const handleGenerateProof = async () => {
    if (!selectedProvider || !address) {
      setError('Please select a provider and connect your wallet');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      console.log('🎯 Generating proof for provider:', selectedProvider);
      
      const result = await initiateReclaimProof(selectedProvider, address);
      
      if (result.success && result.redirectUrl) {
        // In a real implementation, this would open the Reclaim widget
        console.log('🌐 Would redirect to:', result.redirectUrl);
        
        // For demo purposes, simulate a successful proof
        setTimeout(() => {
          const mockStepCount = Math.floor(Math.random() * 15000) + 5000; // 5k-20k steps
          const reward = calculatePotentialReward(mockStepCount);
          
          console.log('✅ Mock proof completed:', { stepCount: mockStepCount, reward });
          
          if (onProofComplete) {
            onProofComplete(mockStepCount, reward);
          }
          
          setIsGenerating(false);
        }, 3000);
        
      } else {
        throw new Error(result.error || 'Failed to generate proof');
      }
      
    } catch (err) {
      console.error('❌ Proof generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate proof');
      setIsGenerating(false);
    }
  };

  const potentialReward = calculatePotentialReward(estimatedSteps);

  return (
    <div className="space-y-6" style={{ background: 'var(--primary-black)' }}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2 font-mono">
          Generate Fitness Proof
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Generate zero-knowledge proofs of your fitness data and earn StepCoins
        </p>
      </div>

      {/* Provider Selection */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white font-mono">
          Select Fitness Provider
        </h4>
        
        <div className="grid gap-3">
          {SUPPORTED_FITNESS_PROVIDERS.map((provider: FitnessProvider) => (
            <button
              key={provider.id}
              onClick={() => provider.supported ? setSelectedProvider(provider.id) : null}
              disabled={!provider.supported}
              className={`p-4 rounded-2xl transition-all duration-300 text-left backdrop-blur-lg border ${
                selectedProvider === provider.id
                  ? 'shadow-lg'
                  : provider.supported
                  ? 'hover:scale-105 transform'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              style={
                selectedProvider === provider.id
                  ? {
                      background: 'var(--gradient-pink)',
                      borderColor: 'var(--accent-pink)',
                      boxShadow: '0 10px 25px rgba(247, 6, 112, 0.25)',
                    }
                  : {
                      backgroundColor: 'var(--surface-card)',
                      borderColor: 'var(--surface-border)',
                    }
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg p-2">
                    <img 
                      src={provider.logo} 
                      alt={`${provider.name} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback to icon if logo fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <span className="text-2xl hidden">{provider.icon}</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-white font-mono">{provider.name}</h5>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{provider.description}</p>
                  </div>
                </div>
                {!provider.supported && (
                  <span className="text-xs px-2 py-1 rounded font-mono" style={{ 
                    backgroundColor: 'var(--surface-border)', 
                    color: 'var(--text-secondary)' 
                  }}>
                    Coming Soon
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step Estimation */}
      <div className="space-y-3">
        <label className="block text-sm font-medium font-mono" style={{ color: 'var(--text-secondary)' }}>
          Estimated Daily Steps (for reward preview)
        </label>
        <input
          type="range"
          min="0"
          max="25000"
          step="500"
          value={estimatedSteps}
          onChange={(e) => setEstimatedSteps(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, var(--accent-pink) 0%, var(--accent-pink) ${(estimatedSteps / 25000) * 100}%, var(--surface-border) ${(estimatedSteps / 25000) * 100}%, var(--surface-border) 100%)`
          }}
        />
        <div className="flex justify-between text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
          <span>0</span>
          <span className="text-white font-semibold">
            {formatStepCount(estimatedSteps)} steps
          </span>
          <span>25,000</span>
        </div>
      </div>

      {/* Reward Preview */}
      {estimatedSteps > 0 && (
        <div 
          className="backdrop-blur-lg rounded-2xl p-6 border"
          style={{
            backgroundColor: 'var(--surface-card)',
            borderColor: 'var(--surface-border)',
          }}
        >
          <h5 className="font-semibold text-white mb-4 font-mono">💰 Estimated Reward</h5>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold font-mono" style={{ color: 'var(--accent-pink)' }}>
                {potentialReward.stepCoins} SC
              </p>
              <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                {potentialReward.multiplier}x multiplier applied
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>Base rate:</p>
              <p className="text-sm text-white font-mono">100 steps = 1 SC</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="backdrop-blur-lg rounded-2xl p-4 border" style={{
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          borderColor: 'rgba(220, 38, 38, 0.3)',
        }}>
          <p className="text-red-400 text-sm font-mono">❌ {error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleGenerateProof}
          disabled={!selectedProvider || !address || isGenerating}
          className={`flex-1 py-4 px-8 rounded-xl font-bold transition-all duration-300 transform font-mono ${
            !selectedProvider || !address || isGenerating
              ? 'cursor-not-allowed opacity-50'
              : 'hover:scale-105'
          }`}
          style={
            !selectedProvider || !address || isGenerating
              ? {
                  backgroundColor: 'var(--surface-border)',
                  color: 'var(--text-secondary)',
                }
              : {
                  background: 'var(--gradient-pink)',
                  color: 'white',
                  boxShadow: '0 10px 25px rgba(247, 6, 112, 0.25)',
                }
          }
        >
          {isGenerating ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Proof...</span>
            </div>
          ) : (
            '� Generate Fitness Proof'
          )}
        </button>
        
        {onClose && (
          <button
            onClick={onClose}
            className="px-6 py-4 rounded-xl transition-colors font-mono border"
            style={{
              backgroundColor: 'var(--surface-card)',
              borderColor: 'var(--surface-border)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-center space-y-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
        <p>🔒 Your fitness data is never stored or shared</p>
        <p>✅ Proofs are verified using zero-knowledge cryptography</p>
        <p>⚡ Rewards are calculated based on verified step count</p>
      </div>
    </div>
  );
};