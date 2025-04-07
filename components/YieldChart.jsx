import React from 'react';

const YieldChart = ({ metrics }) => {
  // Simplified mock data for the chart
  const mockYieldData = [2.3, 2.5, 2.8, 2.6, 3.1, 2.9, metrics.averageYield];
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Find the max value for scaling the bars
  const maxValue = Math.max(...mockYieldData);
  
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Yield Performance</h2>
        <span className="px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {metrics.averageYield.toFixed(2)}% avg
        </span>
      </div>
      
      {/* Chart area */}
      <div className="flex items-end h-36 space-x-2 mb-2">
        {mockYieldData.map((value, index) => (
          <div 
            key={index} 
            className="flex-1 flex flex-col items-center"
          >
            <div className="w-full relative">
              <div 
                className={`w-full rounded-t ${
                  index === mockYieldData.length - 1 
                    ? 'bg-blue-500' 
                    : 'bg-blue-200'
                }`}
                style={{ 
                  height: `${(value / maxValue) * 100}%`, 
                  minHeight: '12px',
                  transition: 'height 0.3s ease-in-out' 
                }}
              ></div>
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-500">
                {value.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* X-axis labels */}
      <div className="flex space-x-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        {months.map((month, index) => (
          <div key={index} className="flex-1 text-center">
            <span className="text-xs text-gray-500">{month}</span>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <div className="flex items-center">
          <span className="block w-3 h-3 rounded-sm bg-blue-500 mr-2"></span>
          <span className="text-gray-600 dark:text-gray-400">Current</span>
        </div>
        <div className="flex items-center">
          <span className="block w-3 h-3 rounded-sm bg-blue-200 mr-2"></span>
          <span className="text-gray-600 dark:text-gray-400">Previous Months</span>
        </div>
      </div>
    </div>
  );
};

export default YieldChart; 