/**
 * Universal Navigation Bar
 * Mobile-friendly navigation with wallet connection
 */

import { Sun, List, X } from '@phosphor-icons/react';
import { WalletButton } from '@/components/wallet/WalletButton';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  showTabs?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Navigation({ showTabs = false, activeTab, onTabChange }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'mint', label: 'Mint' },
    { id: 'redeem', label: 'Redeem' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <header className="relative z-50 border-b border-border/50 glass-card sticky top-0">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md"></div>
              <div className="relative p-1.5 bg-primary/10 rounded-lg border border-primary/30">
                <Sun size={24} weight="fill" className="text-primary drop-shadow-[0_0_10px_oklch(0.65_0.25_265)]" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SOLR-ARC
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Solar Energy Tokenization</p>
            </div>
          </div>

          {/* Desktop Tabs */}
          {showTabs && (
            <nav className="hidden md:flex items-center gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onTabChange?.(tab.id)}
                  className={activeTab === tab.id ? 'bg-primary/20' : ''}
                >
                  {tab.label}
                </Button>
              ))}
            </nav>
          )}

          {/* Wallet Button (Desktop) */}
          <div className="hidden sm:block">
            <WalletButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pb-4 space-y-4 border-t border-border/50 pt-4">
            {/* Mobile Tabs */}
            {showTabs && (
              <nav className="grid grid-cols-2 gap-2">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      onTabChange?.(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={activeTab === tab.id ? 'bg-primary/20' : ''}
                  >
                    {tab.label}
                  </Button>
                ))}
              </nav>
            )}

            {/* Mobile Wallet Button */}
            <div className="w-full">
              <WalletButton />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
