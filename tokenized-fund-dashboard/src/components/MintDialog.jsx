import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../utils/formatters';
import { usePortfolio } from '../contexts/PortfolioContext';

const MintSharesModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  amount, 
  setAmount, 
  isSubmitting,
  fundId,
  nav = 100,
  errorMessage = null
}) => {
  const [shares, setShares] = useState(0);
  const { error: portfolioError } = usePortfolio();
  const displayError = errorMessage || portfolioError;

  // Calculate shares when amount changes
  useEffect(() => {
    if (amount && !isNaN(amount) && nav > 0) {
      const calculatedShares = parseFloat(amount) / nav;
      setShares(calculatedShares);
    } else {
      setShares(0);
    }
  }, [amount, nav]);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Mint Fund Shares</h3>
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
              Current NAV: {formatCurrency(nav)}
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
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className={`px-4 py-2 rounded-lg text-white 
                        ${isSubmitting || !amount || parseFloat(amount) <= 0
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                        }`}
            >
              {isSubmitting ? 'Processing...' : 'Mint Shares'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MintSharesModal; 