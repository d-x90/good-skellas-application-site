import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  /*createBurnCheckedInstruction,*/
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import axios from 'axios';

export const BONES_MINT_PUBKEY = new PublicKey(
  '6qNcUDjuEwrHhi42xj58UaRsu6igPRu12kJnLnaijc5f'
);

const VAULT_WALLET_ADDRESS = process.env.REACT_APP_VAULT_WALLET_ADDRESS;

const PEN_HASHLIST = require('../assets/penHashlist.json') as string[];
const KEYS_HASHLIST = require('../assets/skellakeyHashlist.json') as string[];

const getAllTokenAccounts = async (userWallet: PublicKey) => {
  let offset = 0;
  let limit = 50;
  let isResponseArrayEmpty = false;
  const tokenAccounts = [];
  while (!isResponseArrayEmpty) {
    const { data: response } = await axios.get(
      `https://api.solscan.io/account/v2/tokenaccounts?address=${userWallet.toString()}&offset=${offset}&limit=${limit}&cluster=`
    );

    const responseArray = response.data;

    if (responseArray.length > 0) {
      tokenAccounts.push(...responseArray);
      offset += limit;
    } else {
      isResponseArrayEmpty = true;
    }
  }

  return tokenAccounts;
};

export const checkIfIsEligableForDiscount = async (userWallet: PublicKey) => {
  const tokenAccounts = await getAllTokenAccounts(userWallet);

  try {
    const ownsAKey = tokenAccounts.some(
      (tokenAccountData: any) =>
        KEYS_HASHLIST.includes(tokenAccountData.tokenAddress) &&
        tokenAccountData.amount > 0
    );

    return ownsAKey;
  } catch (e) {
    console.error('Key verification failed failed');
    return false;
  }
};

export const getBonesTokenAddress = async (userWallet: PublicKey) => {
  const tokenAccounts = await getAllTokenAccounts(userWallet);

  try {
    const bonesTokenAddress = tokenAccounts.find(
      (tokenAccountData: any) =>
        tokenAccountData.tokenAddress === BONES_MINT_PUBKEY.toString() &&
        tokenAccountData.amount > 0
    ).address;

    return bonesTokenAddress;
  } catch (e) {
    console.error('bones token account fetching failed');
    return null;
  }
};

export const getOwnedPens = async (userWallet: PublicKey) => {
  try {
    const tokenAccounts = await getAllTokenAccounts(userWallet);

    const pensOwned = tokenAccounts
      .filter(
        ({ amount, tokenAddress }: any) =>
          amount === 1 && PEN_HASHLIST.includes(tokenAddress)
      )
      .map((token: any) => ({
        mint: token.tokenAddress,
        tokenAccountAddress: token.address,
        tokenName: token.tokenName,
      }));

    return pensOwned;
  } catch (e) {
    console.error('pens fetching failed');
    return [];
  }
};

export const getPenAndTokenBurnTransaction = async ({
  connection,
  userWallet,
  bonesTokenAccountPubkey,
  penMintPubkey,
  penTokenAccountPubkey,
  isEligibleForDiscount,
}: {
  connection: Connection;
  userWallet: PublicKey;
  bonesTokenAccountPubkey: PublicKey;
  penMintPubkey: PublicKey;
  penTokenAccountPubkey: PublicKey;
  isEligibleForDiscount: boolean;
}) => {
  /*let unsignedTransaction = new Transaction().add(
    createBurnCheckedInstruction(
      penTokenAccountPubkey, // token account
      penMintPubkey, // mint
      userWallet, // owner of token account
      1, // amount, if your deciamls is 8, 10^8 for 1 token
      0 // decimals
    ),
    createBurnCheckedInstruction(
      bonesTokenAccountPubkey, // token account
      BONES_MINT_PUBKEY, // mint
      userWallet, // owner of token account
      isEligibleForDiscount ? 500e9 : 750e9, // amount, if your deciamls is 8, 10^8 for 1 token
      9 // decimals
    )
  );
*/
  if (!VAULT_WALLET_ADDRESS) {
    throw new Error('vault wallet not configured');
  }

  const bonesAta = await getAssociatedTokenAddress(
    BONES_MINT_PUBKEY, // mint
    new PublicKey(VAULT_WALLET_ADDRESS), // owner
    false // allow owner off curve
  );

  const penAta = await getAssociatedTokenAddress(
    penMintPubkey, // mint
    new PublicKey(VAULT_WALLET_ADDRESS), // owner
    false // allow owner off curve
  );

  const transactions = [];

  try {
    const bonesAccount = await getAccount(connection, bonesAta);
    if (!bonesAccount) {
      transactions.push(
        createAssociatedTokenAccountInstruction(
          userWallet, // payer
          bonesAta, // ata
          new PublicKey(VAULT_WALLET_ADDRESS), // owner
          BONES_MINT_PUBKEY // mint
        )
      );
    }
  } catch (e) {
    console.log('gothca');
    transactions.push(
      createAssociatedTokenAccountInstruction(
        userWallet, // payer
        bonesAta, // ata
        new PublicKey(VAULT_WALLET_ADDRESS), // owner
        BONES_MINT_PUBKEY // mint
      )
    );
  }

  try {
    const penAccount = await getAccount(connection, penAta);
    if (!penAccount) {
      transactions.push(
        createAssociatedTokenAccountInstruction(
          userWallet, // payer
          penAta, // ata
          new PublicKey(VAULT_WALLET_ADDRESS), // owner
          penMintPubkey // mint
        )
      );
    }
  } catch (e) {
    console.log('Gothcaa');
    transactions.push(
      createAssociatedTokenAccountInstruction(
        userWallet, // payer
        penAta, // ata
        new PublicKey(VAULT_WALLET_ADDRESS), // owner
        penMintPubkey // mint
      )
    );
  }

  transactions.push(
    createTransferCheckedInstruction(
      penTokenAccountPubkey, // token account
      penMintPubkey, // mint
      penAta,
      userWallet, // owner of token account
      1, // amount, if your deciamls is 8, 10^8 for 1 token
      0 // decimals
    )
  );

  transactions.push(
    createTransferCheckedInstruction(
      bonesTokenAccountPubkey, // token account
      BONES_MINT_PUBKEY, // mint
      bonesAta,
      userWallet, // owner of token account
      isEligibleForDiscount ? 500e9 : 750e9, // amount, if your deciamls is 8, 10^8 for 1 token
      9 // decimals
    )
  );

  let unsignedTransaction = new Transaction().add(...transactions);

  return unsignedTransaction;
};
