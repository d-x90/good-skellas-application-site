import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import whiteLogo from '../assets/WhiteLogo.png';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { useEffect, useState } from 'react';

const ApplyPage = () => {
  const wallet = useWallet();

  const [applications, setApplications] = useState<Array<any> | null>(null);

  useEffect(() => {
    if (applications || !wallet.connected) {
      return;
    }

    (async () => {
      //setApplications(await getApplications(wallet.publicKey!));
      setApplications([]);
    })();
  }, [applications, wallet]);

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
            {wallet.connected
              ? applications === null || applications?.length === 0
                ? 'Applications are being processed please check back later!'
                : 'Applications'
              : 'Please connect your wallet to check application status.'}
          </Typography>
        </Box>
      </div>
    </div>
  );
};

export default ApplyPage;
