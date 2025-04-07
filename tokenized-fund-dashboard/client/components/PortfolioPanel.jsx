import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { toast } from 'react-toastify';
import CountUp from 'react-countup';

// Query to fetch portfolio data
const GET_PORTFOLIO = gql`
  query GetPortfolio($investorId: String!, $fundId: String!) {
    portfolio(investorId: $investorId, fundId: $fundId) {
      shares
      accruedYield
      lastYieldWithdrawal
      fund {
        name
        currentNav
        intradayYield
      }
    }
  }
`;

// Withdraw yield mutation
const WITHDRAW_YIELD = gql`
  mutation WithdrawYield($input: WithdrawYieldInput!) {
    withdrawYield(input: $input) {
      amount
      timestamp
    }
  }
`;

export default function PortfolioPanel({ investorId, fundId, onWithdrawSuccess }) {
  const [withdrawing, setWithdrawing] = useState(false);
  
  // Fetch portfolio data with network-only policy to ensure fresh data
  const { data, loading, error, refetch } = useQuery(GET_PORTFOLIO, {
    variables: { investorId, fundId },
    fetchPolicy: 'network-only',
    onError: (err) => {
      console.error('[PortfolioPanel] Apollo Error:', err);
      toast.error('Failed to load portfolio');
    }
  });
  
  // Refetch when investorId or fundId changes
  useEffect(() => {
    if (investorId && fundId) refetch();
  }, [investorId, fundId, refetch]);
  
  const [withdrawYieldMutation] = useMutation(WITHDRAW_YIELD);
  
  const handleWithdrawYield = async () => {
    if (!data?.portfolio?.accruedYield || data.portfolio.accruedYield <= 0) {
      toast.info('No yield available to withdraw');
      return;
    }
    
    setWithdrawing(true);
    
    try {
      const { data: withdrawData } = await withdrawYieldMutation({
        variables: {
          input: {
            investorId,
            fundId
          }
        }
      });
      
      toast.success(`Successfully withdrew $${withdrawData.withdrawYield.amount.toFixed(2)}`);
      
      if (onWithdrawSuccess) {
        onWithdrawSuccess(withdrawData.withdrawYield);
      }
      
      // Refetch portfolio data to update UI
      refetch();
    } catch (err) {
      console.error('Error withdrawing yield:', err);
      toast.error('Failed to withdraw yield');
    } finally {
      setWithdrawing(false);
    }
  };
  
  // Show loading state
  if (loading) {
    return <div className="p-4 border rounded shadow">Loading portfolio...</div>;
  }
  
  // Show error state
  if (error) {
    return (
      <div className="p-4 border rounded shadow bg-red-50 text-red-700">
        <h3 className="font-bold">Error loading portfolio</h3>
        <p>{error.message}</p>
        <button 
          onClick={() => refetch()}
          className="mt-2 px-3 py-1 bg-red-100 rounded"
        >
          Retry
        </button>
      </div>
    );
  }
  
  const portfolio = data?.portfolio;
  
  if (!portfolio) {
    return <div className="p-4 border rounded shadow">No portfolio data found</div>;
  }
  
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">{portfolio.fund.name} Portfolio</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-blue-50 rounded">
          <div className="text-sm text-gray-600">Shares</div>
          <div className="text-xl font-bold">{portfolio.shares.toFixed(4)}</div>
        </div>
        
        <div className="p-3 bg-green-50 rounded">
          <div className="text-sm text-gray-600">Value</div>
          <div className="text-xl font-bold">
            ${(portfolio.shares * portfolio.fund.currentNav).toFixed(2)}
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-yellow-50 rounded mb-4">
        <div className="text-sm text-gray-600">Accrued Yield</div>
        <div className="text-xl font-bold text-yellow-700">
          <CountUp 
            end={portfolio.accruedYield || 0} 
            duration={1.5} 
            decimals={2}
            prefix="$" 
          />
        </div>
      </div>
      
      <button
        onClick={handleWithdrawYield}
        disabled={withdrawing || !portfolio.accruedYield || portfolio.accruedYield <= 0}
        className="w-full py-2 bg-yellow-500 text-white rounded font-medium disabled:opacity-50"
      >
        {withdrawing ? "Withdrawing..." : "Withdraw Yield"}
      </button>
    </div>
  );
} 