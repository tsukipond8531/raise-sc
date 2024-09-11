const { Program, BN, AnchorProvider, Wallet, Idl } = require('@coral-xyz/anchor');
const {
  PublicKey,
  Keypair,
  Connection,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction
} = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');

const idl = require('../../target/idl/raise_contract.json');

const defaultProgramAccounts = {
  systemProgram: SystemProgram.programId,
  tokenProgram: TOKEN_PROGRAM_ID,
  rent: SYSVAR_RENT_PUBKEY,
  instruction: SYSVAR_INSTRUCTIONS_PUBKEY
};

class RaiseContractImpl {
  constructor(program, connection) {
    this.program = program;
    this.connection = connection;
  }

  static create(endpoint) {
    const connection = new Connection(endpoint);

    const provider = new AnchorProvider(
      connection,
      new Wallet(Keypair.generate()),
      { commitment: 'processed' }
    );
    const program = new Program(
      idl,
      new PublicKey(provider.wallet.publicKey)
    );

    return new RaiseContractImpl(program, connection);
  }

  setWallet(wallet) {
    const provider = new AnchorProvider(this.connection, wallet, {
      commitment: 'processed'
    });
    this.program = new Program(
      this.program.idl,
      this.program.programId,
      provider
    );
  }

  setWalletKeypair(keypair) {
    const wallet = new Wallet(keypair);
    this.setWallet(wallet);
  }

  getPda(seeds, programId = this.program.programId) {
    return PublicKey.findProgramAddressSync(seeds, programId)[0];
  }

  getPlatform() {
    return this.getPda([Buffer.from('platform')]);
  }

  getPlatformAuthority() {
    return this.getPda([Buffer.from('platform_authority')]);
  }

  getCampaign(creator) {
    return this.getPda([Buffer.from('campaign'), creator.toBuffer()]);
  }

  getCampaignAuthority() {
    return this.getPda([Buffer.from('campaign_authority')]);
  }

  getDonor(campaignPubkey, userPubkey) {
    return this.getPda([
      Buffer.from('donor'),
      campaignPubkey.toBuffer(),
      userPubkey.toBuffer()
    ]);
  }

  async getTokenAccountByOwner(owner, mint) {
    let tokenAccounts = (
      await this.connection.getParsedTokenAccountsByOwner(owner, { mint })
    ).value;
    if (tokenAccounts.length > 0) {
      let maxAmount = 0;
      let tokenAccount = tokenAccounts[0].pubkey;
      tokenAccounts.forEach(val => {
        let amount = val.account.data.parsed.uiAmount;
        if (amount > maxAmount) {
          tokenAccount = val.pubkey;
          maxAmount = amount;
        }
      });
      return { tokenAccount, uiAmount: maxAmount };
    }
    return { tokenAccount: null, uiAmount: 0 };
  }

  async initializePlatform(fee, admin) {
    let platform = this.getPlatform();
    let platformAuthority = this.getPlatformAuthority();

    let accounts = {
      admin,
      platform,
      platformAuthority,
      ...defaultProgramAccounts
    };

    let params = { fee };

    let txId = await this.program.methods
      .initializePlatform(params)
      .accounts(accounts)
      .rpc();

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized');
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });

    return { success: true, msg: null, txId };
  }

  async setPlatformAdmin(adminToBeChanged, admin) {
    let platform = this.getPlatform();
    let platformAuthority = this.getPlatformAuthority();

    let accounts = {
      admin,
      platform,
      platformAuthority,
      ...defaultProgramAccounts
    };

    let params = { adminToBeChanged };

    let txId = await this.program.methods
      .setPlatformAdmin(params)
      .accounts(accounts)
      .rpc();

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized');
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });

    return { success: true, msg: null, txId };
  }

  async setPlatformFee(feeToBeChanged, admin) {
    let platform = this.getPlatform();
    let platformAuthority = this.getPlatformAuthority();

    let accounts = {
      admin,
      platform,
      platformAuthority,
      ...defaultProgramAccounts
    };

    let params = { feeToBeChanged };

    let txId = await this.program.methods
      .setPlatformFee(params)
      .accounts(accounts)
      .rpc();

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized');
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });

    return { success: true, msg: null, txId };
  }

  async initializeCampaign(goal, campaignDuration, minDepositAmount, creator) {
    let platform = this.getPlatform();
    let platformAuthority = this.getPlatformAuthority();
    let campaign = this.getCampaign(creator.publicKey);
    let campaignAuthority = this.getCampaignAuthority();

    let accounts = {
      creator: creator.publicKey,
      campaign,
      campaignAuthority,
      ...defaultProgramAccounts
    };

    let params = { goal, campaignDuration, minDepositAmount };

    let txId = await this.program.methods
      .initializeCampaign(params)
      .accounts(accounts)
      .signers([creator])
      .rpc();

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized');
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });

    return { success: true, msg: null, txId };
  }

  async fundToCampaign(fundAmount, donor, creator) {
    let platform = this.getPlatform();
    let platformAuthority = this.getPlatformAuthority();
    let campaign = this.getCampaign(creator);
    let campaignAuthority = this.getCampaignAuthority();
    let donorInfo = this.getDonor(campaign, donor.publicKey);

    let accounts = {
      donor: donor.publicKey,
      creator,
      campaign,
      campaignAuthority,
      donorInfo,
      ...defaultProgramAccounts
    };

    let params = { fundAmount };

    let txId = await this.program.methods
      .fundToCampaign(params)
      .accounts(accounts)
      .signers([donor])
      .rpc();

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized');
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });

    return { success: true, msg: null, txId };
  }

  async withdrawFromCampaign(creator) {
    let campaign = this.getCampaign(creator.publicKey);
    let campaignAuthority = this.getCampaignAuthority();

    let accounts = {
      creator: creator.publicKey,
      campaign,
      campaignAuthority,
      ...defaultProgramAccounts
    };

    let txId = await this.program.methods
      .withdrawFromCampaign()
      .accounts(accounts)
      .signers([creator])
      .rpc();

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized');
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });

    return { success: true, msg: null, txId };
  }

  async refundToDonor(donor, creator) {
    let campaign = this.getCampaign(creator);
    let campaignAuthority = this.getCampaignAuthority();
    let donorInfo = this.getDonor(campaign, donor);

    let accounts = {
      donor,
      creator,
      campaign,
      campaignAuthority,
      donorInfo,
      ...defaultProgramAccounts
    };

    let txId = await this.program.methods
      .refundToDonor()
      .accounts(accounts)
      .rpc();

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized');
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });

    return { success: true, msg: null, txId };
  }

  async setCampaignUnlocked(creator) {
    let campaign = this.getCampaign(creator);
    let campaignAuthority = this.getCampaignAuthority();

    let accounts = {
      creator,
      campaign,
      ...defaultProgramAccounts
    };

    let txId = await this.program.methods
      .setCampaignUnlocked()
      .accounts(accounts)
      .rpc();

    let latestBlockhash = await this.connection.getLatestBlockhash('finalized');
    await this.connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });

    return { success: true, msg: null, txId };
  }
}

module.exports = RaiseContractImpl;
