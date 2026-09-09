# Passaporte do Lote — esqueleto do projeto

Protótipo para o Hackathon Solana & Cursor (Passo Fundo, 2026).

## O que já funciona

- Conectar carteira Solana (Phantom/Solflare) na **devnet**
- **Registrar lote**: cria um token (mint com supply de 1) na carteira do
  produtor e grava os dados do lote (produtor, grão, safra, quantidade,
  origem) direto na transação, via instrução de Memo. O endereço do mint
  vira o "número do passaporte" do lote — mostrado com um QR code.
- **Verificar lote**: qualquer pessoa cola o endereço do mint (ou lê o QR)
  e o app busca no histórico da conta a transação de registro, mostrando
  os dados exatamente como foram gravados on-chain.

Não precisa de backend nem banco de dados — a Solana devnet é a fonte da
verdade.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra o link que o Vite mostrar (geralmente http://localhost:5173).

Você vai precisar de uma carteira Phantom configurada em **devnet**, com
um pouco de SOL de teste. Pegue no faucet:

```bash
solana airdrop 1 <seu-endereco> --url devnet
```

ou pelo https://faucet.solana.com

## Para onde evoluir (sugestões pros próximos dias)

1. **Upload de comprovante**: anexar um PDF/foto do laudo de qualidade e
   guardar o hash dele no memo, em vez de só os campos de texto.
2. **QR mais amigável**: hoje o QR carrega o endereço puro; dá pra fazer
   apontar para uma URL tipo `seusite.com/lote/<mint>` que já abre a
   aba de verificação preenchida.
3. **Página pública sem carteira**: a aba "Verificar lote" já funciona
   sem carteira conectada — pode virar uma landing separada pro
   comprador final escanear.
4. **Trocar para mainnet-beta**: troque `REDE` em `src/main.tsx` só na
   véspera da demo, e testem de novo — taxas e comportamento mudam
   um pouco entre devnet e mainnet.
5. **(Avançado, se sobrar tempo)** trocar o SPL Token comum por
   **ZK Compression** (Light Protocol), que deixa o custo por lote
   ainda menor — bom argumento de "escala" no pitch, mas não é
   necessário pra demo funcionar.

## Estrutura

```
src/
  lib/solana.ts          # toda a lógica de registrar/buscar lote on-chain
  components/
    RegistrarLote.tsx    # formulário de registro + tela do passaporte emitido
    VerificarLote.tsx    # busca por endereço + exibição dos dados
  App.tsx                # navegação entre as duas telas
  main.tsx               # providers de carteira (Phantom/Solflare) e rede
  index.css              # identidade visual (verde/ouro, tema "passaporte de grão")
```
