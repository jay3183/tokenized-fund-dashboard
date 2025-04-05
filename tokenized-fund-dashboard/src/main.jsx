import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // tailwind styles
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PrintableReport from './pages/PrintableReport.jsx';
import { RoleProvider } from './RoleContext.jsx';

// Create the Apollo Client with custom merge functions for cache
const client = new ApolloClient({
  uri: 'http://localhost:4000/',
  credentials: 'include', // Enable credentials
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          auditLogs: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          yieldHistory: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          navHistory: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      AuditLog: {
        keyFields: ['id'],
      },
      NAVSnapshot: {
        keyFields: ['fundId', 'timestamp'], // ✅ Using fundId + timestamp as unique combo key
        fields: {
          fundId: {
            read(fundId, { readField }) {
              // If fundId exists, return it
              if (fundId) return fundId;
              
              // Try to get fundId from the parent Fund if available
              const fund = readField('fund');
              if (fund) {
                const fundId = readField('id', fund);
                if (fundId) return fundId;
              }
              
              // As a last resort, if we have an id that follows the pattern "F1-nav-timestamp"
              // extract the fund ID from it
              const id = readField('id');
              if (id && typeof id === 'string' && id.includes('-nav-')) {
                const parts = id.split('-nav-');
                if (parts.length > 0) return parts[0];
              }
              
              // Return a default value if all else fails (avoids cache errors)
              return "F1";
            }
          }
        }
      },
      Fund: {
        keyFields: ['id'], // Ensure Fund is cacheable
        fields: {
          // Add merge policy for the currentNAV field
          currentNAV: {
            // Use the timestamp as a unique identifier
            merge: true,
          },
          navHistory: {
            // Always merge new data with existing data
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          yieldHistory: {
            // Always merge new data with existing data
            merge(existing = [], incoming) {
              return incoming;
            },
          }
        }
      },
      User: {
        keyFields: ['id'],
      },
      Portfolio: {
        keyFields: ['investorId', 'fundId'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  }
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
      <RoleProvider>
        <RouterProvider router={router} />
      </RoleProvider>
    </ApolloProvider>
  </React.StrictMode>
);