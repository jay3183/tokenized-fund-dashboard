import React, { useState } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { animated, useSpring, config } from 'react-spring';

const AnnualYieldPanel = ({ fund, user }) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Demo data if not provided
  const yieldRate = fund?.currentYield || 4.2; // Annual yield percentage
  const portfolioValue = fund?.nav * fund?.shareBalance || 75042.83; // Total portfolio value
  const shareBalance = fund?.shareBalance || 750.4283;
  
  // Calculate accrued yield (demo - in real app would come from API)
  const currentMonth = new Date().getMonth();
  const daysInMonth = new Date(new Date().getFullYear(), currentMonth + 1, 0).getDate();
  const dayOfMonth = new Date().getDate();
  const monthlyProgress = dayOfMonth / daysInMonth;
  
  // Monthly yield is annual yield divided by 12, then multiplied by days progress
  const annualYield = portfolioValue * (yieldRate / 100);
  const monthlyYield = annualYield / 12;
  const accruedYield = monthlyYield * monthlyProgress;
  
  // Has enough accrued to withdraw
  const canWithdraw = accruedYield >= 25; // Minimum $25 to withdraw
  
  // Next payment date - first day of next month
  const nextPaymentDate = new Date();
  nextPaymentDate.setDate(1);
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  
  // Animation for accrued yield value
  const yieldProps = useSpring({
    value: accruedYield,
    from: { value: 0 },
    config: { ...config.molasses, duration: 2000 },
  });
  
  // Handle withdraw button click
  const handleWithdrawClick = () => {
    if (!canWithdraw) return;
    setShowConfirmation(true);
  };
  
  // Handle confirmation of withdrawal
  const handleConfirmWithdraw = () => {
    setIsWithdrawing(true);
    setShowConfirmation(false);
    
    // Simulate API call to withdraw yield
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      
      // Reset success message after a delay
      setTimeout(() => {
        setWithdrawSuccess(false);
      }, 3000);
    }, 1500);
  };
  
  // Animation for monthly progress bar
  const progressBarProps = useSpring({
    width: `${monthlyProgress * 100}%`,
    from: { width: '0%' },
    config: config.molasses,
  });
  
  if (!fund && !user) {
    return (
      <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-5"></div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
            </div>
            <div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
            </div>
          </div>
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-gray-500 dark:text-gray-400 text-sm">Accrued Yield</span>
          <div className="flex items-baseline mt-1">
            <animated.h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {yieldProps.value.to(val => formatCurrency(val))}
            </animated.h2>
          </div>
        </div>
        <div className="text-right">
          <span className="text-gray-500 dark:text-gray-400 text-sm">Annual Rate</span>
          <div className="text-xl font-semibold text-green-600 dark:text-green-400 mt-1">
            {formatPercentage(yieldRate)}
          </div>
        </div>
      </div>
      
      {/* Progress bar for monthly accrual */}
      <div className="mt-4">
        <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <animated.div 
            style={progressBarProps}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-secondary to-secondary-light rounded-full" 
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Month Progress ({Math.round(monthlyProgress * 100)}%)</span>
          <span>Next Payment: {nextPaymentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-5">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Yield</div>
          <div className="text-lg font-medium text-gray-900 dark:text-white mt-1">
            {formatCurrency(monthlyYield)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Annual Projection</div>
          <div className="text-lg font-medium text-gray-900 dark:text-white mt-1">
            {formatCurrency(annualYield)}
          </div>
        </div>
      </div>
      
      {/* Withdraw button */}
      <div className="mt-5">
        <button
          onClick={handleWithdrawClick}
          disabled={!canWithdraw || isWithdrawing}
          className={`w-full py-2.5 px-4 rounded-lg text-center text-white font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 
            ${canWithdraw && !isWithdrawing
              ? 'bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-dark hover:to-secondary shadow-sm hover:shadow focus:ring-secondary'
              : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
            }`}
        >
          {isWithdrawing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : withdrawSuccess ? (
            <span className="flex items-center justify-center">
              <svg className="h-4 w-4 mr-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Withdrawal Successful
            </span>
          ) : canWithdraw ? (
            "Withdraw Yield"
          ) : (
            `Minimum $25 Required (${formatCurrency(accruedYield)} Available)`
          )}
        </button>
        
        {!canWithdraw && !isWithdrawing && !withdrawSuccess && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Yield is paid monthly, but you can withdraw accrued interest anytime after reaching the $25 minimum.
          </p>
        )}
      </div>
      
      {/* Withdrawal confirmation modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Confirm Yield Withdrawal</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You are about to withdraw <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(accruedYield)}</span> of accrued yield. 
              This amount will be sent to your connected bank account.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Processing usually takes 1-2 business days.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWithdraw}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-secondary to-secondary-light rounded-lg text-white font-medium hover:from-secondary-dark hover:to-secondary shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualYieldPanel; 