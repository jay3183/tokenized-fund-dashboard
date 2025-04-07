import React from 'react';

/**
 * Skeleton component for loading states
 * Used to display placeholders while content is loading
 */
const Skeleton = ({ className = '', ...props }) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      {...props}
    />
  );
};

export default Skeleton; 