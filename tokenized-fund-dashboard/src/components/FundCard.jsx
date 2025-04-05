import React from 'react';
import DeltaBadge from './DeltaBadge';
import YieldBadge from './YieldBadge';
import AccruedYield from './AccruedYield';
import { formatUSD, formatAUM } from '../utils/formatCurrency';
import { timeAgo } from '../utils/timeAgo';

export default function FundCard({ fund, onClick, isSelected }) {
  const fundClasses = `
    relative p-4 rounded-lg border transition-all
    ${isSelected 
      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}
    hover:border-blue-300 dark:hover:border-blue-600
    shadow-sm hover:shadow-md cursor-pointer
  `;

  // Calculate the last update time
  const lastUpdate = fund.navHistory && fund.navHistory.length > 0 
    ? timeAgo(fund.navHistory[fund.navHistory.length - 1].timestamp)
    : 'No updates';

  return (
    <div 
      className={fundClasses}
      onClick={() => onClick(fund.id)}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {fund.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdate}
          </p>
        </div>
        <YieldBadge value={fund.intradayYield} />
      </div>

      {/* Card Body */}
      <div className="space-y-3">
        {/* NAV and Delta */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">Current NAV</div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatUSD(fund.currentNAV?.nav || fund.currentNav)}
            </span>
            <DeltaBadge 
              value={(fund.navHistory && fund.navHistory.length > 1) 
                ? (fund.currentNAV?.nav || fund.currentNav) - fund.navHistory[fund.navHistory.length - 2].nav 
                : 0} 
            />
          </div>
        </div>

        {/* AUM */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total AUM</div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {formatAUM(fund.totalAum)}
          </div>
        </div>

        {/* Accrued Yield */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">Accrued Yield</div>
          <AccruedYield value={
            (fund.totalAum != null && fund.intradayYield != null) 
              ? fund.totalAum * (fund.intradayYield / 100 / 365) 
              : 0
          } />
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -right-1 -top-1">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      )}
    </div>
  );
} 