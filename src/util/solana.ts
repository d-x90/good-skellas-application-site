import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createBurnCheckedInstruction } from '@solana/spl-token';
import axios from 'axios';

export const BONES_MINT_PUBKEY = new PublicKey(
  '6qNcUDjuEwrHhi42xj58UaRsu6igPRu12kJnLnaijc5f'
);

const PEN_HASHLIST = require('../assets/penHashlist.json') as string[];

export const getBonesTokenAddress = async (userWallet: PublicKey) => {
  const { data: bonesHoldersResponse } = await axios.get(
    `https://api.solscan.io/account/v2/tokenaccounts?address=${userWallet.toString()}&offset=0&size=5000&cluster=`
  );

  try {
    const bonesTokenAddress = bonesHoldersResponse.data.find(
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
    const { data } = await axios.get(
      `https://api.solscan.io/account/v2/tokenaccounts?address=${userWallet.toString()}&offset=0&size=5000&cluster=`
    );

    const pensOwned = data.data
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

export const getPenAndTokenBurnTransaction = ({
  connection,
  userWallet,
  bonesTokenAccountPubkey,
  penMintPubkey,
  penTokenAccountPubkey,
}: {
  connection: Connection;
  userWallet: PublicKey;
  bonesTokenAccountPubkey: PublicKey;
  penMintPubkey: PublicKey;
  penTokenAccountPubkey: PublicKey;
}) => {
  let unsignedTransaction = new Transaction().add(
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
      500e9, // amount, if your deciamls is 8, 10^8 for 1 token
      9 // decimals
    )
  );

  return unsignedTransaction;
};
