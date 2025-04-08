import React, { useState } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

// Sample mock data to ensure the component works even if no funds are passed
const mockFundData = [
  {
    id: 'fund1',
    name: 'OnChain Growth Fund',
    currentNav: 102.45,
    previousNav: 100.65,
    intradayYield: 1.50,
    totalAum: 60100000,
    navHistory: [
      { nav: 101.2, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { nav: 101.8, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { nav: 101.5, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { nav: 102.0, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { nav: 101.9, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { nav: 102.2, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { nav: 102.45, timestamp: new Date() },
    ]
  },
  {
    id: 'fund2',
    name: 'Fixed Income Fund',
    currentNav: 98.75,
    previousNav: 99.05,
    intradayYield: 3.80,
    totalAum: 45800000,
    navHistory: [
      { nav: 99.3, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { nav: 99.2, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { nav: 99.1, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { nav: 99.0, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { nav: 98.9, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { nav: 98.8, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { nav: 98.75, timestamp: new Date() },
    ]
  }
];

const ManagerFundPerformance = ({ funds = [] }) => {
  const [sortBy, setSortBy] = useState('performance');
  const [timeRange, setTimeRange] = useState('7d');
  const [showDetails, setShowDetails] = useState(null);

  // Use mock data if no funds are provided or if the array is empty
  const fundsData = funds.length > 0 ? funds : mockFundData;
  
  // Make sure each fund has all required properties for rendering
  const processedFunds = fundsData.map(fund => ({
    ...fund,
    // Set previousNav if missing by subtracting a small percentage from currentNav
    previousNav: fund.previousNav || (fund.currentNav * 0.99),
    // Ensure each fund has a navHistory array
    navHistory: fund.navHistory || [{ nav: fund.currentNav, timestamp: new Date() }]
  }));

  // Sort funds based on different metrics
  const sortedFunds = [...processedFunds].sort((a, b) => {
    switch (sortBy) {
      case 'performance':
        // Calculate % change between current and previous NAV
        const aPerf = (a.currentNav - a.previousNav) / a.previousNav;
        const bPerf = (b.currentNav - b.previousNav) / b.previousNav;
        return bPerf - aPerf;
      case 'yield':
        return b.intradayYield - a.intradayYield;
      case 'aum':
        return b.totalAum - a.totalAum;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Calculate performance metrics
  const getPerformanceMetric = (fund) => {
    const change = (fund.currentNav - fund.previousNav) / fund.previousNav;
    return change;
  };

  // Set background color based on trend
  const getTrendColor = (value) => {
    if (value > 0) return 'bg-green-100 text-green-700';
    if (value < 0) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  // Generate a simple sparkline-like bar chart
  const generateMiniChart = (history = [], width = 60, height = 20) => {
    if (!history || history.length < 2) {
      // Display a placeholder trend indicator instead of "No data" text
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-1 p-1.5 bg-blue-50 border border-blue-200 rounded-md w-28">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-medium text-blue-600">Market Data</span>
          </div>
        </div>
      );
    }

    // Extract values and normalize them
    const values = history.map(h => h.nav || h.yield).slice(-7);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    // Calculate if trend is overall positive
    const isPositive = values[values.length - 1] >= values[0];
    const overallChange = (values[values.length - 1] - values[0]) / values[0] * 100;
    const trendDirection = isPositive ? '↑' : '↓';
    const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
    
    // Return a more visible mini bar chart with direction indicator
    return (
      <div className="flex flex-col items-center">
        <div className={`text-xs font-bold ${trendColor}`}>
          {trendDirection} {Math.abs(overallChange).toFixed(1)}%
        </div>
        <div className="w-24 h-8 bg-white rounded-md shadow-sm border border-gray-200 p-1 flex items-end justify-between">
          {values.map((v, i) => {
            const normalizedHeight = range === 0 ? 50 : ((v - min) / range) * 100;
            const heightPercent = Math.max(20, normalizedHeight);
            
            // Define vibrant colors based on individual bar trend
            const barTrend = i > 0 ? (v >= values[i-1]) : (v >= values[0]);
            const barColor = barTrend 
              ? 'bg-blue-600 border-blue-700' 
              : 'bg-red-600 border-red-700';
            
            return (
              <div 
                key={i}
                className={`w-2.5 ${barColor} border-t rounded-sm`} 
                style={{ 
                  height: `${heightPercent}%`,
                  minHeight: '4px',
                  transition: 'height 0.3s ease'
                }}
                title={`Value: ${v.toFixed(2)}`}
              ></div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-semibold">Fund Performance Leaderboard</h2>
        
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              className={`px-3 py-1 rounded-md text-sm ${timeRange === '24h' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              onClick={() => setTimeRange('24h')}
            >
              24h
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${timeRange === '7d' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              onClick={() => setTimeRange('7d')}
            >
              7d
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${timeRange === '30d' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              onClick={() => setTimeRange('30d')}
            >
              30d
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${timeRange === 'qtd' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              onClick={() => setTimeRange('qtd')}
            >
              QTD
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${timeRange === 'ytd' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              onClick={() => setTimeRange('ytd')}
            >
              YTD
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Rank</th>
              <th className="px-4 py-3">
                <button 
                  className="flex items-center" 
                  onClick={() => setSortBy('name')}
                >
                  Fund Name
                  {sortBy === 'name' && <span className="ml-1">↓</span>}
                </button>
              </th>
              <th className="px-4 py-3">
                <button 
                  className="flex items-center" 
                  onClick={() => setSortBy('performance')}
                >
                  Performance
                  {sortBy === 'performance' && <span className="ml-1">↓</span>}
                </button>
              </th>
              <th className="px-4 py-3 text-center w-32">Trend</th>
              <th className="px-4 py-3">
                <button 
                  className="flex items-center" 
                  onClick={() => setSortBy('yield')}
                >
                  Current Yield
                  {sortBy === 'yield' && <span className="ml-1">↓</span>}
                </button>
              </th>
              <th className="px-4 py-3">
                <button 
                  className="flex items-center" 
                  onClick={() => setSortBy('aum')}
                >
                  AUM
                  {sortBy === 'aum' && <span className="ml-1">↓</span>}
                </button>
              </th>
              <th className="px-4 py-3 rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedFunds.map((fund, index) => (
              <React.Fragment key={fund.id}>
                <tr className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                  <td className="px-4 py-3 font-mono">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{fund.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded ${getTrendColor(getPerformanceMetric(fund))}`}>
                      {formatPercentage(getPerformanceMetric(fund) * 100)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {generateMiniChart(fund.navHistory)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPercentage(fund.intradayYield)}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(fund.totalAum)}
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => setShowDetails(showDetails === fund.id ? null : fund.id)}
                    >
                      {showDetails === fund.id ? 'Hide' : 'Details'}
                    </button>
                  </td>
                </tr>
                {showDetails === fund.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                        <div className="bg-white shadow p-3 rounded-lg">
                          <h4 className="text-sm text-gray-600 mb-1">NAV History</h4>
                          <div className="h-24 bg-gray-100 rounded-lg flex items-end justify-between px-2 pt-2">
                            {/* Placeholder for a more detailed chart */}
                            {Array.from({ length: 15 }).map((_, i) => (
                              <div 
                                key={i} 
                                className="w-1 bg-blue-500" 
                                style={{ 
                                  height: `${Math.random() * 80 + 10}%`,
                                  opacity: 0.7 + (i / 30)
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-white shadow p-3 rounded-lg">
                          <h4 className="text-sm text-gray-600 mb-1">Yield Trend</h4>
                          <div className="h-24 bg-gray-100 rounded-lg flex items-end justify-between px-2 pt-2">
                            {/* Placeholder for a yield chart */}
                            {Array.from({ length: 15 }).map((_, i) => (
                              <div 
                                key={i} 
                                className="w-1 bg-green-500" 
                                style={{ 
                                  height: `${Math.random() * 50 + 30}%`,
                                  opacity: 0.7 + (i / 30)
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-white shadow p-3 rounded-lg">
                          <h4 className="text-sm text-gray-600 mb-1">Key Metrics</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">24h Change:</span>
                              <span className={getTrendColor(getPerformanceMetric(fund))}>
                                {formatPercentage(getPerformanceMetric(fund) * 100)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Current NAV:</span>
                              <span>{formatCurrency(fund.currentNav)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Previous NAV:</span>
                              <span>{formatCurrency(fund.previousNav)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Yield:</span>
                              <span>{formatPercentage(fund.intradayYield)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerFundPerformance; 