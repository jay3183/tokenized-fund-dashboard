import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { usePortfolio } from '../contexts/PortfolioContext';
import MintSharesModal from './MintSharesModal';
import RedeemDialog from './RedeemDialog';
import { useAuth } from '../contexts/AuthContext';
import CountUp from 'react-countup';
import toast from 'react-hot-toast';

// Demo data that will definitely render
const DEMO_PORTFOLIO = { 
  shares: 25,
  fund: { name: "Demo Growth Fund", currentNav: 190.75 }
};

// Query to fetch portfolio data
const PORTFOLIO_QUERY = gql`
  query GetPortfolio($investorId: ID!, $fundId: ID!) {
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
  }
`;

// Mutation to withdraw yield
const WITHDRAW_YIELD = gql`
  mutation WithdrawYield($input: WithdrawYieldInput!) {
    withdrawYield(input: $input) {
      amount
      timestamp
      transactionId
    }
  }
`;

// Tooltip component for yield calculation
const YieldTooltip = ({ intradayYield, shares, navValue }) => {
  const calculatedYield = (intradayYield / 100 * navValue * shares).toFixed(2);
  
  return (
    <div className="absolute z-10 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg -mt-2 right-0 transform translate-x-2">
      <div className="font-semibold mb-1 text-yellow-300">Yield Calculation</div>
      <div className="grid grid-cols-2 gap-1 mb-2">
        <div>Intraday Yield:</div>
        <div className="text-right">{intradayYield}%</div>
        <div>NAV Value:</div>
        <div className="text-right">${navValue.toFixed(2)}</div>
        <div>Shares Owned:</div>
        <div className="text-right">{shares}</div>
      </div>
      <div className="border-t border-gray-700 pt-2 grid grid-cols-2">
        <div>Daily Yield:</div>
        <div className="text-right text-green-400 font-medium">${calculatedYield}</div>
      </div>
      <div className="text-xs mt-2 text-gray-400">
        Formula: (Yield Rate × NAV × Shares)
      </div>
    </div>
  );
};

console.log("[PortfolioPanel] Module loaded ✅");

export default function PortfolioPanel({ 
  fundId, 
  investorId, 
  onMintSuccess, 
  onSellSuccess, 
  onWithdrawSuccess 
}) {
  const { user, role } = useAuth();
  if (!user) return null;
  
  const [actionLoading, setActionLoading] = useState(false);
  const [mintAmount, setMintAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [showMintModal, setShowMintModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [showYieldTooltip, setShowYieldTooltip] = useState(false);
  
  // Make sure we have values to query with
  const effectiveFundId = fundId || "F1";
  const effectiveInvestorId = investorId || user?.id || "I1";
  
  // Use the Apollo Client to fetch portfolio data with polling for updates
  const { loading, error, data, refetch } = useQuery(PORTFOLIO_QUERY, {
    variables: { 
      investorId: effectiveInvestorId, 
      fundId: effectiveFundId 
    },
    pollInterval: 30000, // Poll every 30 seconds
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });
  
  // Use the portfolio context
  const { 
    mintShares, 
    redeemShares, 
    withdrawYield, 
    isLoading: portfolioActionLoading,
    error: portfolioError,
    clearError
  } = usePortfolio();
  
  // Use the mutation to withdraw yield
  const [withdrawYieldMutation] = useMutation(WITHDRAW_YIELD, {
    onCompleted: (data) => {
      if (data?.withdrawYield) {
        toast.success(`$${data.withdrawYield.amount.toFixed(2)} yield withdrawn successfully! 💸`);
        
        // Log the transaction in the audit log
        toast.success('Transaction recorded in audit log', { duration: 3000, icon: '📝' });
        
        if (onWithdrawSuccess) onWithdrawSuccess(data.withdrawYield);
        refetch(); // Refresh portfolio data
      }
    },
    onError: (error) => {
      toast.error(`Failed to withdraw yield: ${error.message}`);
    }
  });
  
  // Reset modal error when changing modal visibility
  useEffect(() => {
    if (!showMintModal && !showSellModal) {
      setModalError('');
      clearError();
    }
  }, [showMintModal, showSellModal, clearError]);
  
  const handleMintShares = async () => {
    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      setModalError('Please enter a valid amount to mint.');
      return;
    }
    
    setActionLoading(true);
    setModalError('');
    
    const result = await mintShares(
      effectiveFundId, 
      parseFloat(mintAmount), 
      (data) => {
        // Success callback
        setShowMintModal(false);
        setMintAmount('');
        if (onMintSuccess) onMintSuccess(data.sharesMinted);
        refetch(); // Refresh data
        
        // Show toast notification
        toast.success(`${data.sharesMinted} shares minted successfully!`, {
          icon: '🚀',
          duration: 4000
        });
      }
    );
    
    if (result?.error) {
      setModalError(result.error.message);
    }
    
    setActionLoading(false);
  };
  
  const handleSellShares = async () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      setModalError('Please enter a valid amount to sell.');
      return;
    }
    
    if (data?.portfolio && parseFloat(sellAmount) > data.portfolio.shares) {
      setModalError('You cannot sell more shares than you own.');
      return;
    }
    
    setActionLoading(true);
    setModalError('');
    
    const result = await redeemShares(
      effectiveFundId,
      parseFloat(sellAmount),
      (data) => {
        // Success callback
        setShowSellModal(false);
        setSellAmount('');
        if (onSellSuccess) onSellSuccess(data.sharesRedeemed);
        refetch(); // Refresh data
        
        // Show toast notification
        toast.success(`${data.sharesRedeemed} shares redeemed for $${data.amountUsd.toFixed(2)}!`, {
          icon: '💰',
          duration: 4000
        });
      }
    );
    
    if (result?.error) {
      setModalError(result.error.message);
    }
    
    setActionLoading(false);
  };
  
  const handleWithdrawYield = async () => {
    if (!data?.portfolio?.accruedYield || data.portfolio.accruedYield === 0) {
      toast.error('No yield available to withdraw');
      return;
    }
    
    setWithdrawing(true);
    try {
      await withdrawYieldMutation({ 
        variables: { 
          input: {
            investorId: effectiveInvestorId,
            fundId: effectiveFundId
          } 
        } 
      });
      // Success handling moved to onCompleted callback
    } catch (error) {
      // Error handling moved to onError callback
      console.error("Error withdrawing yield:", error);
    } finally {
      setWithdrawing(false);
    }
  };
  
  // Extract portfolio and fund data
  const portfolio = data?.portfolio;
  const fund = data?.fund;
  
  // Calculate portfolio value
  const portfolioValue = portfolio && fund 
    ? portfolio.shares * fund.currentNav 
    : 0;
  
  // Calculate daily yield
  const dailyYield = portfolio && fund && fund.intradayYield
    ? (fund.intradayYield / 100) * portfolioValue
    : 0;
  
  // Format large numbers
  const formatLargeNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };
  
  // Display loading state
  if (loading && !data) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
      </div>
    );
  }
  
  // Display error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-800 shadow-md">
        <h2 className="text-xl font-bold mb-2">Portfolio Error</h2>
        <p>Unable to load portfolio data. Please try again later.</p>
        <p className="mt-2 text-sm">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 rounded-lg hover:bg-red-300 dark:hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // If no portfolio or fund data is available
  if (!data?.portfolio || !data?.fund) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-200 rounded-lg border border-yellow-200 dark:border-yellow-800 shadow-md">
        <h2 className="text-xl font-bold mb-2">Portfolio Unavailable</h2>
        <p>Unable to load portfolio data for investor {effectiveInvestorId}.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded-lg hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // Render portfolio panel when we have data
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">{fund.name} Portfolio</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Portfolio ID: {portfolio.id} • NAV: ${fund.currentNav.toFixed(2)}
      </p>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400">Shares Owned</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            <CountUp 
              end={portfolio.shares} 
              decimals={2} 
              duration={1} 
              separator="," 
            />
          </p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400">Portfolio Value</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ${' '}
            <CountUp 
              end={portfolioValue} 
              decimals={2}
              duration={1} 
              separator="," 
            />
          </p>
        </div>
      </div>
      
      <div className="p-4 mb-6 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-700 rounded-lg border border-blue-100 dark:border-blue-800 relative">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center">
              Daily Yield
              <button 
                className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={() => setShowYieldTooltip(!showYieldTooltip)}
                onMouseEnter={() => setShowYieldTooltip(true)}
                onMouseLeave={() => setShowYieldTooltip(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </button>
              {showYieldTooltip && (
                <YieldTooltip 
                  intradayYield={fund.intradayYield} 
                  shares={portfolio.shares} 
                  navValue={fund.currentNav} 
                />
              )}
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${' '}
              <CountUp 
                end={dailyYield} 
                decimals={2} 
                duration={1} 
                separator="," 
              />
            </p>
          </div>
          <button
            onClick={handleWithdrawYield}
            disabled={!portfolio.accruedYield || portfolio.accruedYield === 0 || withdrawing}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              !portfolio.accruedYield || portfolio.accruedYield === 0 || withdrawing
                ? 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {withdrawing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Withdraw Yield'
            )}
          </button>
        </div>
        
        <div className="mt-3 flex items-center">
          <div className="flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Current Rate</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {fund.intradayYield}% <span className="text-xs text-slate-500 dark:text-slate-400">per day</span>
            </p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Accrued Yield</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              ${portfolio.accruedYield ? portfolio.accruedYield.toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Last Updated</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {new Date(fund.updatedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setShowMintModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Buy Shares
        </button>
        <button
          onClick={() => setShowSellModal(true)}
          disabled={!portfolio.shares || portfolio.shares === 0}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !portfolio.shares || portfolio.shares === 0
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-amber-600 text-white hover:bg-amber-700'
          }`}
        >
          Sell Shares
        </button>
      </div>
      
      {/* Mint Shares Modal */}
      {showMintModal && (
        <MintSharesModal
          isOpen={showMintModal}
          onClose={() => setShowMintModal(false)}
          fundId={effectiveFundId}
          navPrice={fund.currentNav}
          fundName={fund.name}
          onMint={handleMintShares}
          amount={mintAmount}
          setAmount={setMintAmount}
          error={modalError}
          loading={actionLoading || portfolioActionLoading}
        />
      )}
      
      {/* Redeem Shares Modal */}
      {showSellModal && (
        <RedeemDialog
          isOpen={showSellModal}
          onClose={() => setShowSellModal(false)}
          fundId={effectiveFundId}
          navPrice={fund.currentNav}
          fundName={fund.name}
          maxShares={portfolio.shares}
          onRedeem={handleSellShares}
          amount={sellAmount}
          setAmount={setSellAmount}
          error={modalError}
          loading={actionLoading || portfolioActionLoading}
        />
      )}
    </div>
  );
}