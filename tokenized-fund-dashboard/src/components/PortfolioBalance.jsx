import React, { useState, useEffect } from "react";
// Remove react-spring dependency
// import { animated, useSpring, config } from "react-spring";
import { formatCurrency, formatNumber } from "../utils/formatters";

const PortfolioBalance = ({ fund, user }) => {
  const [lastBalance, setLastBalance] = useState(0);
  const [lastChange, setLastChange] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate current balance
  const currentBalance = fund && user ? (fund.currentNav * (user.shares || 0)) : 0;
  const previousBalance = fund && user ? (fund.previousNav * (user.shares || 0)) : 0;
  const change = currentBalance - previousBalance;
  const percentChange = previousBalance > 0 ? (change / previousBalance) * 100 : 0;

  // Update animation states when data changes
  useEffect(() => {
    if (currentBalance !== lastBalance) {
      setIsUpdating(true);
      setLastBalance(currentBalance);
      setLastChange(change);
      
      // Set a timeout to hide the animation
      const timer = setTimeout(() => {
        setIsUpdating(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentBalance, change, lastBalance]);

  // Style for animation
  const updateIndicatorStyle = {
    opacity: isUpdating ? 1 : 0,
    transform: isUpdating ? 'translateY(0)' : 'translateY(10px)',
    transition: 'opacity 0.3s ease, transform 0.3s ease'
  };

  return (
    <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Portfolio Balance</h3>
          <div className="flex items-baseline mt-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(currentBalance)}
            </h2>
            <div
              style={updateIndicatorStyle}
              className="ml-2 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded"
            >
              Updated
            </div>
          </div>
          
          <div className="flex items-center mt-2">
            <span className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '+' : ''}{formatCurrency(change)} ({change >= 0 ? '+' : ''}{percentChange.toFixed(2)}%)
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">24h</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${change >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-6 w-6 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {change >= 0 ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            )}
          </svg>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current NAV</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {formatCurrency(fund?.currentNav || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Shares</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {formatNumber(user?.shares || 0)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Unrealized Yield</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {formatCurrency((fund?.intradayYield / 100 / 365) * currentBalance * 30 || 0)}
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">per month</span>
            </p>
          </div>
          <button className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioBalance; 