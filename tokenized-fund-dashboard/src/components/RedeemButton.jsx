import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function RedeemButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRedeem = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      toast.success('Successfully redeemed 5.00 shares for $498.75', {
        duration: 4000,
        style: {
          background: '#e0f2fe',
          color: '#0c4a6e',
          borderRadius: '8px',
          border: '1px solid #bae6fd',
        },
        icon: '💰',
      });
    } catch (error) {
      toast.error('Failed to redeem shares', {
        style: {
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px',
          border: '1px solid #fecaca',
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRedeem}
      disabled={isLoading}
      className={`bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md transition-all
        duration-200 transform hover:translate-y-[-2px] flex items-center justify-center min-w-[120px]
        ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}`}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>− Redeem Shares</>
      )}
    </button>
  );
} 