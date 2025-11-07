import { ConnectButton } from 'thirdweb/react'
import { createWallet } from 'thirdweb/wallets'
import { client } from '@/lib/thirdweb-client'
import { arcTestnet } from '@/lib/chains'

export function WalletButton() {
  const wallets = [
    createWallet('io.metamask'),
    createWallet('walletConnect'),
    createWallet('com.coinbase.wallet'),
    createWallet('thirdweb'), // in-app wallet fallback
  ]

  return (
    <ConnectButton
      client={client}
      chain={arcTestnet}
      wallets={wallets}
      connectButton={{
        label: 'Connect Wallet',
        style: {
          fontSize: '14px',
          fontWeight: 600,
        }
      }}
      detailsButton={{
        style: {
          fontSize: '14px',
          fontFamily: 'monospace',
        }
      }}
    />
  )
}
