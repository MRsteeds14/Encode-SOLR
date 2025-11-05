/**
 * Registration form for new solar producers
 * Fixed system size with automatic navigation
 */

import { useState, useEffect } from 'react';
import { Sun, Lightning, CheckCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegisterProducer } from '@/hooks/useRegisterProducer';
import { toast } from 'sonner';
import { WalletButton } from '@/components/wallet/WalletButton';
import Web3Background from '@/components/dashboard/Web3Background';
import { GlowOrb } from '@/components/dashboard/GlowOrb';

interface RegisterSystemProps {
  walletAddress: string;
  onSuccess: () => void;
}

// Fixed system specs: 10kW with 80 kWh daily production
const FIXED_SYSTEM_CAPACITY = 10; // kW
const FIXED_DAILY_CAP = 80; // kWh (10kW * 8 hours average)

export function RegisterSystem({ walletAddress, onSuccess }: RegisterSystemProps) {
  const { register, isPending, data: txData } = useRegisterProducer();
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);

  // Listen for transaction confirmation
  useEffect(() => {
    if (txData && isWaitingForConfirmation) {
      // Transaction was mined, wait a bit for blockchain to update then navigate
      toast.success('System registered successfully!');
      setTimeout(() => {
        onSuccess();
      }, 3000);
    }
  }, [txData, isWaitingForConfirmation, onSuccess]);

  const handleRegister = async () => {
    try {
      setIsWaitingForConfirmation(true);
      toast.info('Please confirm the transaction in your wallet...');
      
      await register(
        walletAddress,
        FIXED_SYSTEM_CAPACITY,
        FIXED_DAILY_CAP,
        '' // IPFS metadata
      );
      
      toast.success('Transaction submitted! Waiting for confirmation...');
    } catch (error: any) {
      console.error('Registration error:', error);
      setIsWaitingForConfirmation(false);
      
      if (error?.message?.includes('user rejected')) {
        toast.error('Transaction cancelled');
      } else {
        toast.error(error?.message || 'Failed to register system');
      }
    }
  };

  if (isWaitingForConfirmation && txData) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Navigation Bar */}
        <header className="relative z-50 border-b border-border/50 glass-card">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun size={28} weight="fill" className="text-primary" />
                <span className="text-lg font-bold">SOLR-ARC</span>
              </div>
              <WalletButton />
            </div>
          </div>
        </header>

        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <Web3Background />
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <GlowOrb size={200} color="primary" className="mx-auto animate-glow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle size={100} weight="fill" className="text-primary drop-shadow-[0_0_30px_oklch(0.65_0.25_265)]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">Registration Complete!</h2>
            <p className="text-muted-foreground">Loading your dashboard...</p>
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Navigation Bar */}
      <header className="relative z-50 border-b border-border/50 glass-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun size={28} weight="fill" className="text-primary" />
              <span className="text-lg font-bold">SOLR-ARC</span>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      <div className="absolute inset-0 opacity-30">
        <Web3Background />
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <GlowOrb size={120} color="primary" className="mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sun size={60} weight="fill" className="text-primary drop-shadow-[0_0_20px_oklch(0.65_0.25_265)]" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Register Your Solar System
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Join SOLR-ARC and start tokenizing your solar energy
            </p>
          </div>

          {/* Registration Card */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lightning size={24} weight="fill" className="text-primary" />
                Standard Solar System
              </CardTitle>
              <CardDescription>
                Your system will be registered with these specifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet Address Display */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Your Wallet Address</p>
                <div className="p-3 bg-muted/50 rounded-md font-mono text-xs sm:text-sm break-all">
                  {walletAddress}
                </div>
              </div>

              {/* Fixed System Specs */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">System Capacity</p>
                  <p className="text-2xl font-bold text-primary">{FIXED_SYSTEM_CAPACITY} kW</p>
                </div>
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Daily Production Cap</p>
                  <p className="text-2xl font-bold text-primary">{FIXED_DAILY_CAP} kWh</p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Lightning size={16} weight="fill" className="text-secondary" />
                  What happens next?
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Your wallet will be registered as a solar producer</li>
                  <li>✓ You'll be able to mint sARC tokens for your energy</li>
                  <li>✓ Each token represents 1 kWh of solar energy</li>
                  <li>✓ Redeem your tokens for USDC anytime</li>
                </ul>
              </div>

              {/* Register Button */}
              <Button
                onClick={handleRegister}
                className="w-full"
                size="lg"
                disabled={isPending || isWaitingForConfirmation}
              >
                {isPending || isWaitingForConfirmation ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    {isPending ? 'Confirm in Wallet...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Lightning size={20} weight="fill" className="mr-2" />
                    Register My System
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground/60">
                This will submit a transaction to Arc Testnet. You'll need USDC for gas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
