import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import CountUp from 'react-countup';
import { formatCurrency } from '../utils/formatNumber';

// GraphQL query to get NAV and yield history
const GET_CHART_DATA = gql`
  query GetChartData($fundId: ID!, $range: String!) {
    chartData(fundId: $fundId, range: $range) {
      date
      nav
      yield
    }
  }
`;

// Get NAV history specifically
const NAV_HISTORY = gql`
  query GetNAVHistory($fundId: ID!) {
    navHistory(fundId: $fundId) {
      id
      timestamp
      nav
    }
  }
`;

// Get yield history specifically
const YIELD_HISTORY = gql`
  query GetYieldHistory($fundId: ID!) {
    fund(id: $fundId) {
      yieldHistory {
        timestamp
        yield
      }
    }
  }
`;

const FundChart = ({ fundId, type = 'nav' }) => {
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousValue, setPreviousValue] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  
  // Query for the appropriate history data based on type
  const { loading: queryLoading, error: queryError, data, refetch } = useQuery(
    type === 'nav' ? NAV_HISTORY : YIELD_HISTORY,
    {
      variables: { fundId },
      pollInterval: 30000, // Poll every 30 seconds
      notifyOnNetworkStatusChange: true,
    }
  );
  
  // Process data when it changes
  useEffect(() => {
    if (data) {
      setLoading(false);
      
      try {
        let processedData = [];
        
        if (type === 'nav' && data.navHistory) {
          processedData = data.navHistory.map(item => ({
            date: new Date(item.timestamp),
            value: parseFloat(item.nav)
          }));
        } else if (type === 'yield' && data.fund?.yieldHistory) {
          processedData = data.fund.yieldHistory.map(item => ({
            date: new Date(item.timestamp),
            value: parseFloat(item.yield)
          }));
        }
        
        // Sort by date
        processedData.sort((a, b) => a.date - b.date);
        
        // Filter data based on time range
        const filteredData = filterDataByTimeRange(processedData, timeRange);
        
        // Check if value has changed for animation
        const latestValue = filteredData.length > 0 ? filteredData[filteredData.length - 1].value : 0;
        
        if (previousValue !== null && latestValue !== previousValue) {
          setLastUpdated(Date.now());
        }
        
        setPreviousValue(latestValue);
        setChartData(filteredData);
        
      } catch (err) {
        console.error('Error processing chart data:', err);
        setError('Failed to process chart data');
      }
    }
  }, [data, timeRange, type, previousValue]);
  
  // Filter data based on time range
  const filterDataByTimeRange = (data, range) => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    let cutoffDate;
    
    switch (range) {
      case '1H':
        cutoffDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '1D':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '1W':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'ALL':
      default:
        return data;
    }
    
    return data.filter(item => item.date >= cutoffDate);
  };
  
  // Timer to update the "last updated" text
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(prev => {
        // Only trigger re-render if we need to update the text
        const secondsAgo = Math.floor((Date.now() - prev) / 1000);
        if (secondsAgo % 5 === 0) return prev;
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Calculate seconds since last update
  const secondsAgo = Math.floor((Date.now() - lastUpdated) / 1000);
  
  // Calculate stats
  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const oldestValue = chartData.length > 0 ? chartData[0].value : 0;
  const changeValue = latestValue - oldestValue;
  const changePercent = oldestValue ? (changeValue / oldestValue) * 100 : 0;
  const isPositive = changeValue >= 0;
  
  if (loading || queryLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || queryError) {
    return (
      <div className="h-64 flex items-center justify-center text-red-500">
        <p>Error loading chart data</p>
      </div>
    );
  }
  
  // Get min and max for scaling
  const values = chartData.map(d => d.value);
  const min = values.length > 0 ? Math.min(...values) * 0.99 : 0; // Add padding
  const max = values.length > 0 ? Math.max(...values) * 1.01 : 100;
  const range = max - min;
  
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-white">
          {type === 'nav' ? 'NAV History' : 'Yield History'}
        </h3>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Last updated {secondsAgo} seconds ago
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          {['1H', '1D', '1W', 'ALL'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs rounded-md ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <button
          onClick={() => refetch()}
          className="text-xs text-primary dark:text-blue-400 hover:underline"
        >
          Refresh
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Starting: {type === 'nav' ? '$' : ''}{oldestValue.toFixed(2)}{type === 'yield' ? '%' : ''}
          </span>
        </div>
        <div className="text-right">
          <span className={`text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}% ({isPositive ? '+' : ''}
            {type === 'nav' ? '$' : ''}{changeValue.toFixed(2)}{type === 'yield' ? '%' : ''})
          </span>
        </div>
      </div>
      
      <div className="relative h-40">
        {/* Chart background */}
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-700/50 rounded overflow-hidden">
          <div className="h-full flex items-end">
            {chartData.map((point, index) => {
              const height = ((point.value - min) / range) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 flex justify-center items-end h-full"
                >
                  <div
                    className={`w-full max-w-[8px] rounded-t ${
                      point.value > oldestValue
                        ? type === 'nav' ? 'bg-primary dark:bg-blue-400' : 'bg-amber-500 dark:bg-amber-400'
                        : 'bg-red-500 dark:bg-red-400'
                    }`}
                    style={{ height: `${height}%`, minHeight: '1px' }}
                    title={`${point.date.toLocaleDateString()}: ${type === 'nav' ? '$' : ''}${point.value.toFixed(2)}${type === 'yield' ? '%' : ''}`}
                  ></div>
                </div>
              );
            })}
          </div>
          
          {/* Value line */}
          <div 
            className="absolute left-0 right-0 border-t border-dashed border-slate-300 dark:border-slate-600"
            style={{ top: `${((max - oldestValue) / range) * 100}%` }}
          >
            <span className="absolute right-0 -top-3 text-xs text-slate-500 dark:text-slate-400 px-1">
              Start: {type === 'nav' ? '$' : ''}{oldestValue.toFixed(2)}{type === 'yield' ? '%' : ''}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {type === 'nav' ? '$' : ''}
          <CountUp 
            end={latestValue} 
            decimals={2} 
            duration={1} 
            preserveValue={true}
            separator=","
          />
          {type === 'yield' ? '%' : ''}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Current {type === 'nav' ? 'NAV' : 'Yield'}
        </div>
      </div>
    </div>
  );
};

export default FundChart; 