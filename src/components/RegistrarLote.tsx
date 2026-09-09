import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { QRCodeSVG } from 'qrcode.react'
import { registrarLote, type LoteData } from '../lib/solana'

const CAMPOS_INICIAIS: LoteData = {
  produtor: '',
  cooperativa: '',
  grao: 'Trigo',
  safra: '2025/2026',
  quantidadeTon: '',
  origem: 'Passo Fundo, RS',
}

export function RegistrarLote() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [form, setForm] = useState<LoteData>(CAMPOS_INICIAIS)
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'erro'>('idle')
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState<{ mint: string; signature: string } | null>(null)

  function atualizar<K extends keyof LoteData>(campo: K, valor: LoteData[K]) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!wallet.connected) {
      setErro('Conecte a carteira antes de registrar.')
      setEstado('erro')
      return
    }
    setEstado('enviando')
    setErro('')
    try {
      const r = await registrarLote(connection, wallet, form)
      setResultado(r)
      setEstado('ok')
    } catch (err) {
      console.error(err)
      setErro(err instanceof Error ? err.message : 'Falha ao registrar o lote.')
      setEstado('erro')
    }
  }

  if (resultado) {
    return (
      <div className="passaporte">
        <div className="passaporte__selo">Lote registrado on-chain</div>
        <h3>Passaporte do lote emitido</h3>
        <p className="passaporte__campo">
          <span>Produtor</span>
          {form.produtor}
        </p>
        <p className="passaporte__campo">
          <span>Grão · Safra</span>
          {form.grao} · {form.safra}
        </p>
        <p className="passaporte__campo">
          <span>Origem</span>
          {form.origem}
        </p>
        <div className="passaporte__qr">
          <QRCodeSVG value={resultado.mint} size={140} />
          <div className="passaporte__mint">
            <span>Número do passaporte (endereço do token)</span>
            <code>{resultado.mint}</code>
          </div>
        </div>
        <a
          className="link-explorer"
          href={`https://explorer.solana.com/tx/${resultado.signature}?cluster=devnet`}
          target="_blank"
          rel="noreferrer"
        >
          Ver transação no Solana Explorer →
        </a>
        <button className="botao botao--secundario" onClick={() => setResultado(null)}>
          Registrar outro lote
        </button>
      </div>
    )
  }

  return (
    <form className="formulario" onSubmit={onSubmit}>
      <label>
        Produtor ou cooperativa
        <input
          required
          value={form.produtor}
          onChange={(e) => atualizar('produtor', e.target.value)}
          placeholder="Ex: Fazenda Santa Luzia"
        />
      </label>
      <label>
        Cooperativa (opcional)
        <input
          value={form.cooperativa}
          onChange={(e) => atualizar('cooperativa', e.target.value)}
          placeholder="Ex: Cotrijal"
        />
      </label>
      <div className="formulario__linha">
        <label>
          Grão
          <select value={form.grao} onChange={(e) => atualizar('grao', e.target.value)}>
            <option>Trigo</option>
            <option>Soja</option>
            <option>Milho</option>
            <option>Arroz</option>
          </select>
        </label>
        <label>
          Safra
          <input value={form.safra} onChange={(e) => atualizar('safra', e.target.value)} />
        </label>
      </div>
      <div className="formulario__linha">
        <label>
          Quantidade (toneladas)
          <input
            required
            type="number"
            min="0"
            value={form.quantidadeTon}
            onChange={(e) => atualizar('quantidadeTon', e.target.value)}
          />
        </label>
        <label>
          Origem
          <input value={form.origem} onChange={(e) => atualizar('origem', e.target.value)} />
        </label>
      </div>

      {erro && <p className="mensagem-erro">{erro}</p>}

      <button className="botao" type="submit" disabled={estado === 'enviando'}>
        {estado === 'enviando' ? 'Registrando na Solana…' : 'Emitir passaporte do lote'}
      </button>
    </form>
  )
}
