import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../utils/formatters';
import { usePortfolio } from '../contexts/PortfolioContext';

const MintSharesModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  setAmount, 
  fundId,
  navPrice = 100,
  fundName = '',
  onMint,
  loading = false,
  error = null
}) => {
  const [shares, setShares] = useState(0);
  const { error: portfolioError } = usePortfolio();
  const displayError = error || portfolioError;

  // Calculate shares when amount changes
  useEffect(() => {
    if (amount && !isNaN(amount) && navPrice > 0) {
      const calculatedShares = parseFloat(amount) / navPrice;
      setShares(calculatedShares);
    } else {
      setShares(0);
    }
  }, [amount, navPrice]);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onMint(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Buy Shares {fundName && `- ${fundName}`}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {displayError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {displayError}
            </div>
          )}
          
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Current NAV: {formatCurrency(navPrice)}
            </p>
            
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount to Invest (USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Shares you will receive: <span className="font-medium">{shares.toFixed(4)}</span>
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className={`px-4 py-2 rounded-lg text-white 
                        ${loading || !amount || parseFloat(amount) <= 0
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                        }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Buy Shares'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MintSharesModal; 