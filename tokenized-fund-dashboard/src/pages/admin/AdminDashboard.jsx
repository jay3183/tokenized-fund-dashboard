import React from 'react';
import { useQuery, gql } from '@apollo/client';
import DashboardMetrics from '../../components/DashboardMetrics';
import { Card } from '../../components/ui';
import { FaCheckCircle } from 'react-icons/fa';

const DASHBOARD_QUERY = gql`
  query GetDashboardMetrics {
    dashboardMetrics {
      totalAum
      activeFunds
      activeInvestors
      averageYield
    }
    recentAdminActivity {
      id
      actor
      action
      timestamp
      metadata
    }
    systemStatus {
      dbConnected
      chainlinkResponding
      yieldUpdaterRunning
    }
  }
`;

const SystemStatusItem = ({ label, isActive = true }) => (
  <div className="flex items-center mb-3 last:mb-0">
    <FaCheckCircle className={`mr-2 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
  </div>
);

const AdminDashboard = () => {
  const { data, loading, error } = useQuery(DASHBOARD_QUERY, {
    fetchPolicy: 'network-only' // Ensure fresh data each time
  });
  
  // Create a grid of quick action links
  const quickActions = [
    {
      title: 'Fund Management',
      path: '/admin/funds',
      icon: '📊',
      description: 'Create, edit, and manage tokenized funds'
    },
    {
      title: 'User Management',
      path: '/admin/users',
      icon: '👥',
      description: 'Manage investor accounts and permissions'
    },
    {
      title: 'NAV Controls',
      path: '/admin/nav',
      icon: '💹',
      description: 'Update and control fund NAV values'
    },
    {
      title: 'Yield Controls',
      path: '/admin/yield',
      icon: '📈',
      description: 'Set and distribute yield to investors'
    },
    {
      title: 'Audit Logs',
      path: '/admin/audit',
      icon: '📝',
      description: 'View system activity and user actions'
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      icon: '⚙️',
      description: 'Configure system parameters and defaults'
    }
  ];

  // Use mock data for development if the query is still loading or failed
  const metrics = data?.dashboardMetrics || {
    totalAum: 8245690,
    activeFunds: 8,
    activeInvestors: 143,
    averageYield: 4.32
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Admin Dashboard</h1>
      
      {/* Metrics Row */}
      <DashboardMetrics 
        loading={loading} 
        metrics={metrics} 
      />
      
      {/* Activity and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="h-full p-5">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col space-y-1 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 border border-red-200 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-500 dark:text-red-400">Error loading activity data: {error.message}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
              >
                Try refreshing
              </button>
            </div>
          ) : !data?.recentAdminActivity?.length ? (
            <p className="text-gray-500 dark:text-gray-400 p-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded">
              No recent activities
            </p>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {data.recentAdminActivity.map(log => (
                <div key={log.id} className="pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="font-medium">{log.actor}</span>
                  </div>
                  <p className="mt-1">{log.action}</p>
                  {log.metadata && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {typeof log.metadata === 'object' 
                        ? JSON.stringify(log.metadata)
                        : log.metadata.toString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
        
        {/* System Status */}
        <Card className="h-full p-5">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          <div className="space-y-3">
            <SystemStatusItem label="GraphQL API" isActive={true} />
            <SystemStatusItem label="Database" isActive={data?.systemStatus?.dbConnected !== false} />
            <SystemStatusItem label="Blockchain Node" isActive={data?.systemStatus?.chainlinkResponding !== false} />
          </div>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-5">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.path}
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start">
                <span className="text-2xl mr-4">{action.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{action.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{action.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 