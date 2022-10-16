import React, { FC, PropsWithChildren, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  /*LedgerWalletAdapter,*/
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  WalletDialogProvider,
  /*WalletDisconnectButton,
  WalletMultiButton,*/
} from '@solana/wallet-adapter-material-ui';
//import { Box } from '@mui/material';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

const endpoint = process.env.REACT_APP_SOLANA_RPC_URL!;

export const Wallet: FC<PropsWithChildren> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      //new LedgerWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletDialogProvider>
          {/*<Box
            sx={{
              position: 'fixed',
              right: 0,
              top: 0,
              display: 'flex',
              flexDirection: 'column',
              padding: 4,
            }}
          >
            <WalletMultiButton sx={{ marginBottom: 2 }} />
            <WalletDisconnectButton />
        </Box>*/}
          {children}
        </WalletDialogProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
