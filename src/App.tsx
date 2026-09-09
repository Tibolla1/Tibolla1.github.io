import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { RegistrarLote } from './components/RegistrarLote'
import { VerificarLote } from './components/VerificarLote'

type Aba = 'registrar' | 'verificar'

function App() {
  const [aba, setAba] = useState<Aba>('registrar')
  const { connected } = useWallet()

  return (
    <div className="pagina">
      <header className="cabecalho">
        <a className="marca" href="/safra-coin-site/html/index.html" target="_blank" rel="noopener noreferrer">
          <span className="marca__grao" aria-hidden="true" />
          Safra Coin
        </a>
        <WalletMultiButton />
      </header>

      <section className="faixa">
        <h1>Cada saca tem uma origem. Agora ela pode ser provada.</h1>
        <p>
          Um certificado on-chain, na Solana, para lotes de grãos produzidos em Passo Fundo —
          impossível de falsificar, gratuito para consultar.
        </p>
      </section>

      <nav className="abas">
        <button className={aba === 'registrar' ? 'aba aba--ativa' : 'aba'} onClick={() => setAba('registrar')}>
          Registrar lote
        </button>
        <button className={aba === 'verificar' ? 'aba aba--ativa' : 'aba'} onClick={() => setAba('verificar')}>
          Verificar lote
        </button>
      </nav>

      <main className="conteudo">
        {aba === 'registrar' ? (
          connected ? (
            <RegistrarLote />
          ) : (
            <p className="aviso-carteira">Conecte uma carteira Solana (devnet) para registrar um lote.</p>
          )
        ) : (
          <VerificarLote />
        )}
      </main>

      <footer className="rodape">
        Protótipo de hackathon · Rede: devnet · Hackathon Solana & Cursor — Passo Fundo 2026
      </footer>
    </div>
  )
}

export default App
