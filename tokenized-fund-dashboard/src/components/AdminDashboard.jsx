import React, { useState, useEffect } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import DashboardMetrics from './DashboardMetrics';
import RecentActivity from './RecentActivity';

// Metric Card Component
const MetricCard = ({ title, value, change, icon, bgColor, textColor, loading }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className={`h-2 ${bgColor}`}></div>
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
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
                <h3 className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</h3>
                {change && (
                  <div className="flex items-center mt-1">
                    {change > 0 ? (
                      <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-500 dark:text-red-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    <span className={change > 0 ? 'text-green-600 dark:text-green-400 text-sm' : 'text-red-600 dark:text-red-400 text-sm'}>
                      {change > 0 ? '+' : ''}{formatPercentage(change)}
                    </span>
                  </div>
                )}
              </div>
              <div className={`p-2 rounded-lg ${bgColor} bg-opacity-20 dark:bg-opacity-20`}>
                {icon}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// System Status Component
const SystemStatus = ({ statuses, loading }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">System Status</h3>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {statuses.map((status, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${status.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-700 dark:text-gray-300">{status.name}</span>
                </div>
                <span className={status.online ? 'text-green-600 dark:text-green-400 text-sm' : 'text-red-600 dark:text-red-400 text-sm'}>
                  {status.online ? 'Online' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
const AdminDashboard = ({ metrics, logs, loading, error }) => {
  const [statuses, setStatuses] = useState([]);
  
  useEffect(() => {
    // Only fetch system status data - metrics and logs come from props
    const fetchSystemStatus = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock system status data
        setStatuses([
          { name: 'GraphQL API', online: true },
          { name: 'Database', online: true },
          { name: 'Blockchain Node', online: true },
          { name: 'Authentication Service', online: true }
        ]);
      } catch (err) {
        console.error('Error fetching system status:', err);
      }
    };
    
    fetchSystemStatus();
  }, []);

  // Show loading state if data is being fetched
  if (loading && !metrics && !logs) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-32"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-64"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-64"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
        <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
        <p>{error.message}</p>
        <button 
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Admin Dashboard</h1>
      
      {/* Dashboard Metrics */}
      <DashboardMetrics metrics={metrics} loading={loading} />
      
      {/* Activity and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity logs={logs} loading={loading} />
        <SystemStatus statuses={statuses} loading={loading} />
      </div>
      
      {/* Additional dashboard sections can be added here */}
    </div>
  );
};

export default AdminDashboard; 