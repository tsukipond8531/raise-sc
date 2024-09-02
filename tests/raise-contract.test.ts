import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { RaiseContract } from '../target/types/raise_contract'
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction
} from '@solana/web3.js'
import RaiseContractImpl from './integration'
import * as utils from './utils'
import { createMint, mintTo } from '@solana/spl-token'
import { assert } from 'chai'

describe('raise contract', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const wallet = provider.wallet as anchor.Wallet
  const payer = wallet.payer
  const program = anchor.workspace.RaiseContract as Program<RaiseContract>
  console.log('programId ', program.programId.toBase58())
  const connection = new Connection('http://127.0.0.1:8899', 'finalized')

  let raiseContract: RaiseContractImpl = new RaiseContractImpl(program, connection)

  const userKeypair = Keypair.generate()

  let payerPubkey: PublicKey = payer.publicKey
  let payerATokenAccount: PublicKey
  let payerCwvTokenAccount: PublicKey
  let userPubkey: PublicKey = userKeypair.publicKey
  let userATokenAccount: PublicKey
  let userCwvTokenAccount: PublicKey

  let tokenAMint: PublicKey
  let tokenCwvMint: PublicKey

  it('set up!', async () => {
    // airdrop sol for simulation
    await utils.airDropSol(connection, payerPubkey)
    // console.log(
    //   `<<< payer bal = ${await utils.getSolBalance(connection, payerPubkey)}`
    // )
    await utils.airDropSol(connection, userPubkey)
    // console.log(
    //   `<<< user bal = ${await utils.getSolBalance(connection, userPubkey)}`
    // )

    // create mint of Token A token
    try {
      tokenAMint = await createMint(
        connection,
        payer,
        payer.publicKey,
        null,
        TOKEN_A_DECIMAL
      )
      // console.log(
      //   '>>> ! check ! A TokenMintPubkey = ',
      //   await utils.checkAccountValidity(connection, tokenAMint)
      // )
    } catch (e) {
      console.log('>>> A token createMint error # \n ', e)
    }

    // get Token A ATA of user
    userATokenAccount = await utils.getOrCreateATA(
      connection,
      tokenAMint,
      userPubkey,
      userKeypair
    )
    console.log(
      '>>> user A Token Account Pubkey = ',
      userATokenAccount.toBase58()
    )
    await mintTo(
      connection,
      payer,
      tokenAMint,
      userATokenAccount,
      payer,
      utils.toTokenAmount(20, TOKEN_A_DECIMAL).toNumber()
    )
    console.log(
      '<<< user A token balance = ',
      await utils.getBalance(connection, userATokenAccount)
    )
    // get Token A ATA of payer
    payerATokenAccount = await utils.getOrCreateATA(
      connection,
      tokenAMint,
      payerPubkey,
      payer
    )
    console.log(
      '>>> payer A Token Account Pubkey = ',
      payerATokenAccount.toBase58()
    )
    await mintTo(
      connection,
      payer,
      tokenAMint,
      payerATokenAccount,
      payer,
      utils.toTokenAmount(20, TOKEN_A_DECIMAL).toNumber()
    )
    console.log(
      '<<< payer A token balance = ',
      await utils.getBalance(connection, payerATokenAccount)
    )
    // create mint of CWV token
    try {
      tokenCwvMint = await createMint(
        connection,
        payer,
        payer.publicKey,
        null,
        TOKEN_CWV_DECIMAL
      )
      // console.log(
      //   '>>> ! check ! CWV TokenMintPubkey = ',
      //   await utils.checkAccountValidity(connection, tokenCwvMint)
      // )
    } catch (e) {
      console.log('>>> CWV token createMint error # \n ', e)
    }

    // get CWV ATA of user
    userCwvTokenAccount = await utils.getOrCreateATA(
      connection,
      tokenCwvMint,
      userPubkey,
      userKeypair
    )
    console.log(
      '>>> user CWV token Account Pubkey = ',
      userCwvTokenAccount.toBase58()
    )
    await mintTo(
      connection,
      payer,
      tokenCwvMint,
      userCwvTokenAccount,
      payer,
      utils.toTokenAmount(20, TOKEN_CWV_DECIMAL).toNumber()
    )
    console.log(
      '<<< user CWV token balance = ',
      await utils.getBalance(connection, userATokenAccount)
    )
    // get Token A ATA of payer
    payerCwvTokenAccount = await utils.getOrCreateATA(
      connection,
      tokenCwvMint,
      payerPubkey,
      payer
    )
    console.log(
      '>>> payer CWV Token Account Pubkey = ',
      payerCwvTokenAccount.toBase58()
    )
    await mintTo(
      connection,
      payer,
      tokenCwvMint,
      payerCwvTokenAccount,
      payer,
      utils.toTokenAmount(20, TOKEN_CWV_DECIMAL).toNumber()
    )
    console.log(
      '<<< payer CWV token balance = ',
      await utils.getBalance(connection, payerCwvTokenAccount)
    )
  })