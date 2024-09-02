import { BN } from '@coral-xyz/anchor'
import {
  getOrCreateAssociatedTokenAccount,
  getAccount,
  mintToChecked,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token'
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js'

export const airDropSol = async (
  connection: Connection,
  publicKey: PublicKey,
  amount = 10
) => {
  try {
    while ((await getSolBalance(connection, publicKey)) < 1) {
      const airdropSignature = await connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      )
      const latestBlockHash = await connection.getLatestBlockhash()
      await connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: airdropSignature
        },
        connection.commitment
      )
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const airDropSolIfBalanceNotEnough = async (
  connection: Connection,
  publicKey: PublicKey,
  balance = 1
) => {
  const walletBalance = await connection.getBalance(publicKey)
  if (walletBalance < balance * LAMPORTS_PER_SOL) {
    await airDropSol(connection, publicKey)
  }
}

export const getOrCreateATA = async (
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  payer: Keypair
) => {
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    owner
  )

  return ata.address
}

export const toTokenAmount = (uiAmount: number, decimals: number): BN => {
  return new BN(uiAmount * 10 ** decimals)
}

export const toUiAmount = (token_amount: number, decimals: number): number => {
  return token_amount / 10 ** decimals
}

// return in lamports
export const getSolBalance = async (
  connection: Connection,
  pubkey: PublicKey
) => {
  return connection
    .getBalance(pubkey)
    .then(balance => balance)
    .catch(() => 0)
}

export const getBalance = async (connection: Connection, pubkey: PublicKey) => {
  return getAccount(connection, pubkey)
    .then(account => Number(account.amount))
    .catch(() => 0)
}

export const mintTokens = async (
  connection: Connection,
  payer: Keypair,
  uiAmount: number,
  decimals: number,
  mint: PublicKey,
  destiantionWallet: PublicKey
) => {
  await mintToChecked(
    connection,
    payer,
    mint,
    destiantionWallet,
    payer.publicKey,
    toTokenAmount(uiAmount, decimals).toNumber(),
    decimals
  )
}

export const checkAccountValidity = async (
  connection: Connection,
  publicKey: PublicKey
) => {
  const accountInfo = await connection.getAccountInfo(publicKey)
  return accountInfo != null && accountInfo != undefined
}

export const getAssociatedTokenAccountInstruction = (
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey
): {
  associatedTokenAccount: PublicKey
  tx: TransactionInstruction
} => {
  let associatedTokenAccount = getAssociatedTokenAddressSync(mint, owner)
  let tx = createAssociatedTokenAccountInstruction(
    payer.publicKey,
    associatedTokenAccount,
    owner,
    mint
  )
  return {
    associatedTokenAccount,
    tx
  }
}

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
