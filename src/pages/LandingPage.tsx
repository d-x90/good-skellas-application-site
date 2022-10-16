import { Button, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import LogoWhite from '../assets/WhiteLogo.png';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import '../vendor/nextparticle.min.js';

const LandingPage = () => {
  const ref = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    try {
      console.log('eh');
      if (ref.current) {
        return;
      }

      console.log('he');
      //@ts-ignore
      ref.current = new NextParticle({
        image: document.querySelector('#MainLogo'),
        addTimestamp: true,
        height: window.innerHeight,
        maxHeight: 250,
        gravity: '0.2',
        initPosition: 'none',
        initDirection: 'none',
        fadePosition: 'none',
        fadeDirection: 'none',
        renderer: 'webgl',
        particleGap: '3',
        layerCount: '2',
        particleSize: '4',
        mouseForce: '25',
        clickStrength: '200',
        noise: '12',
      });
    } catch (e) {}
  });

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
      }}
    >
      <img
        style={{ zIndex: 1 }}
        src={LogoWhite}
        height={window.innerHeight / 2}
        onClick={() => console.log('hello')}
        id="MainLogo"
        alt="Logo Button"
      />

      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 66,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          color: 'white',
          fontFamily: 'Roboto',
        }}
      >
        <Typography variant="h1" sx={{ fontWeight: '100' }}>
          GOOD
        </Typography>
        <Typography variant="h1" sx={{ fontWeight: '900' }}>
          SKELLAS
        </Typography>
      </div>

      <Button
        sx={{
          position: 'absolute',
          top: 56,
          right: 66,
          padding: '10px 24px',
          border: `2px solid white`,
          fontSize: '1.6rem',
          fontFamily: 'Roboto',
          color: 'black',
          backgroundColor: 'white',
          cursor: 'pointer',
          rotate: '0deg',
          '&:hover': {
            rotate: '5deg',
            color: 'white',
            backgroundColor: 'transparent',
          },
        }}
        onClick={() => navigate('/check-status')}
      >
        Check status
      </Button>

      <motion.div
        style={{
          position: 'absolute',
          bottom: 56,
          right: 66,
        }}
        animate={{
          rotate: ['0deg', '5deg', '0deg', '5deg', '0deg'],
          transition: { repeat: 9999, duration: 1, repeatDelay: 2 },
        }}
      >
        <Button
          sx={{
            padding: '10px 24px',
            border: `2px solid white`,
            fontSize: '4.8rem',
            fontFamily: 'Roboto',
            color: 'white',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            rotate: '-5deg',
            '&:hover': {
              rotate: '0deg',
              color: 'black',
              backgroundColor: 'white',
            },
          }}
          onClick={() => navigate('/apply')}
        >
          Apply
        </Button>
      </motion.div>
    </div>
  );
};

export default LandingPage;
