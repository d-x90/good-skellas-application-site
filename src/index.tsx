import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Wallet } from './components/Wallet';

import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ToasterProvider } from './util/Toaster';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Wallet>
      <ToasterProvider>
        <RouterProvider router={router} />
      </ToasterProvider>
    </Wallet>
  </React.StrictMode>
);
