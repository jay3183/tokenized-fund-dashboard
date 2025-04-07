import React, { useState } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const ManagerAlertCenter = () => {
  const [alertFilter, setAlertFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  
  // Mock data for alerts
  const mockAlerts = [
    {
      id: 'a1',
      type: 'yield',
      severity: 'high',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      fundId: 'F1',
      fundName: 'OnChain Growth Fund',
      message: 'Abnormal yield increase detected',
      details: {
        previousValue: 1.35,
        currentValue: 1.85,
        percentChange: 37.04,
        threshold: 15,
        impactedInvestors: 1245,
        potentialCause: 'Sudden increase in underlying asset performance'
      }
    },
    {
      id: 'a2',
      type: 'nav',
      severity: 'medium',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      fundId: 'F2',
      fundName: 'Digital Asset Income Fund',
      message: 'NAV deviation from expected range',
      details: {
        previousValue: 98.75,
        currentValue: 97.45,
        percentChange: -1.32,
        threshold: 1,
        impactedInvestors: 875,
        potentialCause: 'Market volatility in underlying assets'
      }
    },
    {
      id: 'a3',
      type: 'trading',
      severity: 'low',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      fundId: 'F3',
      fundName: 'Blockchain Innovation Fund',
      message: 'Unusual trading volume detected',
      details: {
        expectedVolume: 250000,
        actualVolume: 450000,
        percentChange: 80,
        threshold: 50,
        impactedInvestors: 0,
        potentialCause: 'Institutional investor activity'
      }
    },
    {
      id: 'a4',
      type: 'system',
      severity: 'high',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      fundId: 'ALL',
      fundName: 'All Funds',
      message: 'ETL process delay detected',
      details: {
        expectedTime: '15:30 UTC',
        actualTime: '16:15 UTC',
        delayMinutes: 45,
        threshold: 30,
        impactedFunds: 5,
        potentialCause: 'Data provider API rate limiting'
      }
    },
    {
      id: 'a5',
      type: 'compliance',
      severity: 'medium',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      fundId: 'F1',
      fundName: 'OnChain Growth Fund',
      message: 'Large redemption requiring review',
      details: {
        transactionId: 'T12345',
        amount: 2500000,
        investorId: 'I789',
        investorName: 'Institutional Client',
        threshold: 1000000,
        potentialImpact: 'May require liquidity adjustment'
      }
    },
    {
      id: 'a6',
      type: 'yield',
      severity: 'low',
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      fundId: 'F4',
      fundName: 'Tokenized Treasury Fund',
      message: 'Yield calculation anomaly detected',
      details: {
        expectedValue: 3.45,
        actualValue: 3.25,
        percentDiff: -5.8,
        threshold: 5,
        impactedInvestors: 532,
        potentialCause: 'Reference rate discrepancy'
      }
    },
    {
      id: 'a7',
      type: 'nav',
      severity: 'high',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      fundId: 'F2',
      fundName: 'Digital Asset Income Fund',
      message: 'Critical NAV calculation error',
      details: {
        computedNav: 97.25,
        publishedNav: 97.45,
        errorMargin: 0.21,
        threshold: 0.1,
        impactedInvestors: 875,
        potentialCause: 'Price feed inconsistency from provider'
      }
    },
  ];
  
  // Filter alerts based on type and period
  const filterAlerts = () => {
    const periodMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    
    const now = Date.now();
    const timeCutoff = now - periodMs[selectedPeriod];
    
    return mockAlerts.filter(alert => {
      const alertTime = new Date(alert.timestamp).getTime();
      const withinTimeRange = alertTime >= timeCutoff;
      
      if (!withinTimeRange) return false;
      
      if (alertFilter === 'all') return true;
      return alert.type === alertFilter;
    });
  };
  
  const filteredAlerts = filterAlerts();
  
  // Helper for formatting time ago
  const timeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };
  
  // Helper for severity colors
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };
  
  // Helper for alert type icons
  const getAlertTypeIcon = (type) => {
    switch (type) {
      case 'yield':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
            <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
            <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
          </svg>
        );
      case 'nav':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 7.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zm3.75-1.5a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0V12zm2.25-3a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0V9.75A.75.75 0 0113.5 9zm3.75-1.5a.75.75 0 00-1.5 0v9a.75.75 0 001.5 0v-9z" clipRule="evenodd" />
          </svg>
        );
      case 'trading':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
          </svg>
        );
      case 'system':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M2.25 5.25a3 3 0 013-3h13.5a3 3 0 013 3V15a3 3 0 01-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 01-.53 1.28h-9a.75.75 0 01-.53-1.28l.621-.622a2.25 2.25 0 00.659-1.59V18h-3a3 3 0 01-3-3V5.25zm1.5 0v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5z" clipRule="evenodd" />
          </svg>
        );
      case 'compliance':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
            <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
        );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-semibold">Alert Center</h2>
        
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <div className="bg-gray-800 rounded-lg p-1">
            <button
              className={`px-3 py-1 rounded-md text-sm ${selectedPeriod === '24h' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setSelectedPeriod('24h')}
            >
              24h
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${selectedPeriod === '7d' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setSelectedPeriod('7d')}
            >
              7d
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${selectedPeriod === '30d' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setSelectedPeriod('30d')}
            >
              30d
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-1">
            <button
              className={`px-3 py-1 rounded-md text-sm ${alertFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setAlertFilter('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${alertFilter === 'yield' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setAlertFilter('yield')}
            >
              Yield
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${alertFilter === 'nav' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setAlertFilter('nav')}
            >
              NAV
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${alertFilter === 'system' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setAlertFilter('system')}
            >
              System
            </button>
          </div>
        </div>
      </div>
      
      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 rounded-full bg-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="font-medium">High Priority</span>
          </div>
          <div className="text-3xl font-bold">
            {filteredAlerts.filter(a => a.severity === 'high').length}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 rounded-full bg-yellow-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="font-medium">Medium Priority</span>
          </div>
          <div className="text-3xl font-bold">
            {filteredAlerts.filter(a => a.severity === 'medium').length}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 rounded-full bg-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium">Low Priority</span>
          </div>
          <div className="text-3xl font-bold">
            {filteredAlerts.filter(a => a.severity === 'low').length}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 rounded-full bg-gray-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
            <span className="font-medium">Total Alerts</span>
          </div>
          <div className="text-3xl font-bold">
            {filteredAlerts.length}
          </div>
        </div>
      </div>
      
      {/* Alerts List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-700">
          {filteredAlerts.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No alerts found matching your criteria
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div key={alert.id} className="text-sm">
                <div 
                  className="p-4 hover:bg-gray-700 cursor-pointer"
                  onClick={() => setShowDetails(showDetails === alert.id ? null : alert.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-full ${getSeverityColor(alert.severity)}`}>
                        {getAlertTypeIcon(alert.type)}
                      </div>
                      <div>
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-xs text-gray-400">
                          {alert.fundName} • {timeAgo(alert.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Alert Details Expansion */}
                {showDetails === alert.id && (
                  <div className="bg-gray-900 p-4 border-l-2 border-blue-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-gray-300">Alert Details</h4>
                        <div className="space-y-2">
                          {Object.entries(alert.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="font-mono">
                                {typeof value === 'number' && key.toLowerCase().includes('percent') 
                                  ? formatPercentage(value)
                                  : typeof value === 'number' && (key.toLowerCase().includes('amount') || key.toLowerCase().includes('volume'))
                                    ? formatCurrency(value)
                                    : value.toString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-gray-300">Recommended Actions</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                          {alert.type === 'yield' && (
                            <>
                              <li>Verify yield calculation inputs</li>
                              <li>Check for market conditions that may explain the change</li>
                              <li>Review underlying asset performance</li>
                              <li>Consider notifying investors if variation persists</li>
                            </>
                          )}
                          
                          {alert.type === 'nav' && (
                            <>
                              <li>Validate price feeds from all sources</li>
                              <li>Check for calculation errors in NAV computation</li>
                              <li>Review recent transactions for impact</li>
                              <li>Consider delaying publication until verified</li>
                            </>
                          )}
                          
                          {alert.type === 'trading' && (
                            <>
                              <li>Monitor for market manipulation patterns</li>
                              <li>Review large transactions for compliance</li>
                              <li>Check for correlated market movements</li>
                              <li>Ensure sufficient liquidity for redemptions</li>
                            </>
                          )}
                          
                          {alert.type === 'system' && (
                            <>
                              <li>Check system logs for errors</li>
                              <li>Verify data provider connectivity</li>
                              <li>Restart affected services if necessary</li>
                              <li>Contact DevOps team for assistance</li>
                            </>
                          )}
                          
                          {alert.type === 'compliance' && (
                            <>
                              <li>Review transaction against compliance rules</li>
                              <li>Check investor KYC/AML status</li>
                              <li>Document review decision for audit</li>
                              <li>Escalate to compliance officer if needed</li>
                            </>
                          )}
                        </ul>
                        
                        <div className="mt-4 flex space-x-2">
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">
                            Mark as Reviewed
                          </button>
                          <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs">
                            Escalate
                          </button>
                          <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerAlertCenter; 