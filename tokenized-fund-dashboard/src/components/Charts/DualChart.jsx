import React, { useState, useRef } from 'react';

export default function DualChart({ navHistory = [], yieldHistory = [], currentNav, currentYield, className = '' }) {
  const [isActive, setIsActive] = useState('nav');
  const chartRef = useRef(null);
  
  const userId = localStorage.getItem('userId');
  const isAuthenticated = !!localStorage.getItem('token');
  
  // Return early if not authenticated
  if (!isAuthenticated || !userId) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 ${className}`}>
        <p className="text-center text-gray-500 dark:text-gray-400">Please log in to view charts</p>
      </div>
    );
  }
  
  // ... rest of the component
} 