import React from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

// StatBox component for displaying individual metrics
const StatBox = ({ label, value, delta, icon, loading, bgColor = 'bg-blue-500' }) => {
  const deltaClass = delta && parseFloat(delta) >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className={`h-1 ${bgColor}`}></div>
      <div className="p-4">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">{value}</h3>
                {delta && (
                  <div className="flex items-center mt-1">
                    {parseFloat(delta) >= 0 ? (
                      <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-500 dark:text-red-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    <span className={deltaClass}>
                      {parseFloat(delta) >= 0 ? '+' : ''}{delta}
                    </span>
                  </div>
                )}
              </div>
              {icon && (
                <div className={`p-2 rounded-lg ${bgColor} bg-opacity-20 dark:bg-opacity-20`}>
                  {icon}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Main DashboardMetrics component
const DashboardMetrics = ({ metrics, loading }) => {
  // Icons for metrics
  const icons = {
    totalAum: (
      <svg className="w-5 h-5 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    activeInvestors: (
      <svg className="w-5 h-5 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    activeFunds: (
      <svg className="w-5 h-5 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    averageYield: (
      <svg className="w-5 h-5 text-purple-600 dark:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {loading && !metrics ? (
        // Loading placeholders
        Array(4).fill(0).map((_, i) => (
          <StatBox key={i} loading={true} />
        ))
      ) : (
        // Actual metrics
        <>
          <StatBox
            label="Total AUM"
            value={formatCurrency(metrics?.totalAum || 0)}
            delta="+1.8%"
            icon={icons.totalAum}
            loading={loading}
            bgColor="bg-blue-500"
          />
          <StatBox
            label="Active Investors"
            value={metrics?.activeInvestors || 0}
            delta="+3.2%"
            icon={icons.activeInvestors}
            loading={loading}
            bgColor="bg-green-500"
          />
          <StatBox
            label="Active Funds"
            value={metrics?.activeFunds || 0}
            delta="0%"
            icon={icons.activeFunds}
            loading={loading}
            bgColor="bg-amber-500"
          />
          <StatBox
            label="Average Yield"
            value={formatPercentage(metrics?.averageYield || 0)}
            delta="-0.12%"
            icon={icons.averageYield}
            loading={loading}
            bgColor="bg-purple-500"
          />
        </>
      )}
    </div>
  );
};

export default DashboardMetrics; 