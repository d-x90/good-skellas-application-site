import {
  Button,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import whiteLogo from '../assets/WhiteLogo.png';
import penImg from '../assets/pen.png';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { confetti } from 'dom-confetti';
import { useRef, useEffect, useState, useCallback } from 'react';
import {
  getBonesTokenAddress,
  getOwnedPens,
  getPenAndTokenBurnTransaction,
} from '../util/solana';
import { PublicKey } from '@solana/web3.js';
import { useToaster } from '../util/Toaster';

const ApplyPage = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { connection } = useConnection();
  const wallet = useWallet();
  const { open: openToaster } = useToaster();

  const [pens, setPens] =
    useState<
      { mint: string; tokenAccountAddress: string; tokenName: string }[]
    >();

  const [selectedPen, setSelectedPen] = useState<{
    mint: string;
    tokenAccountAddress: string;
    tokenName: string;
  } | null>(null);

  const [bonesTokenAddress, setBonesTokenAddress] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (bonesTokenAddress || !wallet.connected) {
      return;
    }

    (async () => {
      setBonesTokenAddress(await getBonesTokenAddress(wallet.publicKey!));
    })();
  }, [bonesTokenAddress, wallet]);

  useEffect(() => {
    if (pens || !wallet.connected) {
      return;
    }

    (async () => {
      setPens(await getOwnedPens(wallet.publicKey!));
    })();
  }, [pens, wallet]);

  const applyWithBurnTransaction = useCallback(async () => {
    if (!wallet || !wallet.connected) {
      openToaster({ severity: 'error', message: 'Wallet is not connected' });
      console.log('walleterror');
      return;
    }

    if (!pens || !selectedPen) {
      openToaster({ severity: 'error', message: 'Pen is not selected' });
      console.log('penserror');
      return;
    }

    if (!bonesTokenAddress) {
      openToaster({
        severity: 'error',
        message: "You don't have enough $BONES",
      });
      console.log('bonesError');
      return;
    }

    const unsignedTx = getPenAndTokenBurnTransaction({
      connection,
      userWallet: wallet.publicKey!,
      bonesTokenAccountPubkey: new PublicKey(bonesTokenAddress),
      penMintPubkey: new PublicKey(selectedPen.mint),
      penTokenAccountPubkey: new PublicKey(selectedPen.tokenAccountAddress),
    });

    const signature = await wallet.sendTransaction(unsignedTx, connection);

    console.log(`txhash: ${await connection.getSignatureStatus(signature)}`);
  }, [wallet, pens, selectedPen, bonesTokenAddress, connection, openToaster]);

  return (
    <div
      style={{
        backgroundColor: 'black',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Link to="/">
        <img
          src={whiteLogo}
          height={100}
          style={{ position: 'absolute', top: 32, left: 32, cursor: 'pointer' }}
          alt="Home logo"
        />
      </Link>
      <Box
        sx={{
          position: 'fixed',
          right: 0,
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: 4,
        }}
      >
        <WalletMultiButton
          sx={{
            marginBottom: 2,
            color: 'black',
            fontSize: '1.6rem',
            background: 'white',
            '&:hover': {
              background: 'rgb(255, 255, 255, 0.8)',
            },
          }}
        />
      </Box>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: '500px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              textAlign: 'center',
              marginBottom: '36px',
              fontWeight: '900',
            }}
          >
            Skellification costs 1 pen and 500 $BONES
          </Typography>
          <div
            ref={ref}
            style={{
              height: '350px',
              width: '350px',
              border: '2px solid white',
              background: `url(${penImg})`,
              backgroundPosition: 'center',
              backgroundSize: 'contain',
              //filter: 'grayscale(1)',

              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          ></div>
          <FormControl sx={{ width: '350px' }}>
            <Select
              sx={{
                marginTop: '14px',
                color: 'white',
                fontSize: '2rem',
                border: '2px solid white',
                '& .MuiSelect-icon': {
                  fontSize: '4rem',
                  color: 'white !important',
                },
                '& fieldset': {
                  display: 'none',
                },
                '& .Mui-disabled': {
                  color: 'white !important',
                  textFillColor: 'white !important',
                },
              }}
              id="demo-simple-select"
              value={selectedPen?.mint || 'none'}
              label="Pen"
              onChange={(e) => {
                setSelectedPen(
                  pens?.find((p) => p.mint.toString() === e.target.value) ||
                    null
                );
              }}
              disabled={!wallet.connected || !pens?.length}
            >
              <MenuItem key="none" value={'none'} sx={{ fontSize: '1.8rem' }}>
                {pens?.length || !wallet.connected
                  ? 'Select a pen..'
                  : 'You have no pen'}
              </MenuItem>
              {pens?.map((pen) => (
                <MenuItem
                  key={pen.mint.toString()}
                  value={pen.mint.toString()}
                  sx={{ fontSize: '1.8rem' }}
                >
                  {pen.tokenName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <motion.div
            style={{ marginTop: '14px' }}
            animate={{
              transition: { repeat: 9999, duration: 1, repeatDelay: 2 },
            }}
          >
            <Button
              sx={{
                padding: '10px 24px',
                border: `2px solid white`,
                fontSize: '3.4rem',
                fontFamily: 'Roboto',
                color: 'black',
                backgroundColor: 'white',
                cursor: 'pointer',
                rotate: '0deg',
                '&:hover': {
                  color: 'white',
                  background: 'transparent',
                  rotate: '0deg',
                },
              }}
              disabled={!wallet.connected}
              onClick={async () => {
                console.log({ pens, selectedPen, bonesTokenAddress });
                if (!wallet.connected) {
                  return;
                }

                await applyWithBurnTransaction();

                confetti(ref.current as HTMLElement, {
                  angle: 45,
                  spread: 60,
                  elementCount: 200,
                  stagger: 1,
                  dragFriction: 0.09,
                });
                confetti(ref.current as HTMLElement, {
                  angle: 135,
                  spread: 60,
                  elementCount: 200,
                  stagger: 1,
                  dragFriction: 0.09,
                });
              }}
            >
              {wallet.connected ? (
                'Apply'
              ) : (
                <Typography
                  variant="body1"
                  sx={{ fontSize: '1.8rem', color: 'black' }}
                >
                  Wallet is not connected
                </Typography>
              )}
            </Button>
          </motion.div>
        </Box>
      </div>
    </div>
  );
};

export default ApplyPage;
