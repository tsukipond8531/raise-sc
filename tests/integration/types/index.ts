import { Program } from '@coral-xyz/anchor'
import { PublicKey, TransactionSignature } from '@solana/web3.js'
import { RaiseContract } from '../../../target/types/raise_contract'

export type RaiseContractProgram = Program<RaiseContract>

export type DefaultProgramAccounts = {
  tokenProgram: PublicKey
  systemProgram: PublicKey
  rent: PublicKey
  instruction: PublicKey
}

export interface Result {
  success: boolean
  msg: null | string
  txId: null | TransactionSignature
}
