import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_FUND_NAV, UPDATE_FUND_YIELD } from '../graphql/queries';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { toast } from 'react-hot-toast';

const FundActions = ({ fundId }) => {
  const [navValue, setNavValue] = useState('');
  const [yieldValue, setYieldValue] = useState('');
  
  const [updateNav, { loading: navLoading }] = useMutation(UPDATE_FUND_NAV, {
    onCompleted: () => {
      toast.success('NAV updated successfully');
      setNavValue('');
    },
    onError: (error) => {
      toast.error(`Error updating NAV: ${error.message}`);
    }
  });
  
  const [updateYield, { loading: yieldLoading }] = useMutation(UPDATE_FUND_YIELD, {
    onCompleted: () => {
      toast.success('Yield updated successfully');
      setYieldValue('');
    },
    onError: (error) => {
      toast.error(`Error updating yield: ${error.message}`);
    }
  });
  
  const handleNavUpdate = (e) => {
    e.preventDefault();
    
    const parsedNav = parseFloat(navValue);
    if (isNaN(parsedNav) || parsedNav <= 0) {
      toast.error('Please enter a valid NAV value');
      return;
    }
    
    updateNav({
      variables: {
        fundId,
        nav: parsedNav
      }
    });
  };
  
  const handleYieldUpdate = (e) => {
    e.preventDefault();
    
    const parsedYield = parseFloat(yieldValue);
    if (isNaN(parsedYield) || parsedYield < 0) {
      toast.error('Please enter a valid yield value');
      return;
    }
    
    updateYield({
      variables: {
        fundId,
        yieldRate: parsedYield
      }
    });
  };
  
  if (!fundId) return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/50 text-yellow-700 dark:text-yellow-200 p-4 rounded-lg">
      <p className="font-medium">No Fund Selected</p>
      <p className="text-sm mt-1">Please select a fund to manage its settings.</p>
    </div>
  );
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Fund Management</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update NAV and yield rate for the selected fund
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NAV Update Form */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Update NAV</h3>
          
          <form onSubmit={handleNavUpdate}>
            <div className="mb-4">
              <label 
                htmlFor="nav-value" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                New NAV Value
              </label>
              <input
                id="nav-value"
                type="number"
                value={navValue}
                onChange={(e) => setNavValue(e.target.value)}
                placeholder="Enter NAV value"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={navLoading || !navValue}
              className={`px-4 py-2 rounded-lg text-white w-full
                        ${navLoading || !navValue
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-primary hover:bg-primary-600 active:bg-primary-700'
                        }`}
            >
              {navLoading ? 'Updating...' : 'Update NAV'}
            </button>
          </form>
        </div>
        
        {/* Yield Update Form */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Update Yield</h3>
          
          <form onSubmit={handleYieldUpdate}>
            <div className="mb-4">
              <label 
                htmlFor="yield-value" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                New Yield Rate (%)
              </label>
              <input
                id="yield-value"
                type="number"
                value={yieldValue}
                onChange={(e) => setYieldValue(e.target.value)}
                placeholder="Enter yield percentage"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={yieldLoading || !yieldValue}
              className={`px-4 py-2 rounded-lg text-white w-full
                        ${yieldLoading || !yieldValue
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                        }`}
            >
              {yieldLoading ? 'Updating...' : 'Update Yield'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FundActions; 