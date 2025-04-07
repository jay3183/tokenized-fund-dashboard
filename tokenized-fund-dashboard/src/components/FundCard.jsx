import React, { useEffect } from 'react';
import DeltaBadge from './DeltaBadge';
import YieldBadge from './YieldBadge';
import AccruedYield from './AccruedYield';
import { formatUSD, formatAUM } from '../utils/formatCurrency';
import { timeAgo } from '../utils/timeAgo';
import { formatNumber } from '../utils/formatNumber';
import { formatDate } from '../utils/formatDate';

export default function FundCard({ fund, onClick, isSelected }) {
  const userId = localStorage.getItem('userId');
  const isAuthenticated = !!localStorage.getItem('token');
  
  // Return empty card or nothing if not authenticated
  if (!isAuthenticated || !userId) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700">
        <p className="text-center text-gray-500 dark:text-gray-400">Please log in to view fund details</p>
      </div>
    );
  }

  // Update the Fund Card styling with premium feel
  const fundClasses = `p-0 border transition-all duration-300 h-full rounded-xl overflow-hidden
                      ${isSelected
                        ? 'bg-white dark:bg-gray-800 border-secondary shadow-lg dark:shadow-secondary/20 dark:border-secondary'
                        : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg'
                      }`;

  // Calculate the last update time
  const lastUpdate = fund.navHistory && fund.navHistory.length > 0 
    ? timeAgo(fund.navHistory[fund.navHistory.length - 1].timestamp)
    : 'No updates';
    
  // Calculate NAV percent change using previousNav
  const currentNav = parseFloat(fund.currentNav || 0);
  // Improve handling of previousNav - don't default to 0
  const previousNav = fund.previousNav != null ? parseFloat(fund.previousNav) : null;
  
  // Log raw NAV values for debugging
  console.log(`[DEBUG] Fund ${fund.name} Raw NAV Values:`, {
    currentNav: fund.currentNav, 
    previousNav: fund.previousNav,
    currentNavParsed: currentNav,
    previousNavParsed: previousNav,
    currentNavType: typeof fund.currentNav,
    previousNavType: typeof fund.previousNav
  });
  
  // Calculate NAV percent change with improved guard clause
  let navChangePercent = 0;
  const navDiff = previousNav !== null ? (currentNav - previousNav) : 0;
  
  // Only calculate percentage if previousNav is valid and non-zero
  if (previousNav !== null && previousNav > 0) {
    // Calculate the percentage change
    navChangePercent = (navDiff / previousNav) * 100;
    
    // Log detailed calculation for debugging
    console.log(`[DEBUG] NAV delta calculation:`, {
      formula: `(${currentNav} - ${previousNav}) / ${previousNav} * 100`,
      rawResult: navChangePercent,
      formattedTo4: navChangePercent.toFixed(4) + '%',
      formattedTo2: navChangePercent.toFixed(2) + '%'
    });
  } else {
    console.log('[DEBUG] Skipping NAV delta calculation - previousNav is null or zero:', previousNav);
  }
  
  // Use 2 decimal places for display
  const formattedChangePercent = Math.abs(navChangePercent).toFixed(2);
  const isNavUp = navDiff >= 0;
  
  // Add detailed debug logging for NAV values
  useEffect(() => {
    console.log(`[DEBUG] Fund ${fund.name} NAV Values:`, {
      current: currentNav,
      previous: previousNav,
      diff: navDiff,
      percentChange: formattedChangePercent,
      formattedChange: formattedChangePercent,
      calculation: `(${currentNav} - ${previousNav}) / ${previousNav} * 100 = ${formattedChangePercent}%`,
      fundObj: fund
    });
  }, [fund, currentNav, previousNav, navDiff, formattedChangePercent]);

  return (
    <div
      className={fundClasses}
      onClick={onClick}
    >
      {/* Header section with premium gradient */}
      <div className={`${isSelected ? 'gold-gradient' : 'premium-gradient'} px-6 py-4`}>
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold text-white">
            {fund.name}
          </h3>
          {isSelected && (
            <div className="flex h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm items-center justify-center border border-white/30">
              <span className="h-3 w-3 text-white">✓</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1.5">
          <YieldBadge 
            value={fund.intradayYield} 
            className="bg-white/10 backdrop-blur-sm text-white border border-white/30"
          />
          <span className="text-xs text-white/80 font-light">
            Updated {lastUpdate}
          </span>
        </div>
      </div>
      
      {/* Content section */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Current NAV</span>
            <div className="flex items-baseline mt-1">
              <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${currentNav.toFixed(2)}
              </span>
              <DeltaBadge delta={navChangePercent} className="ml-2" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total AUM</span>
            <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
              {formatAUM(fund.totalAum)}
            </span>
          </div>
        </div>
        
        {/* Footer with additional info */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Chain ID: {fund.chainId || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 