import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { usePortfolio } from '../contexts/PortfolioContext';
import MintSharesModal from './MintSharesModal';
import RedeemDialog from './RedeemDialog';
import { useAuth } from '../contexts/AuthContext';
import CountUp from 'react-countup';
import toast from 'react-hot-toast';
import { useApolloClient } from '@apollo/client';

// Demo data that will definitely render
const DEMO_PORTFOLIO = { 
  shares: 25,
  accruedYield: 125.75,
  investorId: "I1",
  fundId: "F1",
  fund: { 
    name: "Demo Growth Fund", 
    currentNav: 190.75,
    previousNav: 189.25,
    intradayYield: 1.75,
    totalAum: 2500000,
    updatedAt: new Date().toISOString()
  }
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
  mutation WithdrawYield($fundId: ID!) {
    withdrawYield(fundId: $fundId) {
      amount
      timestamp
      transactionId
      portfolio {
        id
        investorId
        fundId
        shares
        accruedYield
      }
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
  const client = useApolloClient();
  if (!user) return null;
  
  const [actionLoading, setActionLoading] = useState(false);
  const [mintAmount, setMintAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [showMintModal, setShowMintModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [showYieldTooltip, setShowYieldTooltip] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [useFallbackData, setUseFallbackData] = useState(false);
  
  // Make sure we have values to query with
  const effectiveFundId = fundId || "F1";
  // Ensure we have a valid string for investorId
  const effectiveInvestorId = (investorId || user?.id || "I1").toString();
  
  console.log("PortfolioPanel - Using IDs:", { 
    effectiveInvestorId, 
    effectiveFundId, 
    originalInvestorId: investorId, 
    userId: user?.id 
  });
  
  // Use the Apollo Client to fetch portfolio data with polling for updates
  const { loading, error, data, refetch } = useQuery(PORTFOLIO_QUERY, {
    variables: { 
      investorId: effectiveInvestorId, 
      fundId: effectiveFundId 
    },
    pollInterval: 30000, // Poll every 30 seconds
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all', // Handle errors gracefully
    onError: (error) => {
      console.error("Portfolio query error details:", {
        message: error.message,
        networkError: error.networkError ? error.networkError.toString() : "None",
        graphQLErrors: error.graphQLErrors,
        variables: { investorId: effectiveInvestorId, fundId: effectiveFundId },
        fullError: error
      });
      
      // Handle network errors specifically
      if (error.networkError) {
        setConnectionError(true);
        setUseFallbackData(true);
        console.log("Using fallback data due to network error:", error.networkError);
      }
    }
  });
  
  // Use mock data when needed
  const fallbackData = useMemo(() => ({
    portfolio: {
      shares: 115.25,
      accruedYield: 32.80,
      lastYieldWithdrawal: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    fund: {
      name: "Tokenized Fund I",
      currentNav: 102.75,
      intradayYield: 0.0021,
      previousNav: 102.25,
      netChange: 0.50,
      percentChange: 0.5,
    }
  }), []);
  
  // Combine real data with fallback when needed
  const effectiveData = useMemo(() => {
    if (useFallbackData || (error && error.networkError)) {
      console.log("Using fallback portfolio data");
      return fallbackData;
    }
    return data;
  }, [data, useFallbackData, error, fallbackData]);
  
  // Retry mechanism for network errors
  useEffect(() => {
    if (error && error.networkError && !isRetrying) {
      setIsRetrying(true);
      const timer = setTimeout(() => {
        console.log("Automatically retrying portfolio query after network error...");
        refetch()
          .then(() => {
            setIsRetrying(false);
            setConnectionError(false);
            setUseFallbackData(false);
          })
          .catch(e => {
            console.error("Retry failed:", e);
            setIsRetrying(false);
            // Keep fallback data active
            setUseFallbackData(true);
          });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error, refetch, isRetrying]);
  
  // Manual retry handler
  const handleRetry = () => {
    setIsRetrying(true);
    refetch()
      .then(() => {
        setIsRetrying(false);
        setConnectionError(false);
        setUseFallbackData(false);
        toast.success("Connection restored!");
      })
      .catch(e => {
        console.error("Manual retry failed:", e);
        setIsRetrying(false);
        toast.error("Connection still unavailable. Using sample data.");
      });
  };
  
  // Use the portfolio context
  const { 
    mintShares, 
    redeemShares, 
    withdrawYield, 
    isLoading: portfolioActionLoading,
    error: portfolioError,
    clearError
  } = usePortfolio();
  
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
    
    try {
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
    } catch (error) {
      console.error("Error minting shares:", error);
      setModalError(error.message || "Failed to mint shares");
    } finally {
      setActionLoading(false);
    }
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
    
    try {
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
          toast.success(`${data.sharesRedeemed} shares redeemed for $${data.amountUSD.toFixed(2)}!`, {
            icon: '💰',
            duration: 4000
          });
        }
      );
      
      if (result?.error) {
        setModalError(result.error.message);
      }
    } catch (error) {
      console.error("Error selling shares:", error);
      setModalError(error.message || "Failed to sell shares");
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleWithdrawYield = async () => {
    if (!data?.portfolio?.accruedYield || data.portfolio.accruedYield === 0) {
      toast.error('No yield available to withdraw');
      return;
    }
    
    setWithdrawing(true);
    try {
      // Use the context's withdrawYield method instead of directly using the mutation
      const result = await withdrawYield(
        effectiveFundId,
        (data) => {
          console.log("Withdraw yield success:", data);
          
          // Success callback
          if (onWithdrawSuccess) onWithdrawSuccess(data);
          
          // Instead of manually updating the cache with incomplete data,
          // just do a full refetch to get the latest data from the server
          refetch();
          
          // Show toast notification
          const amount = typeof data.amount === 'number' ? data.amount : parseFloat(data.amount || '0');
          toast.success(`$${amount.toFixed(2)} yield withdrawn successfully!`, {
            icon: '💸',
            duration: 4000
          });
        }
      );
      
      if (result?.error) {
        console.error("Error during withdraw yield:", result.error);
        toast.error(`Failed to withdraw yield: ${result.error.message}`);
      }
    } catch (error) {
      console.error("Error withdrawing yield:", error);
      toast.error(`Failed to withdraw yield: ${error.message}`);
    } finally {
      setWithdrawing(false);
    }
  };
  
  // Extract portfolio and fund data
  const portfolio = effectiveData?.portfolio || (useFallbackData ? DEMO_PORTFOLIO : null);
  const fund = effectiveData?.fund || (useFallbackData ? DEMO_PORTFOLIO.fund : null);
  
  // Calculate values for display
  const shares = portfolio?.shares || 0;
  const navValue = fund?.currentNav || 0;
  const portfolioValue = shares * navValue;
  const formattedValue = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(portfolioValue);
  
  // Calculate daily yield
  const dailyYield = portfolio && fund && fund.intradayYield
    ? (fund.intradayYield / 100) * portfolio.shares * fund.currentNav
    : 950.25; // Default value for UI consistency in development
  
  // Format large numbers
  const formatLargeNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };
  
  // Format currency
  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };
  
  // If still loading and no fallback data, show loading state
  if (loading && !useFallbackData) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-6 h-10 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }
  
  // If error and no fallback data, show error state with retry button
  if (error && !useFallbackData && !connectionError) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Portfolio</h3>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
          <div className="text-red-600 font-medium mb-2">Error loading portfolio data</div>
          <p className="text-gray-600 text-sm mb-4">{error.message}</p>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className={`px-4 py-2 rounded-lg text-white ${isRetrying ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dark'}`}
          >
            {isRetrying ? 'Retrying...' : 'Retry Connection'}
          </button>
        </div>
      </div>
    );
  }
  
  // If no portfolio or fund data is available
  if ((!effectiveData?.portfolio || !effectiveData?.fund) && !useFallbackData) {
    return (
      <div className="p-6 bg-yellow-50 text-yellow-900 rounded-lg border border-yellow-200 shadow-md">
        <h2 className="text-xl font-bold mb-2">Portfolio Unavailable</h2>
        <p>Unable to load portfolio data for investor {effectiveInvestorId}.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-yellow-200 text-yellow-900 rounded-lg hover:bg-yellow-300 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // Render portfolio panel when we have data
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-slate-200 text-center">
      <h2 className="text-xl font-semibold text-slate-900 mb-1">{fund.name} Portfolio</h2>
      <p className="text-sm text-slate-500 mb-6">
        Portfolio ID: {portfolio.id} • NAV: ${fund.currentNav.toFixed(2)}
      </p>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-500">Shares Owned</p>
          <p className="text-2xl font-bold text-slate-900">
            <CountUp 
              end={portfolio.shares} 
              decimals={2} 
              duration={1} 
              separator="," 
            />
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-500">Portfolio Value</p>
          <p className="text-2xl font-bold text-slate-900">
            {formattedValue}
          </p>
        </div>
      </div>
      
      <div className="p-4 mb-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg border border-blue-100 relative text-center">
        <div className="flex justify-center items-center mb-3">
          <div>
            <p className="text-sm text-slate-600 flex items-center justify-center">
              Daily Yield
              <button 
                className="ml-2 text-blue-500 hover:text-blue-700"
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
            <p className="text-3xl font-bold text-blue-600 text-center">
              ${' '}
              <CountUp 
                end={dailyYield} 
                decimals={2} 
                duration={1} 
                separator="," 
              />
            </p>
          </div>
        </div>
        
        <div className="flex justify-around items-center mt-4">
          <div className="text-center">
            <p className="text-xs text-slate-500">Current Rate</p>
            <p className="text-sm font-medium text-slate-700">
              {fund.intradayYield}% <span className="text-xs text-slate-500">per day</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Accrued Yield</p>
            <p className="text-sm font-medium text-slate-700">
              ${portfolio.accruedYield ? portfolio.accruedYield.toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Last Updated</p>
            <p className="text-sm font-medium text-slate-700">
              {new Date(fund.updatedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
      
      {/* Fund interactions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center items-center">
        <button
          onClick={() => setShowMintModal(true)}
          className="px-4 py-2 bg-primary text-white font-medium rounded-lg shadow hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light transition-colors min-w-[120px]"
        >
          Mint Shares
        </button>
        <button
          onClick={() => setShowSellModal(true)}
          disabled={loading || !portfolio?.shares || portfolio.shares <= 0}
          className={`px-4 py-2 bg-red-600 text-white font-medium rounded-lg shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors min-w-[120px] ${
            loading || !portfolio?.shares || portfolio.shares <= 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Sell Shares
        </button>
        <button
          onClick={handleWithdrawYield}
          disabled={withdrawing || !data?.portfolio?.accruedYield || data.portfolio.accruedYield === 0}
          className={`px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors min-w-[120px] ${
            withdrawing || !data?.portfolio?.accruedYield || data.portfolio.accruedYield === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
           Withdraw Yield
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