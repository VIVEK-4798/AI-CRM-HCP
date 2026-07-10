import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../layouts/Layout';
import { HomePage } from '../pages/HomePage';
import { HCPDirectory } from '../pages/HCPDirectory';
import { LogInteraction } from '../pages/LogInteraction';
import { InteractionHistory } from '../pages/InteractionHistory';
import { NotFound } from '../pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'hcps',
        element: <HCPDirectory />,
      },
      {
        path: 'log-interaction',
        element: <LogInteraction />,
      },
      {
        path: 'history',
        element: <InteractionHistory />,
      },
      {
        path: '*',
        element: <NotFound />,
      }
    ],
  },
]);
