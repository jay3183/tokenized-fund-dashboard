import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';

import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import client from './lib/apolloClient'; // Import the Apollo client setup
import './index.css';
import './auth-setup'; // Import auth setup for development

// Log application startup
console.log('[App] Starting application...');
console.log('[App] Token in localStorage:', localStorage.getItem('token') ? 'present' : 'absent');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ApolloProvider client={client}>
          <App />
        </ApolloProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
); 