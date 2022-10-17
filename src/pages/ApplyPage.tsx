import {
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import whiteLogo from '../assets/WhiteLogo.png';
import penImg from '../assets/pen.png';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { confetti } from 'dom-confetti';
import { useRef, useEffect, useState, useCallback } from 'react';
import {
  checkIfIsEligableForDiscount,
  getBonesTokenAddress,
  getOwnedPens,
  getPenAndTokenBurnTransaction,
} from '../util/solana';
import { PublicKey } from '@solana/web3.js';
import { useToaster } from '../util/Toaster';

const ApplyPage = () => {
  const ref = useRef<HTMLDivElement>(null);
  const prevWallet = useRef<HTMLDivElement>(null);
  const { connection } = useConnection();
  const navigate = useNavigate();
  const wallet = useWallet();
  const { open: openToaster } = useToaster();
  const [isModalOpen, setModalOpen] = useState(false);

  const handleModalClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'backdropClick') {
      return;
    }

    setModalOpen(false);
  };

  const [pens, setPens] = useState<
    { mint: string; tokenAccountAddress: string; tokenName: string }[] | null
  >(null);

  const [selectedPen, setSelectedPen] = useState<{
    mint: string;
    tokenAccountAddress: string;
    tokenName: string;
  } | null>(null);

  const [bonesTokenAddress, setBonesTokenAddress] = useState<string | null>(
    null
  );

  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);

  const [isEligibleForDiscount, setIsEligibleForDiscount] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    setIsEligibleForDiscount(null);
    setBonesTokenAddress(null);
    setPens(null);
  }, [wallet.publicKey]);

  useEffect(() => {
    if (isEligibleForDiscount !== null || !wallet.connected) {
      return;
    }

    (async () => {
      setIsEligibleForDiscount(
        await checkIfIsEligableForDiscount(wallet.publicKey!)
      );
    })();
  }, [isEligibleForDiscount, wallet]);

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

  const applyWithTokenSendTransaction = useCallback(async () => {
    if (!wallet || !wallet.connected) {
      openToaster({ severity: 'error', message: 'Wallet is not connected' });
      console.log('walleterror');
      return false;
    }

    if (!pens || !selectedPen) {
      openToaster({ severity: 'error', message: 'Pen is not selected' });
      console.log('penserror');
      return false;
    }

    if (!bonesTokenAddress) {
      openToaster({
        severity: 'error',
        message: "You don't have enough $BONES",
      });
      console.log('bonesError');
      return false;
    }

    try {
      const unsignedTx = await getPenAndTokenBurnTransaction({
        connection,
        userWallet: wallet.publicKey!,
        bonesTokenAccountPubkey: new PublicKey(bonesTokenAddress),
        penMintPubkey: new PublicKey(selectedPen.mint),
        penTokenAccountPubkey: new PublicKey(selectedPen.tokenAccountAddress),
        isEligibleForDiscount: isEligibleForDiscount || false,
      });

      setModalOpen(true);
      const signature = await wallet.sendTransaction(unsignedTx, connection);
      console.log(`txhash: ${signature}`);
      setTransactionSignature(signature);

      return true;
    } catch (e) {
      setModalOpen(false);

      if ((e as { name: string }).name === 'WalletSendTransactionError') {
        openToaster({ severity: 'warning', message: 'Transaction rejected' });
        return false;
      }

      openToaster({
        severity: 'error',
        message:
          'Something went wrong, please check if the transaction succeeded and contact us in discord',
      });

      return false;
    }
  }, [
    wallet,
    pens,
    selectedPen,
    bonesTokenAddress,
    connection,
    openToaster,
    isEligibleForDiscount,
  ]);

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
            Skellification costs 1 pen and {isEligibleForDiscount ? 500 : 750}{' '}
            $BONES
          </Typography>
          <div
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

                const isSuccess = await applyWithTokenSendTransaction();

                if (isSuccess) {
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
                }
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

        <Modal
          open={isModalOpen}
          onClose={handleModalClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            ref={ref}
            sx={{
              position: 'absolute' as 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '600px',
              bgcolor: 'white',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {transactionSignature ? (
              <>
                <Typography
                  variant="h1"
                  sx={{ mb: '32px', fontWeight: '500', fontSize: '4.2rem' }}
                >
                  Success!✅
                </Typography>

                <Typography
                  id="modal-modal-title"
                  variant="h3"
                  sx={{ fontWeight: '500', fontSize: '2rem' }}
                >
                  Please open a ticket in our{' '}
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://discord.gg/az9bzaxBv4"
                  >
                    discord
                  </a>{' '}
                  with this{' '}
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://solscan.io/tx/${transactionSignature}`}
                  >
                    transaction!
                  </a>
                </Typography>

                <Button
                  sx={{
                    padding: '0 20px',
                    border: `2px solid black`,
                    fontSize: '2.6rem',
                    fontFamily: 'Roboto',
                    color: 'black',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    rotate: '0deg',
                    '&:hover': {
                      color: 'white',
                      background: 'black',
                    },
                    mt: '24px',
                  }}
                  onClick={() => {
                    setTransactionSignature(null);
                    setPens(null);
                    setModalOpen(false);
                    navigate('/check-status');
                  }}
                >
                  Ok
                </Button>
              </>
            ) : (
              <>
                {' '}
                <Typography
                  id="modal-modal-title"
                  variant="h3"
                  sx={{ fontWeight: '500' }}
                >
                  Please do not close the page until the transaction is
                  confirmed..
                </Typography>
                <CircularProgress sx={{ color: 'black', mt: '24px' }} />
              </>
            )}
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default ApplyPage;
