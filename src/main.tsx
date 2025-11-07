import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { ThirdwebProvider } from 'thirdweb/react';
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { THIRDWEB_CLIENT_ID, DEFAULT_CHAIN } from '@/lib/thirdweb-config'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <ThirdwebProvider
      clientId={THIRDWEB_CLIENT_ID}
      supportedChains={[DEFAULT_CHAIN]}
      activeChain={DEFAULT_CHAIN}
    >
      <App />
    </ThirdwebProvider>
   </ErrorBoundary>
)
