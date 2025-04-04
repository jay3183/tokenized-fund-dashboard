import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // tailwind styles

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PrintableReport from './pages/PrintableReport.jsx';

// Create the Apollo Client with custom merge functions for cache
const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache({
    typePolicies: {
      Fund: {
        fields: {
          navHistory: {
            // Always merge new data with existing data
            merge: true,
          },
          yieldHistory: {
            // Always merge new data with existing data
            merge: true,
          }
        }
      },
      NAVSnapshot: {
        // Use id as the key field for NAVSnapshot objects
        keyFields: ["id"],
      }
    }
  }),
});

// Set up routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/print-report',
    element: <PrintableReport />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>
);