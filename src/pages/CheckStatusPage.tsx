import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import whiteLogo from '../assets/WhiteLogo.png';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { useEffect, useState } from 'react';
import axios from 'axios';
import csv from 'csvtojson';
import { calcLength } from 'framer-motion';

const ApplyPage = () => {
  const wallet = useWallet();

  const [allApplications, setAllApplications] = useState<Array<any> | null>(
    null
  );
  const [applications, setApplications] = useState<Array<any> | null>(null);

  useEffect(() => {
    if (allApplications) {
      return;
    }

    (async () => {
      const { data } = await axios.get(
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZVdsXEKA8yaxQx1c9yM2pvrz3ibO3iT6saH3u0oSEnoBf9WXLXZ0vDUQNUzjwnEoQFqQkIYC81INZ/pub?gid=0&single=true&output=csv'
      );

      setAllApplications(await csv().fromString(data));
    })();
  }, [allApplications]);

  useEffect(() => {
    if (allApplications === null) {
      return;
    }

    if (applications || !wallet.connected) {
      return;
    }

    setApplications(
      allApplications.filter(
        (application) => application.UserWallet === wallet.publicKey?.toString()
      )
    );
  }, [applications, wallet, allApplications]);

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
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            width: '50vw',
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
                : 'Your applications:'
              : 'Please connect your wallet to check application status.'}
          </Typography>
          {wallet.connected && applications !== null ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',

                borderBottom: '3px solid white',
                marginBottom: '36px',
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: 'white',
                  fontWeight: '900',
                }}
              >
                NFT
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  color: 'white',
                  fontWeight: '900',
                }}
              >
                Status
              </Typography>
            </div>
          ) : null}
          <div
            style={{
              height: '30vh',
              width: 'calc(100% + 32px)',
              padding: '0 16px',
              overflowY: 'auto',
            }}
          >
            {applications?.map((application, index) => (
              <div
                key={application.Transaction + index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <a
                  style={{
                    color: 'white',
                    marginBottom: '36px',
                    fontWeight: '900',
                    fontSize: '3rem',
                  }}
                  target="_blank"
                  href={`https://solscan.io/token/${application.OriginalNft}`}
                  rel="noreferrer"
                >
                  {(() => {
                    const hash = application.OriginalNft;
                    return (
                      hash.substring(0, 3) +
                      '...' +
                      hash.substring(hash.length - 4)
                    );
                  })()}
                </a>
                <Typography
                  variant="h2"
                  sx={{
                    color: 'white',
                    marginBottom: '36px',
                    fontWeight: '900',
                  }}
                >
                  {application.Status === 'InProgress'
                    ? 'In progress'
                    : application.Status === 'Rejected'
                    ? 'Rejected'
                    : application.Status === 'Done'
                    ? 'Done'
                    : ''}
                </Typography>
              </div>
            ))}
          </div>
        </Box>
      </div>
    </div>
  );
};

export default ApplyPage;
