const { BN } = require('@coral-xyz/anchor');
const {
  getOrCreateAssociatedTokenAccount,
  getAccount,
  mintToChecked,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction
} = require('@solana/spl-token');
const {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction
} = require('@solana/web3.js');

const airDropSol = async (connection, publicKey, amount = 10) => {
  try {
    while ((await getSolBalance(connection, publicKey)) < 1) {
      const airdropSignature = await connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: airdropSignature
        },
        connection.commitment
      );
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const airDropSolIfBalanceNotEnough = async (connection, publicKey, balance = 1) => {
  const walletBalance = await connection.getBalance(publicKey);
  if (walletBalance < balance * LAMPORTS_PER_SOL) {
    await airDropSol(connection, publicKey);
  }
};

const getOrCreateATA = async (connection, mint, owner, payer) => {
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    owner
  );
  return ata.address;
};

const toTokenAmount = (uiAmount, decimals) => {
  return new BN(uiAmount * 10 ** decimals);
};

const toUiAmount = (token_amount, decimals) => {
  return token_amount / 10 ** decimals;
};

// return in lamports
const getSolBalance = async (connection, pubkey) => {
  return connection
    .getBalance(pubkey)
    .then(balance => balance)
    .catch(() => 0);
};

const getBalance = async (connection, pubkey) => {
  return getAccount(connection, pubkey)
    .then(account => Number(account.amount))
    .catch(() => 0);
};

const mintTokens = async (
  connection,
  payer,
  uiAmount,
  decimals,
  mint,
  destinationWallet
) => {
  await mintToChecked(
    connection,
    payer,
    mint,
    destinationWallet,
    payer.publicKey,
    toTokenAmount(uiAmount, decimals).toNumber(),
    decimals
  );
};

const checkAccountValidity = async (connection, publicKey) => {
  const accountInfo = await connection.getAccountInfo(publicKey);
  return accountInfo != null && accountInfo != undefined;
};

const getAssociatedTokenAccountInstruction = (payer, mint, owner) => {
  let associatedTokenAccount = getAssociatedTokenAddressSync(mint, owner);
  let tx = createAssociatedTokenAccountInstruction(
    payer.publicKey,
    associatedTokenAccount,
    owner,
    mint
  );
  return {
    associatedTokenAccount,
    tx
  };
};

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
