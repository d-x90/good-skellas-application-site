import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react';
import { Snackbar, Slide, Alert, AlertColor, Typography } from '@mui/material';

type ToasterContextValue = {
  open: ({
    severity,
    message,
  }: {
    severity: AlertColor;
    message: string;
  }) => void;
};

export const ToasterContext = React.createContext<ToasterContextValue>({
  open: ({ severity, message }) => {},
});

export const ToasterProvider = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toasterMessage, setToasterMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const open = useCallback<ToasterContextValue['open']>((arg) => {
    setToasterMessage(arg.message);
    setSeverity(arg.severity);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(
    (event: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }

      setIsOpen(false);
    },
    []
  );

  return (
    <ToasterContext.Provider value={{ open: open }}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={isOpen}
        onClose={handleClose}
        autoHideDuration={6000}
        TransitionComponent={(props) => <Slide {...props} direction="down" />}
      >
        <Alert severity={severity}>
          <Typography
            variant="h2"
            sx={{ fontSize: '1.6rem', fontWeight: '500' }}
          >
            {toasterMessage}
          </Typography>
        </Alert>
      </Snackbar>
    </ToasterContext.Provider>
  );
};

export const useToaster = () => {
  const { open } = useContext(ToasterContext);

  return { open } as ToasterContextValue;
};
