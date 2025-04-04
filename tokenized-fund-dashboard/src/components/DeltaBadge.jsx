import React from 'react';

export default function DeltaBadge({ value, className = "" }) {
  const isPositive = value > 0;
  const isZero = value === 0;
  
  return (
    <span 
      className={`
        inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded
        ${isPositive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
         isZero ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' : 
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}
        ${className}
      `}
    >
      {isPositive ? '+' : ''}
      ${Math.abs(value).toFixed(2)}
      {!isZero && (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-3 w-3 ml-0.5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d={isPositive ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
          />
        </svg>
      )}
    </span>
  );
} 