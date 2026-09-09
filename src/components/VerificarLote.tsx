import { useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { buscarLote, type LoteRegistrado } from '../lib/solana'

export function VerificarLote() {
  const { connection } = useConnection()
  const [endereco, setEndereco] = useState('')
  const [estado, setEstado] = useState<'idle' | 'buscando' | 'ok' | 'nao-encontrado' | 'erro'>(
    'idle',
  )
  const [dados, setDados] = useState<LoteRegistrado | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEstado('buscando')
    setDados(null)
    try {
      const resultado = await buscarLote(connection, endereco.trim())
      if (resultado) {
        setDados(resultado.dados)
        setEstado('ok')
      } else {
        setEstado('nao-encontrado')
      }
    } catch (err) {
      console.error(err)
      setEstado('erro')
    }
  }

  return (
    <div>
      <form className="formulario" onSubmit={onSubmit}>
        <label>
          Endereço do passaporte (mint)
          <input
            required
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Cole aqui o endereço, ou leia o QR do lote"
          />
        </label>
        <button className="botao" type="submit" disabled={estado === 'buscando'}>
          {estado === 'buscando' ? 'Consultando a Solana…' : 'Verificar lote'}
        </button>
      </form>

      {estado === 'nao-encontrado' && (
        <p className="mensagem-erro">
          Nenhum registro encontrado para esse endereço. Confira se copiou certo.
        </p>
      )}
      {estado === 'erro' && (
        <p className="mensagem-erro">Não foi possível consultar agora. Tente de novo.</p>
      )}

      {dados && (
        <div className="passaporte">
          <div className="passaporte__selo">Origem verificada on-chain</div>
          <h3>{dados.grao} — {dados.safra}</h3>
          <p className="passaporte__campo">
            <span>Produtor</span>
            {dados.produtor}
          </p>
          {dados.cooperativa && (
            <p className="passaporte__campo">
              <span>Cooperativa</span>
              {dados.cooperativa}
            </p>
          )}
          <p className="passaporte__campo">
            <span>Quantidade</span>
            {dados.quantidadeTon} toneladas
          </p>
          <p className="passaporte__campo">
            <span>Origem</span>
            {dados.origem}
          </p>
          <p className="passaporte__campo">
            <span>Registrado em</span>
            {new Date(dados.registradoEm).toLocaleString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  )
}
