import React from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const StatCard = ({ label, value, change, isPositive, isCurrency = false, isPercentage = false }) => {
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
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{formattedValue}</span>
      {formattedChange && (
        <span className={`text-sm mt-1 font-medium ${changeColorClass}`}>
          {formattedChange}
        </span>
      )}
    </div>
  );
};

export const PortfolioStats = ({ 
  fundName,
  sharesOwned,
  sharePrice,
  totalValue,
  accruedYield,
  yieldRate
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard 
        label="Total Shares Owned" 
        value={sharesOwned.toFixed(2)}
      />
      
      <StatCard 
        label="Current Share Price" 
        value={sharePrice}
        isCurrency={true}
      />
      
      <StatCard 
        label="Total Portfolio Value" 
        value={totalValue}
        isCurrency={true}
      />
      
      <StatCard 
        label="Accrued Yield" 
        value={accruedYield}
        isCurrency={true}
        isPositive={true}
      />
      
      <StatCard 
        label="Current Yield Rate" 
        value={yieldRate}
        isPercentage={true}
        isPositive={true}
      />
      
      <StatCard 
        label="Fund" 
        value={fundName}
      />
    </div>
  );
};

export default PortfolioStats; 