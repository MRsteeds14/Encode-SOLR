import { ConnectButton } from 'thirdweb/react'
import { client } from '@/lib/thirdweb-client'
import { arcTestnet } from '@/lib/chains'

export function WalletButton() {
  return (
    <ConnectButton
      client={client}
      chain={arcTestnet}
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
