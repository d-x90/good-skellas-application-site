import { createBrowserRouter } from 'react-router-dom';
import ApplyPage from './pages/ApplyPage';
import LandingPage from './pages/LandingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    children: [],
  },
  {
    path: 'apply',
    element: <ApplyPage />,
  },
]);
