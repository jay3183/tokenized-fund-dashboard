import React, { useState, useEffect } from 'react';
import { formatUSD } from '../utils/formatCurrency';

export default function AccruedYield({ value }) {
  const [count, setCount] = useState(0);
  
  // Simulate real-time accrual by incrementing slightly over time
  useEffect(() => {
    const baseValue = value / 86400; // Per second (24h * 60m * 60s)
    let lastUpdate = Date.now();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastUpdate) / 1000; // seconds
      const increment = baseValue * elapsed;
      
      setCount(prev => prev + increment);
      lastUpdate = now;
    }, 1000);
    
    return () => clearInterval(interval);
  }, [value]);
  
  return (
    <div className="flex items-center font-medium text-green-600 dark:text-green-400">
      {formatUSD(count)}
      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
        (real-time)
      </span>
    </div>
  );
} 