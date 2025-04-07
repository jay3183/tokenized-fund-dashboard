import React, { useState, useEffect } from 'react';

// Mock data generator for yield history
const generateMockYieldData = (days = 30) => {
  const data = [];
  const today = new Date();
  const baseYield = 3 + Math.random() * 2; // Start around 3-5%
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Create some realistic yield movements
    const volatility = 0.1; // % daily movement
    const changePercent = (Math.random() * volatility * 2) - volatility;
    const yieldValue = i === days ? 
      baseYield : 
      data[data.length-1].value * (1 + (changePercent / 100));
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(yieldValue.toFixed(2))
    });
  }
  
  return data;
};

const YieldChart = ({ fundId }) => {
  const [yieldData, setYieldData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, this would fetch data from your GraphQL API
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockData = generateMockYieldData();
        setYieldData(mockData);
      } catch (error) {
        console.error('Error fetching yield data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fundId]);
  
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  
  // Get min and max for scaling
  const values = yieldData.map(d => d.value);
  const min = Math.min(...values) * 0.95; // Add some padding
  const max = Math.max(...values) * 1.05;
  const range = max - min;
  
  // Calculate stats
  const latestValue = yieldData[yieldData.length - 1]?.value || 0;
  const oldestValue = yieldData[0]?.value || 0;
  const changeValue = latestValue - oldestValue;
  const changePercent = oldestValue ? (changeValue / oldestValue) * 100 : 0;
  const isPositive = changeValue >= 0;
  
  // Generate weekly averages
  const weeklyAverages = [];
  const weeks = Math.ceil(yieldData.length / 7);
  
  for (let i = 0; i < weeks; i++) {
    const start = i * 7;
    const end = Math.min((i + 1) * 7, yieldData.length);
    const weekData = yieldData.slice(start, end);
    
    if (weekData.length > 0) {
      const sum = weekData.reduce((acc, item) => acc + item.value, 0);
      const avg = sum / weekData.length;
      weeklyAverages.push({
        week: `Week ${weeks - i}`,
        average: avg
      });
    }
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">30-Day Average: {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)}%</span>
        </div>
        <div className="text-right">
          <span className={`text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}% ({isPositive ? '+' : ''}{changeValue.toFixed(2)}%)
          </span>
        </div>
      </div>
      
      <div className="relative h-40">
        {/* Chart background */}
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-800 rounded overflow-hidden">
          <div className="h-full flex items-end">
            {yieldData.map((point, index) => {
              const height = ((point.value - min) / range) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 flex justify-center items-end h-full"
                >
                  <div
                    className={`w-full max-w-[8px] rounded-t ${
                      point.value > oldestValue
                        ? 'bg-yellow-500 dark:bg-yellow-400'
                        : 'bg-orange-500 dark:bg-orange-400'
                    }`}
                    style={{ height: `${height}%`, minHeight: '1px' }}
                    title={`${point.date}: ${point.value}%`}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {latestValue.toFixed(2)}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Current Yield
        </div>
      </div>
      
      {/* Weekly averages */}
      <div className="mt-4 flex justify-between">
        {weeklyAverages.slice(0, 4).reverse().map((week, index) => (
          <div key={index} className="text-center">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {week.week}
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {week.average.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YieldChart; 