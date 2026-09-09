import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
} from '@solana/spl-token'
import type { WalletContextState } from '@solana/wallet-adapter-react'

// Tamanho fixo (em bytes) de uma conta de mint do SPL Token clássico.
// É uma constante do protocolo — não muda — e importá-la direto do pacote
// @solana/spl-token esbarra num bug de re-exportação ambígua no bundle ESM,
// então usamos o valor fixo aqui em vez de `MINT_SIZE` do pacote.
const MINT_SIZE = 82

// Programa de Memo da Solana (padrão, usado para gravar texto/dados numa transação)
export const MEMO_PROGRAM_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
)

export interface LoteData {
  produtor: string
  cooperativa: string
  grao: string
  safra: string
  quantidadeTon: string
  origem: string
}

export interface LoteRegistrado extends LoteData {
  registradoEm: string
}

/**
 * Registra um lote agrícola on-chain:
 * 1. cria um novo mint (token) com supply de 1 — o "certificado" do lote
 * 2. manda esse 1 token para a carteira do produtor
 * 3. grava os dados do lote como memo na mesma transação
 *
 * O endereço do mint vira o "número do passaporte" do lote: qualquer um pode
 * usá-lo depois para consultar a origem e os dados registrados.
 */
export async function registrarLote(
  connection: Connection,
  wallet: WalletContextState,
  dados: LoteData,
): Promise<{ mint: string; signature: string }> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Conecte a carteira antes de registrar um lote.')
  }

  const owner = wallet.publicKey
  const mintKeypair = Keypair.generate()
  const lamportsParaMint = await getMinimumBalanceForRentExemptMint(connection)
  const ata = await getAssociatedTokenAddress(mintKeypair.publicKey, owner)

  const registro: LoteRegistrado = {
    ...dados,
    registradoEm: new Date().toISOString(),
  }
  const memoPayload = JSON.stringify(registro)

  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: owner,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: lamportsParaMint,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(mintKeypair.publicKey, 0, owner, owner),
    createAssociatedTokenAccountInstruction(owner, ata, owner, mintKeypair.publicKey),
    createMintToInstruction(mintKeypair.publicKey, ata, owner, 1),
    new TransactionInstruction({
      keys: [{ pubkey: owner, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoPayload, 'utf-8'),
    }),
  )

  tx.feePayer = owner
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash
  tx.partialSign(mintKeypair)

  const signed = await wallet.signTransaction(tx)
  const signature = await connection.sendRawTransaction(signed.serialize())
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')

  return { mint: mintKeypair.publicKey.toBase58(), signature }
}

/**
 * Busca o histórico de transações de um mint e extrai o memo que contém
 * os dados do lote. É assim que qualquer pessoa (sem precisar de carteira)
 * consegue verificar a origem de um lote a partir do endereço do "passaporte".
 */
export async function buscarLote(
  connection: Connection,
  mintAddress: string,
): Promise<{ dados: LoteRegistrado; signature: string } | null> {
  const mintPubkey = new PublicKey(mintAddress)
  const assinaturas = await connection.getSignaturesForAddress(mintPubkey, { limit: 10 })

  for (const { signature } of assinaturas) {
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    })
    if (!tx) continue

    for (const ix of tx.transaction.message.instructions) {
      const programId = 'programId' in ix ? ix.programId.toBase58() : undefined
      if (programId !== MEMO_PROGRAM_ID.toBase58()) continue

      // Memo instructions parseadas vêm como { parsed: string } em alguns RPCs,
      // ou como dado bruto em base58 — tentamos os dois formatos.
      const raw =
        'parsed' in ix && typeof (ix as { parsed?: unknown }).parsed === 'string'
          ? ((ix as { parsed: string }).parsed)
          : null

      if (raw) {
        try {
          return { dados: JSON.parse(raw), signature }
        } catch {
          // não era o memo com JSON do lote, continua procurando
        }
      }
    }
  }

  return null
}
