import React from 'react';

export default function YieldBadge({ value, className = "" }) {
  const isPositive = value >= 0;
  
  return (
    <span 
      className={`
        inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded
        ${isPositive ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'}
        ${className}
      `}
    >
      {isPositive ? '+' : ''}
      {value.toFixed(3)}%
      {isPositive ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </span>
  );
} 