import React, { useState } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const ManagerFundPerformance = ({ funds }) => {
  const [sortBy, setSortBy] = useState('performance');
  const [timeRange, setTimeRange] = useState('7d');
  const [showDetails, setShowDetails] = useState(null);

  // Sort funds based on different metrics
  const sortedFunds = [...funds].sort((a, b) => {
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
    if (value > 0) return 'bg-green-500/20 text-green-300';
    if (value < 0) return 'bg-red-500/20 text-red-300';
    return 'bg-gray-500/20 text-gray-300';
  };

  // Generate a simple sparkline-like bar chart
  const generateMiniChart = (history = [], width = 60, height = 20) => {
    if (!history || history.length < 2) {
      return <div className="w-16 h-5 bg-gray-700 rounded"></div>;
    }

    // Extract values and normalize them
    const values = history.map(h => h.nav || h.yield).slice(-7);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    // Return mini bar chart
    return (
      <div className="flex items-end h-5 w-16 space-x-0.5">
        {values.map((v, i) => {
          const normalizedHeight = range === 0 ? 50 : ((v - min) / range) * 100;
          const heightPercent = Math.max(10, normalizedHeight);
          
          return (
            <div 
              key={i}
              className={`w-1.5 ${v > values[0] ? 'bg-green-500' : 'bg-red-500'}`} 
              style={{ height: `${heightPercent}%` }}
            ></div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-semibold">Fund Performance Leaderboard</h2>
        
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <div className="bg-gray-800 rounded-lg p-1">
            <button
              className={`px-3 py-1 rounded-md text-sm ${timeRange === '24h' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setTimeRange('24h')}
            >
              24h
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${timeRange === '7d' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setTimeRange('7d')}
            >
              7d
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${timeRange === '30d' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setTimeRange('30d')}
            >
              30d
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${timeRange === 'qtd' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setTimeRange('qtd')}
            >
              QTD
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${timeRange === 'ytd' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
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
          <thead className="bg-gray-800 text-gray-400 text-sm">
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
              <th className="px-4 py-3">Trend</th>
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
                <tr className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'} hover:bg-gray-700`}>
                  <td className="px-4 py-3 font-mono">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{fund.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded ${getTrendColor(getPerformanceMetric(fund))}`}>
                      {formatPercentage(getPerformanceMetric(fund) * 100)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
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
                      className="text-blue-400 hover:text-blue-300"
                      onClick={() => setShowDetails(showDetails === fund.id ? null : fund.id)}
                    >
                      {showDetails === fund.id ? 'Hide' : 'Details'}
                    </button>
                  </td>
                </tr>
                {showDetails === fund.id && (
                  <tr className="bg-gray-800/30">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <h4 className="text-sm text-gray-400 mb-1">NAV History</h4>
                          <div className="h-24 bg-gray-900 rounded-lg flex items-end justify-between px-2 pt-2">
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
                        
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <h4 className="text-sm text-gray-400 mb-1">Yield Trend</h4>
                          <div className="h-24 bg-gray-900 rounded-lg flex items-end justify-between px-2 pt-2">
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
                        
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <h4 className="text-sm text-gray-400 mb-1">Key Metrics</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">24h Change:</span>
                              <span className={getTrendColor(getPerformanceMetric(fund))}>
                                {formatPercentage(getPerformanceMetric(fund) * 100)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Current NAV:</span>
                              <span>{formatCurrency(fund.currentNav)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Previous NAV:</span>
                              <span>{formatCurrency(fund.previousNav)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Yield:</span>
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