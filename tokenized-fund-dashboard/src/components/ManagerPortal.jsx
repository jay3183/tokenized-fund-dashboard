import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import ManagerFundPerformance from './ManagerFundPerformance';
import ManagerInvestorHeatmap from './ManagerInvestorHeatmap';
import ManagerAlertCenter from './ManagerAlertCenter';
import { useAuth } from '../contexts/AuthContext';

// Define the GraphQL query outside of the component
const FUNDS_QUERY = gql`
  query AllFunds {
    allFunds {
      id
      name
      currentNav
      intradayYield
      totalAum
    }
  }
`;

// Main Manager Portal Component
const ManagerPortal = () => {
  const { isAuthenticated, user, role } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFund, setSelectedFund] = useState(null);
  const [dateRange, setDateRange] = useState('7d');
  const [alertsFilter, setAlertsFilter] = useState('all');
  const [complianceMode, setComplianceMode] = useState(false);
  const [manuallyFetchedFunds, setManuallyFetchedFunds] = useState([]);

  // Check for token directly
  const token = localStorage.getItem('token');
  console.log('[ManagerPortal] Starting component with token:', token ? `${token.substring(0, 15)}...` : 'none');
  
  // Enhanced direct fetch function to verify server communication
  const directFetchFunds = () => {
    console.log('[ManagerPortal] Attempting direct fetch with token:', token);
    
    // Log the exact headers we're sending
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
    console.log('[ManagerPortal] Direct fetch headers:', requestHeaders);
    
    // Create the request body as a properly stringified JSON object
    const requestBody = {
      query: `
        query DirectFundsFetch {
          allFunds {
            id
            name
            currentNav
            intradayYield
            totalAum
          }
        }
      `
    };
    
    // Log the actual payload being sent to debug
    console.log('[ManagerPortal] Direct fetch payload:', JSON.stringify(requestBody));
    
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody) // THIS IS THE KEY FIX - must stringify the body
    })
    .then(res => {
      console.log('[ManagerPortal] Direct fetch status:', res.status);
      if (!res.ok) {
        console.error('[ManagerPortal] Direct fetch response not OK:', res.statusText);
      }
      return res.json();
    })
    .then(result => {
      console.log('[ManagerPortal] Direct fetch result:', result);
      if (result.data && result.data.allFunds) {
        console.log('[ManagerPortal] Successfully fetched', result.data.allFunds.length, 'funds directly');
        setManuallyFetchedFunds(result.data.allFunds);
      }
      if (result.errors) {
        console.error('[ManagerPortal] GraphQL errors:', result.errors);
      }
    })
    .catch(err => {
      console.error('[ManagerPortal] Direct fetch error:', err);
    });
  };
  
  // Execute direct fetch on mount
  useEffect(() => {
    directFetchFunds();
  }, [token]);
  
  // Use the Apollo Client to fetch funds data
  const { loading, error, data, refetch } = useQuery(FUNDS_QUERY, {
    fetchPolicy: 'network-only',
    onError: (err) => {
      console.error('[ManagerPortal] GraphQL error:', err);
      if (err.networkError) {
        console.error('[ManagerPortal] Network error status:', err.networkError.statusCode);
        console.error('[ManagerPortal] Network error details:', err.networkError);
      }
      // Since Apollo query failed, make sure we have the direct fetch data
      if (manuallyFetchedFunds.length === 0) {
        directFetchFunds();
      }
    }
  });

  // Use either Apollo data or manually fetched data
  const funds = data?.allFunds || manuallyFetchedFunds || [];
  
  // Add debug logging to track the data received
  useEffect(() => {
    console.log('[ManagerPortal] Auth token:', localStorage.getItem('token'));
    console.log('[ManagerPortal] Loading state:', loading);
    console.log('[ManagerPortal] Error state:', error);
    console.log('[ManagerPortal] Fetched data:', data);
    console.log('[ManagerPortal] Manual data:', manuallyFetchedFunds);
    console.log('[ManagerPortal] Funds array:', funds);
  }, [data, loading, error, funds, manuallyFetchedFunds]);
  
  // Dark mode executive theme styles
  const containerClasses = "bg-gray-900 text-gray-100 min-h-screen";
  const headerClasses = "bg-gray-800 border-b border-gray-700 mb-6 p-4";
  const cardClasses = "bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 mb-4";
  const tabClasses = "px-4 py-2 font-medium rounded-t-lg";
  const activeTabClasses = "bg-gray-800 text-blue-400 border-t border-l border-r border-gray-700";
  const inactiveTabClasses = "bg-gray-900 text-gray-400 hover:text-gray-200";
  const buttonClasses = "bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded";
  const dangerButtonClasses = "bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded";
  const metricClasses = "text-3xl font-bold mb-1";
  const labelClasses = "text-gray-400 text-sm";

  // Placeholder for status data
  const systemStatus = {
    navFeeds: 'operational',
    yieldCalculation: 'operational',
    blockchain: 'operational',
    database: 'operational',
    etlProcesses: 'delayed'
  };

  // Placeholder for team activity data
  const teamActivity = [
    { 
      id: 1, 
      user: 'Olivia Martinez', 
      action: 'Updated NAV manually', 
      fundId: 'F1', 
      fundName: 'OnChain Growth Fund',
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString() 
    },
    { 
      id: 2, 
      user: 'James Wilson', 
      action: 'Exported quarterly report', 
      fundId: 'ALL', 
      fundName: 'All Funds',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() 
    },
    { 
      id: 3, 
      user: 'Sophia Chen', 
      action: 'Approved large redemption', 
      fundId: 'F2', 
      fundName: 'Digital Asset Income Fund',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() 
    },
    { 
      id: 4, 
      user: 'Michael Johnson', 
      action: 'Modified yield calculation parameters', 
      fundId: 'F3', 
      fundName: 'Blockchain Innovation Fund',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() 
    },
  ];

  // Function to format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to get time ago string
  const timeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 24 * 60) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 60 / 24)}d ago`;
  };

  return (
    <div className={containerClasses}>
      <div className={headerClasses}>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manager Portal</h1>
          <div className="flex items-center space-x-4">
            <div className={`${complianceMode ? 'bg-red-600' : 'bg-green-600'} px-3 py-1 rounded-full text-sm`}>
              {complianceMode ? 'Compliance Mode Active' : 'Normal Operations'}
            </div>
            <button 
              onClick={() => setComplianceMode(!complianceMode)}
              className={complianceMode ? buttonClasses : dangerButtonClasses}
            >
              {complianceMode ? 'Exit Compliance Mode' : 'Enter Compliance Mode'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="flex space-x-2 overflow-x-auto pb-1">
            <button 
              className={`${tabClasses} ${activeTab === 'dashboard' ? activeTabClasses : inactiveTabClasses}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`${tabClasses} ${activeTab === 'funds' ? activeTabClasses : inactiveTabClasses}`}
              onClick={() => setActiveTab('funds')}
            >
              Fund Performance
            </button>
            <button 
              className={`${tabClasses} ${activeTab === 'investorMap' ? activeTabClasses : inactiveTabClasses}`}
              onClick={() => setActiveTab('investorMap')}
            >
              Investor Heatmap
            </button>
            <button 
              className={`${tabClasses} ${activeTab === 'alerts' ? activeTabClasses : inactiveTabClasses}`}
              onClick={() => setActiveTab('alerts')}
            >
              Alerts
            </button>
            <button 
              className={`${tabClasses} ${activeTab === 'teamActivity' ? activeTabClasses : inactiveTabClasses}`}
              onClick={() => setActiveTab('teamActivity')}
            >
              Team Activity
            </button>
            <button 
              className={`${tabClasses} ${activeTab === 'dataSync' ? activeTabClasses : inactiveTabClasses}`}
              onClick={() => setActiveTab('dataSync')}
            >
              Data Sync
            </button>
            <button 
              className={`${tabClasses} ${activeTab === 'reports' ? activeTabClasses : inactiveTabClasses}`}
              onClick={() => setActiveTab('reports')}
            >
              Reports
            </button>
          </nav>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-400">Loading fund data...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className={`${cardClasses} border border-red-500/30 mb-6`}>
            <div className="flex items-center text-red-400 mb-2">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium">Error Loading Data</h3>
            </div>
            <p className="text-gray-400 mb-3">There was a problem fetching the fund data. Please try again.</p>
            <p className="text-sm text-gray-500 bg-gray-800/50 p-2 rounded mb-3">{error.message}</p>
            <button onClick={() => refetch()} className={buttonClasses}>
              Try Again
            </button>
          </div>
        )}
        
        {/* Content area - only show when not loading and no error */}
        {!loading && !error && (
          <div className="space-y-6">
            {/* Dashboard Content */}
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Fund Manager Dashboard</h2>
                
                {/* Top KPI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className={cardClasses}>
                    <div className={metricClasses}>
                      {data ? formatCurrency(data.allFunds.reduce((sum, fund) => sum + fund.totalAum, 0)) : '$0'}
                    </div>
                    <div className={labelClasses}>Total AUM</div>
                  </div>
                  
                  <div className={cardClasses}>
                    <div className={metricClasses}>
                      {data ? data.allFunds.length : 0}
                    </div>
                    <div className={labelClasses}>Active Funds</div>
                  </div>
                  
                  <div className={cardClasses}>
                    <div className={metricClasses}>
                      {data ? formatPercentage(data.allFunds.reduce((sum, fund) => sum + fund.intradayYield, 0) / data.allFunds.length) : '0%'}
                    </div>
                    <div className={labelClasses}>Avg. Yield</div>
                  </div>
                  
                  <div className={cardClasses}>
                    <div className={metricClasses}>
                      {/* Placeholder for total investors */}
                      3,457
                    </div>
                    <div className={labelClasses}>Investors</div>
                  </div>
                </div>
                
                {/* System Status */}
                <div className={`${cardClasses} mb-6`}>
                  <h3 className="text-lg font-semibold mb-3">System Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {Object.entries(systemStatus).map(([key, status]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'operational' ? 'bg-green-500' : 
                          status === 'delayed' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Recent Team Activity */}
                <div className={`${cardClasses} mb-6`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Recent Team Activity</h3>
                    <button 
                      className="text-sm text-blue-400 hover:text-blue-300"
                      onClick={() => setActiveTab('teamActivity')}
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {teamActivity.slice(0, 3).map(activity => (
                      <div key={activity.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-lg">
                        <div>
                          <div className="font-medium">{activity.action}</div>
                          <div className="text-xs text-gray-400">
                            {activity.user} • {activity.fundName}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {timeAgo(activity.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Fund Performance Tab */}
            {activeTab === 'funds' && (
              <ManagerFundPerformance funds={funds} />
            )}
            
            {/* Investor Heatmap Tab */}
            {activeTab === 'investorMap' && (
              <ManagerInvestorHeatmap />
            )}
            
            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <ManagerAlertCenter />
            )}
            
            {/* Team Activity Tab */}
            {activeTab === 'teamActivity' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Team Activity Logs</h2>
                <div className={`${cardClasses}`}>
                  <div className="space-y-3">
                    {teamActivity.map(activity => (
                      <div key={activity.id} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="font-semibold">{activity.user.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="font-medium">{activity.action}</div>
                            <div className="text-sm text-gray-400">
                              {activity.user} • {activity.fundName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{timeAgo(activity.timestamp)}</div>
                          <div className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Data Sync Tab */}
            {activeTab === 'dataSync' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Data Sync Monitor</h2>
                <div className={`${cardClasses}`}>
                  <h3 className="text-lg font-medium mb-3">ETL Process Status</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-gray-400 border-b border-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left">Process</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Last Run</th>
                          <th className="px-4 py-2 text-left">Next Run</th>
                          <th className="px-4 py-2 text-left">Duration</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        <tr>
                          <td className="px-4 py-3">NAV Data Import</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Completed
                            </span>
                          </td>
                          <td className="px-4 py-3">2 hours ago</td>
                          <td className="px-4 py-3">in 1 hour</td>
                          <td className="px-4 py-3">1m 45s</td>
                          <td className="px-4 py-3">
                            <button className="text-blue-400 hover:text-blue-300 mr-2">Run Now</button>
                            <button className="text-blue-400 hover:text-blue-300">View Logs</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Yield Calculation</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Completed
                            </span>
                          </td>
                          <td className="px-4 py-3">1 hour ago</td>
                          <td className="px-4 py-3">in 2 hours</td>
                          <td className="px-4 py-3">3m 12s</td>
                          <td className="px-4 py-3">
                            <button className="text-blue-400 hover:text-blue-300 mr-2">Run Now</button>
                            <button className="text-blue-400 hover:text-blue-300">View Logs</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Blockchain Sync</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                              Delayed
                            </span>
                          </td>
                          <td className="px-4 py-3">5 hours ago</td>
                          <td className="px-4 py-3">in progress</td>
                          <td className="px-4 py-3">10m 33s</td>
                          <td className="px-4 py-3">
                            <button className="text-blue-400 hover:text-blue-300 mr-2">Restart</button>
                            <button className="text-blue-400 hover:text-blue-300">View Logs</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Report Builder</h2>
                <div className={`${cardClasses}`}>
                  <h3 className="text-lg font-medium mb-4">Generate Reports</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
                      <select className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Quarterly Performance Report</option>
                        <option>Monthly NAV Summary</option>
                        <option>Investor Distribution Report</option>
                        <option>Yield Analysis Report</option>
                        <option>Audit & Compliance Report</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Fund</label>
                      <select className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>All Funds</option>
                        <option>OnChain Growth Fund</option>
                        <option>Digital Asset Income Fund</option>
                        <option>Blockchain Innovation Fund</option>
                        <option>Tokenized Treasury Fund</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                      <div className="flex space-x-2">
                        <input type="date" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <span className="flex items-center text-gray-400">to</span>
                        <input type="date" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input type="radio" className="form-radio text-blue-500" name="format" value="pdf" checked />
                          <span className="ml-2">PDF</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input type="radio" className="form-radio text-blue-500" name="format" value="excel" />
                          <span className="ml-2">Excel</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input type="radio" className="form-radio text-blue-500" name="format" value="csv" />
                          <span className="ml-2">CSV</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button className={buttonClasses}>
                      Generate Report
                    </button>
                  </div>
                </div>
                
                <div className={`${cardClasses} mt-6`}>
                  <h3 className="text-lg font-medium mb-4">Recent Reports</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-gray-400 border-b border-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left">Report Name</th>
                          <th className="px-4 py-2 text-left">Generated</th>
                          <th className="px-4 py-2 text-left">Generated By</th>
                          <th className="px-4 py-2 text-left">Format</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        <tr>
                          <td className="px-4 py-3">Q1 2023 Performance Report</td>
                          <td className="px-4 py-3">Apr 5, 2023</td>
                          <td className="px-4 py-3">James Wilson</td>
                          <td className="px-4 py-3">PDF</td>
                          <td className="px-4 py-3">
                            <button className="text-blue-400 hover:text-blue-300 mr-2">Download</button>
                            <button className="text-blue-400 hover:text-blue-300">Share</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">March 2023 NAV Summary</td>
                          <td className="px-4 py-3">Apr 2, 2023</td>
                          <td className="px-4 py-3">Olivia Martinez</td>
                          <td className="px-4 py-3">Excel</td>
                          <td className="px-4 py-3">
                            <button className="text-blue-400 hover:text-blue-300 mr-2">Download</button>
                            <button className="text-blue-400 hover:text-blue-300">Share</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Investor Distribution Report</td>
                          <td className="px-4 py-3">Mar 15, 2023</td>
                          <td className="px-4 py-3">Michael Johnson</td>
                          <td className="px-4 py-3">PDF</td>
                          <td className="px-4 py-3">
                            <button className="text-blue-400 hover:text-blue-300 mr-2">Download</button>
                            <button className="text-blue-400 hover:text-blue-300">Share</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerPortal; 