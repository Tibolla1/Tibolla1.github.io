import { Buffer } from 'buffer'
// @solana/web3.js e @solana/spl-token esperam Buffer disponível
// como em Node — no navegador precisamos injetar isso manualmente.
window.Buffer = window.Buffer || Buffer

import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css'

import App from './App.tsx'
import './index.css'

// Rede: devnet enquanto vocês constroem e testam.
// Antes do Pitch Day, troquem para mainnet-beta se for demonstrar com valor real.
const REDE = 'devnet' as const

function Root() {
  const endpoint = useMemo(() => clusterApiUrl(REDE), [])
  // Carteiras modernas (Phantom, Solflare etc.) se registram sozinhas via
  // o "Wallet Standard" do navegador — não precisamos mais declarar
  // adaptadores manualmente aqui.
  const wallets = useMemo(() => [], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
