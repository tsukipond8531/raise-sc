import { Program, BN, AnchorProvider, Wallet, Idl } from '@coral-xyz/anchor'
import {
  PublicKey,
  Keypair,
  Connection,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction
} from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

import { RaiseContract } from '../../target/types/raise_contract'
import * as idl from '../../target/idl/raise_contract.json'
import { DefaultProgramAccounts, Result } from './types'

const defaultProgramAccounts: DefaultProgramAccounts = {
  systemProgram: SystemProgram.programId,
  tokenProgram: TOKEN_PROGRAM_ID,
  rent: SYSVAR_RENT_PUBKEY,
  instruction: SYSVAR_INSTRUCTIONS_PUBKEY
}

export default class RaiseContractImpl {
  private connection: Connection
  private program: Program<RaiseContract>

  constructor (program: Program<RaiseContract>, connection: Connection) {
    this.program = program
    this.connection = connection
  }

  public static create (endpoint: string) {
    const connection = new Connection(endpoint)

    const provider = new AnchorProvider(
      connection,
      new Wallet(Keypair.generate()),
      { commitment: 'processed' }
    )
    const program = new Program(
      idl as Idl,
      new PublicKey(provider.publicKey)
    ) as unknown as Program<RaiseContract>

    let raiseContract: RaiseContractImpl = new RaiseContractImpl(
      program,
      connection
    )
    return raiseContract
  }
  public setWallet (wallet: Wallet) {
    const provider = new AnchorProvider(this.connection, wallet, {
      commitment: 'processed'
    })
    this.program = new Program<RaiseContract>(
      this.program.idl,
      this.program.programId,
      provider
    )
  }
  public setWalletKeypair (keypair: Keypair) {
    const wallet = new Wallet(keypair)
    this.setWallet(wallet)
  }

  public getPda (
    seeds: Buffer[],
    programId: PublicKey = this.program.programId
  ): PublicKey {
    return PublicKey.findProgramAddressSync(seeds, programId)[0]
  }

  public getPlatform (): PublicKey {
    return this.getPda([Buffer.from('platform')])
  }

  public getPlatformAuthority (): PublicKey {
    return this.getPda([Buffer.from('platform_authority')])
  }

  public getCampaign (creator: PublicKey): PublicKey {
    return this.getPda([Buffer.from('campaign'), creator.toBuffer()])
  }

  public getCampaignAuthority (): PublicKey {
    return this.getPda([Buffer.from('campaign_authority')])
  }

  public getDonor (campaignPubkey: PublicKey, userPubkey: PublicKey): PublicKey {
    return this.getPda([
      Buffer.from('donor'),
      campaignPubkey.toBuffer(),
      userPubkey.toBuffer()
    ])
  }

  public async getTokenAccountByOwner (owner: PublicKey, mint: PublicKey) {
    let tokenAccounts = (
      await this.connection.getParsedTokenAccountsByOwner(owner, { mint })
    ).value
    if (tokenAccounts.length > 0) {
      let maxAmount = 0
      let tokenAccount = tokenAccounts[0].pubkey
      tokenAccounts.forEach(val => {
        let amount = val.account.data.parsed.uiAmount
        if (amount > maxAmount) {
          tokenAccount = val.pubkey
          maxAmount = amount
        }
      })
      return { tokenAccount, uiAmount: maxAmount }
    }
    return { tokenAccount: null, uiAmount: 0 }
  }

  public async initializePlatform (
    fee: BN,

    admin: PublicKey //payer
  ): Promise<Result> {
    let platform = this.getPlatform()
    let platformAuthority = this.getPlatformAuthority()

    let accounts = {
      admin,
      platform,
      platformAuthority,
      ...defaultProgramAccounts
    }

    let params = {
      fee
    }

    let txId = await this.program.methods
      .initializePlatform(params)
      .accounts(accounts)
      .rpc()

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized')
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    })

    return {
      success: true,
      msg: null,
      txId: txId
    }
  }

  public async setPlatformAdmin (
    adminToBeChanged: PublicKey,

    admin: PublicKey //payer
  ): Promise<Result> {
    let platform = this.getPlatform()
    let platformAuthority = this.getPlatformAuthority()

    let accounts = {
      admin,
      platform,
      platformAuthority,
      ...defaultProgramAccounts
    }

    let params = {
      adminToBeChanged
    }

    let txId = await this.program.methods
      .setPlatformAdmin(params)
      .accounts(accounts)
      .rpc()

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized')
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    })

    return {
      success: true,
      msg: null,
      txId: txId
    }
  }

  public async setPlatformFee (
    feeToBeChanged: BN,

    admin: PublicKey //payer
  ): Promise<Result> {
    let platform = this.getPlatform()
    let platformAuthority = this.getPlatformAuthority()

    let accounts = {
      admin,
      platform,
      platformAuthority,
      ...defaultProgramAccounts
    }

    let params = {
      feeToBeChanged
    }

    let txId = await this.program.methods
      .setPlatformFee(params)
      .accounts(accounts)
      .rpc()

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized')
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    })

    return {
      success: true,
      msg: null,
      txId: txId
    }
  }

  public async initializeCampaign (
    goal: BN,
    campaignDuration: BN, // in seconds
    minDepositAmount: BN, // in lamport

    creator: Keypair //payer
  ): Promise<Result> {
    let platform = this.getPlatform()
    let platformAuthority = this.getPlatformAuthority()
    let campaign = this.getCampaign(creator.publicKey)
    let campaignAuthority = this.getCampaignAuthority()

    let accounts = {
      creator: creator.publicKey,
      campaign,
      campaignAuthority,
      ...defaultProgramAccounts
    }

    let params = {
      goal,
      campaignDuration,
      minDepositAmount
    }

    let txId = await this.program.methods
      .initializeCampaign(params)
      .accounts(accounts)
      .signers([creator])
      .rpc()

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized')
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    })

    return {
      success: true,
      msg: null,
      txId: txId
    }
  }

  public async fundToCampaign (
    fundAmount: BN,

    donor: Keypair, //payer
    creator: PublicKey
  ): Promise<Result> {
    let platform = this.getPlatform()
    let platformAuthority = this.getPlatformAuthority()
    let campaign = this.getCampaign(creator)
    let campaignAuthority = this.getCampaignAuthority()
    let donorInfo = this.getDonor(campaign, donor.publicKey)

    let accounts = {
      donor: donor.publicKey,
      creator,
      campaign,
      campaignAuthority,
      donorInfo,
      ...defaultProgramAccounts
    }

    let params = {
      fundAmount
    }

    let txId = await this.program.methods
      .fundToCampaign(params)
      .accounts(accounts)
      .signers([donor])
      .rpc()

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized')
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    })

    return {
      success: true,
      msg: null,
      txId: txId
    }
  }

  public async withdrawFromCampaign (creator: Keypair): Promise<Result> {
    let campaign = this.getCampaign(creator.publicKey)
    let campaignAuthority = this.getCampaignAuthority()

    let accounts = {
      creator: creator.publicKey,
      campaign,
      campaignAuthority,
      ...defaultProgramAccounts
    }

    let txId = await this.program.methods
      .withdrawFromCampaign()
      .accounts(accounts)
      .signers([creator])
      .rpc()

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized')
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    })

    return {
      success: true,
      msg: null,
      txId: txId
    }
  }

  public async refundToDonor (
    donor: PublicKey,
    creator: PublicKey
  ): Promise<Result> {
    let campaign = this.getCampaign(creator)
    let campaignAuthority = this.getCampaignAuthority()
    let donorInfo = this.getDonor(campaign, donor)

    let accounts = {
      donor,
      creator,
      campaign,
      campaignAuthority,
      donorInfo,
      ...defaultProgramAccounts
    }

    let txId = await this.program.methods
      .refundToDonor()
      .accounts(accounts)
      .rpc()

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized')
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    })

    return {
      success: true,
      msg: null,
      txId: txId
    }
  }

  public async setCampaignUnlocked (
    creator: PublicKey
  ): Promise<Result> {
    let campaign = this.getCampaign(creator)
    let campaignAuthority = this.getCampaignAuthority()

    let accounts = {
      creator,
      campaign,
      ...defaultProgramAccounts
    }

    let txId = await this.program.methods
      .setCampaignUnlocked()
      .accounts(accounts)
      .rpc()

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized')
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    })

    return {
      success: true,
      msg: null,
      txId: txId
    }
  }
}
