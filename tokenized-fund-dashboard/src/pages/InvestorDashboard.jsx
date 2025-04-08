import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PortfolioPanel from '../components/PortfolioPanel';
import FundChart from '../components/FundChart';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function InvestorDashboard() {
  const { user, role } = useAuth();
  if (!user) return <div className='text-center text-red-500'>User not authenticated.</div>;
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Timer to update the "last updated" text
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(Date.now());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Calculate seconds/minutes since last update
  const getTimeAgo = () => {
    const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
    if (seconds < 60) {
      return `${seconds} seconds ago`;
    }
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 py-12">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
          Investor Dashboard
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-10">
          Welcome back, <span className="font-semibold">{user?.name || 'User'}</span> — manage your fund shares, yield, and performance.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Account info card */}
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Your Account</h2>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Last updated {getTimeAgo()}
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4 text-left text-slate-700 dark:text-slate-300">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</p>
              <p>{user?.email || 'Not available'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">User ID</p>
              <p>{user?.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Role</p>
              <p>{user?.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Authentication</p>
              <p>Authenticated</p>
            </div>
          </div>
        </div>

        {/* Portfolio panel */}
        <div className="mb-6 flex justify-center">
          {isLoading ? (
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8 animate-pulse w-full">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
            </div>
          ) : (
            <PortfolioPanel 
              fundId="F1" 
              investorId={user?.id || ''} 
              onMintSuccess={(amount) => toast.success(`Minted ${amount} shares successfully!`)}
              onSellSuccess={(amount) => toast.success(`Sold ${amount} shares successfully!`)}
              onWithdrawSuccess={(data) => {
                // Ensure amount is a number before using toFixed
                const amount = typeof data.amount === 'number' ? data.amount : parseFloat(data.amount || '0');
                toast.success(`Withdrew $${amount.toFixed(2)} yield successfully!`);
              }}
            />
          )}
        </div>

        {/* Charts section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className={isLoading ? "animate-pulse" : ""}>
            {isLoading ? (
              <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6 h-80">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2"></div>
                <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded my-4"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mx-auto"></div>
              </div>
            ) : (
              <FundChart fundId="F1" type="nav" />
            )}
          </div>
          
          <div className={isLoading ? "animate-pulse" : ""}>
            {isLoading ? (
              <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6 h-80">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2"></div>
                <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded my-4"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mx-auto"></div>
              </div>
            ) : (
              <FundChart fundId="F1" type="yield" />
            )}
          </div>
        </div>

        {/* Disclaimer and information */}
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6 border-t-4 border-primary">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Franklin Templeton Fund Information</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Track your investments in real-time with our tokenized fund dashboard. The NAV and yield data 
            are updated throughout the trading day to reflect market conditions.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 italic">
            Investment products: • NOT FDIC Insured • NO Bank Guarantee • MAY Lose Value
          </p>
        </div>
      </div>
    </div>
  );
}
