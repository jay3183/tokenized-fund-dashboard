import React, { useContext, useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { RoleContext } from '../context/RoleContext';
import { GET_PORTFOLIO, MINT_SHARES, REDEEM_SHARES, WITHDRAW_YIELD } from '../graphql/queries';
import { toast } from 'react-hot-toast';

// Portfolio Stats component for displaying key metrics
const PortfolioStat = ({ label, value, unit, isHighlighted }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-col">
    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</div>
    <div className={`text-xl font-bold flex items-center ${isHighlighted ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'}`}>
      {value}
      {unit && <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">{unit}</span>}
    </div>
  </div>
);

export default function PortfolioPanel({ fundId, investorId }) {
  const { role } = useContext(RoleContext);
  const [lastWithdrawalTime, setLastWithdrawalTime] = useState(null);
  const [isYieldWithdrawn, setIsYieldWithdrawn] = useState(false);
  
  const { data, loading, error, refetch } = useQuery(GET_PORTFOLIO, {
    variables: { investorId, fundId },
    fetchPolicy: 'cache-and-network',
    pollInterval: 15000 // Match server update interval
  });

  const portfolio = data?.portfolio;
  const shares = portfolio?.shares?.toFixed(2) || '0.00';
  const nav = data?.fund?.currentNav || 100;
  const yieldRate = data?.fund?.intradayYield || 0;
  
  // Calculate accrued yield - adjust if recent withdrawal
  const calculateAccruedYield = () => {
    if (isYieldWithdrawn && lastWithdrawalTime) {
      const timeSinceWithdrawal = (new Date() - new Date(lastWithdrawalTime)) / (1000 * 60 * 60 * 24);
      // Only show yield that has accrued since last withdrawal
      return parseFloat((shares * nav * (yieldRate / 100) * timeSinceWithdrawal).toFixed(2));
    }
    return parseFloat((shares * nav * (yieldRate / 100) / 365).toFixed(2));
  };
  
  const accrued = calculateAccruedYield();

  // Reset withdrawal state when NAV or yield rate updates
  useEffect(() => {
    // If more than 1 hour has passed since last withdrawal, reset the state
    if (lastWithdrawalTime) {
      const hoursSinceWithdrawal = (new Date() - new Date(lastWithdrawalTime)) / (1000 * 60 * 60);
      if (hoursSinceWithdrawal > 1) {
        setIsYieldWithdrawn(false);
      }
    }
  }, [nav, yieldRate, lastWithdrawalTime]);

  const [mint, { loading: mintLoading }] = useMutation(MINT_SHARES);
  const [redeem, { loading: redeemLoading }] = useMutation(REDEEM_SHARES);
  const [withdraw, { loading: withdrawLoading }] = useMutation(WITHDRAW_YIELD);

  const handleMint = async () => {
    const amountUsd = 100; // static demo amount
    console.log('Minting shares:', { investorId, fundId, amountUsd });
    
    try {
      const { data: result } = await mint({ 
        variables: { 
          input: { investorId, fundId, amountUsd } 
        }
      });
      
      console.log('Mint result:', result);
      
      if (result?.mintShares?.sharesMinted) {
        toast.success(`Minted $${amountUsd} at NAV $${nav}`);
        refetch();
      } else {
        toast.error('Mint failed: No shares were minted');
      }
    } catch (err) {
      console.error('Mint error:', err);
      toast.error(`Mint failed: ${err.message}`);
    }
  };

  const handleRedeem = async () => {
    const redeemShares = 1;
    console.log('Redeeming shares:', { investorId, fundId, shares: redeemShares });
    
    try {
      const { data: result } = await redeem({ 
        variables: { 
          input: { investorId, fundId, shares: redeemShares } 
        } 
      });
      
      console.log('Redeem result:', result);
      
      if (result?.redeemShares?.amountUSD > 0) {
        toast.success(`Redeemed 1.00 share at NAV $${nav}`);
        refetch();
      } else {
        toast.error('Redeem failed: No amount was returned');
      }
    } catch (err) {
      console.error('Redeem error:', err);
      toast.error(`Redeem failed: ${err.message}`);
    }
  };

  const handleWithdraw = async () => {
    console.log('Withdrawing yield:', { investorId, fundId });
    
    try {
      const { data: result } = await withdraw({ 
        variables: { investorId, fundId } 
      });
      
      console.log('Withdraw result:', result);
      
      const amount = result?.withdrawYield?.amount;
      const timestamp = result?.withdrawYield?.timestamp;
      
      if (amount && amount > 0) {
        toast.success(`Withdrawn $${amount.toFixed(2)} yield`);
        setLastWithdrawalTime(timestamp);
        setIsYieldWithdrawn(true);
        await refetch(); // Force refetch to ensure we have latest data
      } else {
        toast.error('No yield available to withdraw');
      }
    } catch (err) {
      console.error('Withdraw error:', err);
      toast.error(`Withdraw failed: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow dark:shadow-gray-700 max-w-2xl mx-auto mt-8">
      <p className="text-center text-gray-500 dark:text-gray-400">Loading portfolio data...</p>
    </div>
  );

  if (error) return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow dark:shadow-gray-700 max-w-2xl mx-auto mt-8">
      <p className="text-center text-red-500 dark:text-red-400">Error: {error.message}</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow dark:shadow-gray-700 max-w-2xl mx-auto mt-8">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Your Portfolio</h2>
        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 px-2 py-1 rounded-full">{role}</span>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 flex items-center gap-4">
        <div className="text-indigo-600 dark:text-indigo-400">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5v1h.25a.75.75 0 010 1.5h-.25v.75a.75.75 0 01-1.5 0v-.75h-.25a.75.75 0 010-1.5h.25v-1h-.5a.75.75 0 010-1.5h.5z"/></svg>
        </div>
        <div>
          <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">Total Shares</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{shares}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Portfolio Value</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">${(shares * nav).toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Accrued Yield
            {isYieldWithdrawn && (
              <span className="ml-1 text-xs text-green-600 dark:text-green-400">(Since last withdrawal)</span>
            )}
          </p>
          <p className="text-xl font-semibold text-green-600 dark:text-green-400">${accrued > 0 ? accrued.toFixed(2) : '0.00'}</p>
        </div>
      </div>

      {lastWithdrawalTime && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          Last yield withdrawal: {new Date(lastWithdrawalTime).toLocaleString()}
        </div>
      )}

      <div className="flex justify-center gap-4 mt-6">
        <button 
          onClick={handleMint} 
          disabled={mintLoading}
          className={`${mintLoading ? 'bg-blue-400 dark:bg-blue-500' : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600'} text-white px-6 py-2 rounded-lg`}
        >
          {mintLoading ? 'Minting...' : '+ Mint Shares'}
        </button>
        <button 
          onClick={handleRedeem} 
          disabled={redeemLoading || parseFloat(shares) < 1}
          className={`${redeemLoading ? 'bg-gray-400 dark:bg-gray-500' : parseFloat(shares) < 1 ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700'} text-white px-6 py-2 rounded-lg`}
        >
          {redeemLoading ? 'Redeeming...' : '− Redeem Shares'}
        </button>
        <button 
          onClick={handleWithdraw} 
          disabled={withdrawLoading || accrued <= 0}
          className={`${withdrawLoading ? 'bg-green-400 dark:bg-green-500' : accrued <= 0 ? 'bg-green-400 dark:bg-green-500 cursor-not-allowed' : 'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600'} text-white px-6 py-2 rounded-lg`}
        >
          {withdrawLoading ? 'Withdrawing...' : isYieldWithdrawn && accrued <= 0.1 ? 'Yield Withdrawn' : 'Withdraw Yield'}
        </button>
      </div>
    </div>
  );
} 