import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useApolloClient, gql } from '@apollo/client';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

// Define the GraphQL queries and mutations
const MINT_SHARES = gql`
  mutation MintShares($input: MintSharesInput!) {
    mintShares(input: $input) {
      sharesMinted
      navUsed
      timestamp
    }
  }
`;

const REDEEM_SHARES = gql`
  mutation RedeemShares($input: RedeemSharesInput!) {
    redeemShares(input: $input) {
      sharesRedeemed
      navUsed
      amountUSD
      timestamp
    }
  }
`;

const WITHDRAW_YIELD = gql`
  mutation WithdrawYield($input: WithdrawYieldInput!) {
    withdrawYield(input: $input) {
      amount
      timestamp
    }
  }
`;

// Create the context
const PortfolioContext = createContext();

// Create a custom hook to use the portfolio context
export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}

// Provider component
export function PortfolioProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, role } = useAuth();
  const apolloClient = useApolloClient();
  
  // Get toast options based on user role
  const getToastOptions = (role) => {
    const baseStyle = {
      duration: 4000,
      position: 'top-right',
    };
    
    if (role === 'INVESTOR') {
      return {
        ...baseStyle,
        style: {
          background: '#dcfce7',  // Light green background
          color: '#166534',       // Dark green text
          border: '1px solid #bbf7d0', // Light green border
        },
        iconTheme: {
          primary: '#22c55e',     // Green icon
          secondary: '#dcfce7',   // Light green background
        }
      };
    } else {
      return {
        ...baseStyle,
        style: {
          background: '#dbeafe',  // Light blue background
          color: '#1e40af',       // Dark blue text
          border: '1px solid #bfdbfe', // Light blue border
        },
        iconTheme: {
          primary: '#3b82f6',     // Blue icon
          secondary: '#dbeafe',   // Light blue background
        }
      };
    }
  };

  // Setup mutations
  const [mintSharesMutation] = useMutation(MINT_SHARES, {
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    }
  });

  const [redeemSharesMutation] = useMutation(REDEEM_SHARES, {
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    }
  });

  // Helper function to handle errors
  const handleError = (error, action) => {
    console.error(`Error during ${action}:`, error);
    toast.error(`Failed to ${action}: ${error.message}`, getToastOptions(role));
    setError(error.message);
    setIsLoading(false);
  };

  // Mint shares function
  const mintShares = async (fundId, amount, onSuccess) => {
    if (!user) {
      toast.error("Please log in to mint shares", getToastOptions(role));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const investorId = user.id;

      const result = await mintSharesMutation({
        variables: {
          input: {
            fundId,
            investorId,
            amountUsd: parseFloat(amount)
          }
        }
      });

      setIsLoading(false);
      
      if (result.data?.mintShares) {
        const { sharesMinted, navUsed } = result.data.mintShares;
        toast.success(
          `Successfully minted ${sharesMinted.toFixed(4)} shares at $${navUsed.toFixed(2)} per share.`,
          getToastOptions(role)
        );
        if (onSuccess) onSuccess(result.data.mintShares);
      }
      
      return result;
    } catch (error) {
      handleError(error, "mint shares");
      return { error };
    }
  };

  // Redeem shares function
  const redeemShares = async (fundId, shares, onSuccess) => {
    if (!user) {
      toast.error("Please log in to redeem shares", getToastOptions(role));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const investorId = user.id;

      const result = await redeemSharesMutation({
        variables: {
          input: {
            fundId,
            investorId,
            shares: parseFloat(shares)
          }
        }
      });

      setIsLoading(false);
      
      if (result.data?.redeemShares) {
        const { sharesRedeemed, navUsed, amountUSD } = result.data.redeemShares;
        toast.success(
          `Successfully redeemed ${sharesRedeemed.toFixed(4)} shares at $${navUsed.toFixed(2)} per share for a total of $${amountUSD.toFixed(2)}.`,
          getToastOptions(role)
        );
        if (onSuccess) onSuccess(result.data.redeemShares);
      }
      
      return result;
    } catch (error) {
      handleError(error, "redeem shares");
      return { error };
    }
  };

  // Withdraw yield function
  const withdrawYield = async (fundId, onSuccess) => {
    if (!user) {
      toast.error("Please log in to withdraw yield", getToastOptions(role));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const investorId = user.id;

      const result = await apolloClient.mutate({
        mutation: WITHDRAW_YIELD,
        variables: {
          input: {
            fundId,
            investorId
          }
        }
      });

      setIsLoading(false);
      
      if (result.data?.withdrawYield) {
        const { amount } = result.data.withdrawYield;
        toast.success(
          `Successfully withdrawn $${amount.toFixed(2)} in yield.`,
          getToastOptions(role)
        );
        if (onSuccess) onSuccess(result.data.withdrawYield);
      }
      
      return result;
    } catch (error) {
      handleError(error, "withdraw yield");
      return { error };
    }
  };

  // Clear errors function
  const clearError = () => {
    setError(null);
  };

  // Provide the context value
  const value = {
    isLoading,
    error,
    clearError,
    mintShares,
    redeemShares,
    withdrawYield
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export default PortfolioContext; 