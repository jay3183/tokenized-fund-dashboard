import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, gql } from '@apollo/client';
import { Card } from '../components/ui';
import TransactionHistory from '../components/TransactionHistory';
import PortfolioBalance from '../components/PortfolioBalance';
import FundChart from '../components/FundChart';
import { formatCurrency } from '../utils/formatNumber';

// Query to get portfolio data and transaction history
const GET_PORTFOLIO_DATA = gql`
  query GetPortfolioData($investorId: ID!, $fundId: ID!) {
    portfolio(investorId: $investorId, fundId: $fundId) {
      id
      shares
      investorId
      fundId
      accruedYield
    }
    fund(id: $fundId) {
      id
      name
      currentNav
      previousNav
      intradayYield
      totalAum
      updatedAt
    }
    transactions(investorId: $investorId, fundId: $fundId) {
      id
      timestamp
      type
      amount
      shares
      navAtTransaction
    }
  }
`;

export default function InvestorPortfolio() {
  const { user } = useAuth();
  const [selectedFundId] = useState('F1'); // Default to F1, could be expanded for multiple funds
  
  // Make sure we have string values for both IDs
  const safeInvestorId = user?.id ? user.id.toString() : '';
  console.log("InvestorPortfolio - Using investorId:", safeInvestorId);
  
  const { data, loading, error } = useQuery(GET_PORTFOLIO_DATA, {
    variables: { 
      investorId: safeInvestorId, 
      fundId: selectedFundId 
    },
    skip: !safeInvestorId, // Skip if we don't have a user ID
    pollInterval: 30000,
    errorPolicy: 'all', // Handle errors gracefully without crashing the whole component
    onError: (error) => {
      console.error("Portfolio data error details:", {
        message: error.message,
        networkError: error.networkError ? error.networkError.toString() : "None",
        graphQLErrors: error.graphQLErrors,
        variables: { investorId: safeInvestorId, fundId: selectedFundId },
      });
    }
  });
  
  if (!user) {
    return (
      <div className="text-center text-red-500 my-8">
        User not authenticated.
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">Your Portfolio</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white shadow-md rounded-xl p-6 animate-pulse h-64"></div>
          <div className="bg-white shadow-md rounded-xl p-6 animate-pulse h-64"></div>
        </div>
        <div className="mt-8 bg-white shadow-md rounded-xl p-6 animate-pulse h-96"></div>
      </div>
    );
  }
  
  // Extract data with proper checks for each
  const portfolio = data?.portfolio || null;
  const fund = data?.fund || null;
  const transactions = data?.transactions || [];
  
  // If we received error but not data
  if (error && !portfolio) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">Your Portfolio</h1>
        <Card>
          <div className="p-6 text-red-500">
            Error loading portfolio data: {error.message}
          </div>
        </Card>
      </div>
    );
  }
  
  // Calculate performance metrics
  const calculateMetrics = () => {
    if (!portfolio || !transactions || transactions.length === 0) return null;
    
    // Get the oldest and newest transactions
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    const firstTransaction = sortedTransactions[0];
    const currentValue = portfolio.shares * fund.currentNav;
    
    // Calculate total invested (all buys minus all sells)
    const totalInvested = transactions.reduce((sum, tx) => {
      if (tx.type === 'MINT') {
        return sum + (tx.amount || 0);
      } else if (tx.type === 'REDEEM') {
        return sum - (tx.amount || 0);
      }
      return sum;
    }, 0);
    
    // Calculate return percentage
    const returnAmount = currentValue - totalInvested;
    const returnPercentage = totalInvested > 0 
      ? (returnAmount / totalInvested) * 100 
      : 0;
      
    const firstDate = new Date(firstTransaction.timestamp);
    const now = new Date();
    const daysSinceFirst = Math.floor((now - firstDate) / (1000 * 60 * 60 * 24));
    
    return {
      totalInvested,
      currentValue,
      returnAmount,
      returnPercentage,
      daysSinceFirst,
      annualizedReturn: daysSinceFirst > 0 
        ? returnPercentage * (365 / daysSinceFirst) 
        : 0
    };
  };
  
  const metrics = calculateMetrics();
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Your Portfolio</h1>
      
      {/* Portfolio Summary */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Portfolio Summary</h2>
            
            {portfolio ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-600">Fund</span>
                  <span className="font-medium">{fund?.name || 'Unknown Fund'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-600">Shares Owned</span>
                  <span className="font-medium">{portfolio.shares}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-600">Current NAV</span>
                  <span className="font-medium">{formatCurrency(fund?.currentNav || 0)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-600">Total Value</span>
                  <span className="font-medium text-lg text-primary">
                    {formatCurrency(portfolio.shares * (fund?.currentNav || 0))}
                  </span>
                </div>
                
                {metrics && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-slate-600">Return</span>
                    <div>
                      <span className={`font-medium ${metrics.returnAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metrics.returnAmount >= 0 ? '+' : ''}{formatCurrency(metrics.returnAmount)} 
                        ({metrics.returnPercentage.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Accrued Yield</span>
                  <span className="font-medium text-green-600">{formatCurrency(portfolio?.accruedYield || 0)}</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-4">
                No portfolio data available
              </div>
            )}
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Performance Chart</h2>
            {fund ? (
              <FundChart 
                fundId={selectedFundId} 
                type="nav"
                height={250}
              />
            ) : (
              <div className="text-slate-500 text-center py-4">
                No fund data available
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Transaction History */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Transaction History</h2>
          <TransactionHistory 
            transactions={transactions || []} 
            fundName={fund?.name || 'Unknown Fund'}
          />
        </div>
      </Card>
    </div>
  );
} 