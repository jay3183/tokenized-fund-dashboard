import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_FUND_DETAILS } from '../graphql/queries';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';

const FundDetails = ({ fundId }) => {
  const { loading, error, data } = useQuery(GET_FUND_DETAILS, {
    variables: { fundId },
    skip: !fundId,
    pollInterval: 30000 // Poll every 30 seconds for updates
  });

  if (loading) return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-md">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 gap-4">
          <div className="h-24 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-200 p-4 rounded-lg">
      <p className="font-medium">Error loading fund details</p>
      <p className="text-sm mt-1">{error.message || 'Please try again later'}</p>
    </div>
  );

  if (!data || !data.fundDetails) return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/50 text-yellow-700 dark:text-yellow-200 p-4 rounded-lg">
      <p className="font-medium">No Fund Selected</p>
      <p className="text-sm mt-1">Please select a fund to view its details.</p>
    </div>
  );

  const { fundDetails } = data;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-md">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Fund Details</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {formatDate(fundDetails.lastUpdated)}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{fundDetails.name}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fund Manager</h4>
              <p className="text-gray-900 dark:text-white">{fundDetails.manager}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fund Type</h4>
              <p className="text-gray-900 dark:text-white">{fundDetails.type}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Inception Date</h4>
              <p className="text-gray-900 dark:text-white">{formatDate(fundDetails.inceptionDate)}</p>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current NAV</h4>
              <p className="text-gray-900 dark:text-white">{formatCurrency(fundDetails.currentNav)}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Yield</h4>
              <p className="text-gray-900 dark:text-white">{formatPercentage(fundDetails.currentYield)}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total AUM</h4>
              <p className="text-gray-900 dark:text-white">{formatCurrency(fundDetails.totalAum)}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h4>
          <p className="text-gray-600 dark:text-gray-300">{fundDetails.description}</p>
        </div>
        
        {fundDetails.yieldHistory && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Yield History</h4>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="font-medium text-gray-500 dark:text-gray-400">Period</div>
              <div className="font-medium text-gray-500 dark:text-gray-400">1 Month</div>
              <div className="font-medium text-gray-500 dark:text-gray-400">3 Months</div>
              <div className="font-medium text-gray-500 dark:text-gray-400">YTD</div>
              
              <div className="text-gray-600 dark:text-gray-300">Yield</div>
              <div className="text-gray-900 dark:text-white">{formatPercentage(fundDetails.yieldHistory.oneMonth)}</div>
              <div className="text-gray-900 dark:text-white">{formatPercentage(fundDetails.yieldHistory.threeMonths)}</div>
              <div className="text-gray-900 dark:text-white">{formatPercentage(fundDetails.yieldHistory.ytd)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundDetails; 