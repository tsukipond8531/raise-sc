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

  let raiseContract: RaiseContractImpl = new RaiseContractImpl(
    program,
    connection
  )

  const creatorKeypair = Keypair.generate()
  const userKeypair = Keypair.generate()

  let payerPubkey: PublicKey = payer.publicKey
  let creatorPubkey: PublicKey = creatorKeypair.publicKey
  let userPubkey: PublicKey = userKeypair.publicKey

  it('set up!', async () => {
    // airdrop sol for simulation
    await utils.airDropSol(connection, payerPubkey)
    console.log(
      `<<< payer bal = ${await utils.getSolBalance(connection, payerPubkey)}`
    )
    await utils.airDropSol(connection, creatorPubkey)
    console.log(
      `<<< creator bal = ${await utils.getSolBalance(
        connection,
        creatorPubkey
      )}`
    )
    await utils.airDropSol(connection, userPubkey)
    console.log(
      `<<< user bal = ${await utils.getSolBalance(connection, userPubkey)}`
    )
  })

  it('initializePlatform', async () => {
    let fee = utils.toTokenAmount(0.01, 9)
    try {
      let { txId } = await raiseContract.initializePlatform(
        fee,

        payerPubkey
      )

      console.log('>>> initializePlatform txId = ', txId)
    } catch (e) {
      console.log('>>> initializePlatform error # \n ', e)
      assert(false, 'initializePlatform error')
    }
  })

  it('setPlatformAdmin', async () => {
    try {
      let { txId } = await raiseContract.setPlatformAdmin(
        payerPubkey,

        payerPubkey
      )

      console.log('>>> setPlatformAdmin txId = ', txId)
    } catch (e) {
      console.log('>>> setPlatformAdmin error # \n ', e)
      assert(false, 'setPlatformAdmin error')
    }
  })

  it('setPlatformFee', async () => {
    let feeToBeChanged = utils.toTokenAmount(0.02, 9)
    try {
      let { txId } = await raiseContract.setPlatformFee(
        feeToBeChanged,

        payerPubkey
      )

      console.log('>>> setPlatformFee txId = ', txId)
    } catch (e) {
      console.log('>>> setPlatformFee error # \n ', e)
      assert(false, 'setPlatformFee error')
    }
  })

  it('initializeCampaign', async () => {
    let goal = utils.toTokenAmount(5, 9)
    let campaignDuration = new anchor.BN(3 * 30 * 24 * 3600)
    let minDepositAmount = utils.toTokenAmount(1, 9)
    try {
      let { txId } = await raiseContract.initializeCampaign(
        goal,
        campaignDuration,
        minDepositAmount,

        creatorKeypair
      )

      console.log('>>> initializeCampaign txId = ', txId)
    } catch (e) {
      console.log('>>> initializeCampaign error # \n ', e)
      assert(false, 'initializeCampaign error')
    }
  })

  it('fundToCampaign', async () => {
    let fundAmount = utils.toTokenAmount(6, 9)

    try {
      let { txId } = await raiseContract.fundToCampaign(
        fundAmount,

        userKeypair,
        creatorPubkey
      )

      console.log('>>> fundToCampaign txId = ', txId)
    } catch (e) {
      console.log('>>> fundToCampaign error # \n ', e)
      assert(false, 'fundToCampaign error')
    }
  })

  it('withdrawFromCampaign', async () => {

    try {
      let { txId } = await raiseContract.withdrawFromCampaign(
        creatorKeypair
      )

      console.log('>>> withdrawFromCampaign txId = ', txId)
    } catch (e) {
      console.log('>>> withdrawFromCampaign error # \n ', e)
      assert(false, 'withdrawFromCampaign error')
    }
  })

  it('refundToDonor', async () => {

    try {
      let { txId } = await raiseContract.refundToDonor(
        userPubkey,
        creatorPubkey
      )

      console.log('>>> refundToDonor txId = ', txId)
    } catch (e) {
      console.log('>>> refundToDonor error # \n ', e)
      assert(false, 'refundToDonor error')
    }
  })


})
