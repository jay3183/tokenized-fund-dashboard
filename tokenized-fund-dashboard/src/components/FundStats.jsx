import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_FUND_STATS } from '../graphql/queries';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';

const StatCard = ({ label, value, change, icon, isPositive, isCurrency = false, isPercentage = false }) => {
  // Format the value based on type
  const formattedValue = isCurrency 
    ? formatCurrency(value)
    : isPercentage 
      ? formatPercentage(value) 
      : value;
  
  // Format the change if it exists
  const formattedChange = change !== undefined 
    ? (isPercentage ? `${change > 0 ? '+' : ''}${formatPercentage(change)}` : `${change > 0 ? '+' : ''}${change}`) 
    : null;
  
  // Determine change label color based on positive/negative
  const changeColorClass = isPositive 
    ? 'text-emerald-600 dark:text-emerald-400' 
    : 'text-red-600 dark:text-red-400';

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5 flex flex-col">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
      </div>
      <span className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{formattedValue}</span>
      {formattedChange && (
        <span className={`text-sm mt-1 font-medium ${changeColorClass}`}>
          {formattedChange} from previous day
        </span>
      )}
    </div>
  );
};

const FundStats = ({ fundId }) => {
  const { loading, error, data } = useQuery(GET_FUND_STATS, {
    variables: { fundId },
    skip: !fundId,
    pollInterval: 30000 // Poll every 30 seconds for updates
  });

  if (loading) return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-md">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-200 p-4 rounded-lg">
      <p className="font-medium">Error loading fund statistics</p>
      <p className="text-sm mt-1">{error.message || 'Please try again later'}</p>
    </div>
  );

  if (!data || !data.fundStats) return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/50 text-yellow-700 dark:text-yellow-200 p-4 rounded-lg">
      <p className="font-medium">No Fund Selected</p>
      <p className="text-sm mt-1">Please select a fund to view its statistics.</p>
    </div>
  );

  const { fundStats } = data;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-md">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Fund Statistics</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {formatDate(fundStats.lastUpdated)}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          label="Current NAV" 
          value={fundStats.currentNav}
          change={fundStats.navChange}
          isPositive={fundStats.navChange > 0}
          isCurrency={true}
        />
        
        <StatCard 
          label="Total AUM" 
          value={fundStats.totalAum}
          change={fundStats.aumChange}
          isPositive={fundStats.aumChange > 0}
          isCurrency={true}
        />
        
        <StatCard 
          label="Current Yield" 
          value={fundStats.currentYield}
          change={fundStats.yieldChange}
          isPositive={fundStats.yieldChange > 0}
          isPercentage={true}
        />
        
        <StatCard 
          label="Total Investors" 
          value={fundStats.totalInvestors}
          change={fundStats.investorsChange}
          isPositive={fundStats.investorsChange > 0}
        />
        
        <StatCard 
          label="Total Shares" 
          value={fundStats.totalShares.toFixed(2)}
          change={fundStats.sharesChange}
          isPositive={fundStats.sharesChange > 0}
        />
        
        <StatCard 
          label="Daily Volume" 
          value={fundStats.dailyVolume}
          change={fundStats.volumeChange}
          isPositive={fundStats.volumeChange > 0}
          isCurrency={true}
        />
      </div>
    </div>
  );
};

export default FundStats; 