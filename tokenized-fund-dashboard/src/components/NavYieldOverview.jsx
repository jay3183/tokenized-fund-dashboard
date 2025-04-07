import React, { useState, useEffect } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const NavYieldOverview = ({ fund }) => {
  const [changing, setChanging] = useState(false);
  
  // Calculate daily and weekly changes
  const dailyNavChange = fund?.dailyChange || 0.23; // Demo value if not provided
  const weeklyNavChange = fund?.weeklyChange || 1.65; // Demo value if not provided
  const dailyYieldChange = fund?.dailyYieldChange || 0.18; // Demo value if not provided
  const weeklyYieldChange = fund?.weeklyYieldChange || 1.41; // Demo value if not provided
  
  // Track last NAV value to animate changes
  const [lastNAV, setLastNAV] = useState(fund?.nav || 100);
  const [lastYield, setLastYield] = useState(fund?.currentYield || 4.2);
  
  // Current values (without animations)
  const currentNav = fund?.nav || 100;
  const currentYield = fund?.currentYield || 4.2;
  
  // Update last values when fund changes
  useEffect(() => {
    if (fund?.nav && fund.nav !== lastNAV) {
      setChanging(true);
      setLastNAV(fund.nav);
      
      // Set a timeout to hide the "Updated" badge
      const timer = setTimeout(() => {
        setChanging(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    if (fund?.currentYield && fund.currentYield !== lastYield) {
      setLastYield(fund.currentYield);
    }
  }, [fund?.nav, fund?.currentYield]);
  
  // Animate the change indicator
  const changeIndicatorProps = {
    opacity: changing ? 1 : 0,
    transform: changing ? 'translateY(0)' : 'translateY(10px)',
    from: { opacity: 0, transform: 'translateY(10px)' },
    config: { tension: 300, friction: 20 },
  };
  
  if (!fund) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
        <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* NAV Card */}
      <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none">
          <div className="absolute top-4 right-4 opacity-5 transform rotate-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        
        <span className="text-gray-500 dark:text-gray-400 text-sm">Current NAV</span>
        <div className="flex items-baseline mt-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(currentNav)}
          </h2>
          <div style={changeIndicatorProps} className="ml-2 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded opacity-0">
            Updated
          </div>
        </div>
        
        <div className="flex items-center mt-3 space-x-4">
          <div className="flex items-center">
            <div className={`flex items-center ${dailyNavChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <span className="mr-1">
                {dailyNavChange >= 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </span>
              <span className="text-sm font-medium">{formatPercentage(Math.abs(dailyNavChange))}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">24h</span>
          </div>
          
          <div className="flex items-center">
            <div className={`flex items-center ${weeklyNavChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <span className="mr-1">
                {weeklyNavChange >= 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </span>
              <span className="text-sm font-medium">{formatPercentage(Math.abs(weeklyNavChange))}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">7d</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Updated {fund.lastUpdate ? new Date(fund.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:45 PM'}</span>
            <span>Volume: {formatCurrency(fund.volume || 243500)}</span>
          </div>
        </div>
      </div>
      
      {/* Yield Card */}
      <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none">
          <div className="absolute top-4 right-4 opacity-5 transform rotate-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <span className="text-gray-500 dark:text-gray-400 text-sm">Current Yield</span>
        <div className="flex items-baseline mt-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(currentYield)}
          </h2>
          <span className="ml-1 text-gray-700 dark:text-gray-300 text-lg">APY</span>
        </div>
        
        <div className="flex items-center mt-3 space-x-4">
          <div className="flex items-center">
            <div className={`flex items-center ${dailyYieldChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <span className="mr-1">
                {dailyYieldChange >= 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </span>
              <span className="text-sm font-medium">{formatPercentage(Math.abs(dailyYieldChange))}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">24h</span>
          </div>
          
          <div className="flex items-center">
            <div className={`flex items-center ${weeklyYieldChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <span className="mr-1">
                {weeklyYieldChange >= 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </span>
              <span className="text-sm font-medium">{formatPercentage(Math.abs(weeklyYieldChange))}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">7d</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Projected Annual: {formatCurrency((fund.shareBalance || 1000) * (fund.currentYield || 4.2) / 100)}</span>
            <span>Paid Monthly</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavYieldOverview; 