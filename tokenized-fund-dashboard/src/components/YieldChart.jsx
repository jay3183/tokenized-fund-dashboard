import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { gql, useQuery } from '@apollo/client';

const YIELD_HISTORY = gql`
  query GetYieldHistory($fundId: ID!) {
    yieldHistory(fundId: $fundId) {
      timestamp
      yield
    }
  }
`;

// Helper function for consistent time formatting
const formatTime = (timestamp) => {
  return new Intl.DateTimeFormat([], {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
};

export default function YieldChart({ fundId }) {
  const [range, setRange] = useState('ALL');
  const { data, loading, error } = useQuery(YIELD_HISTORY, {
    variables: { fundId },
    pollInterval: 15000, // 🕒 updates every 15 seconds
  });

  if (loading) return <div className="text-center py-4 text-sm text-gray-400 dark:text-gray-500 animate-pulse">Loading yield data...</div>;
  if (error) return <p className="text-sm text-red-500 dark:text-red-400">Failed to load yield history</p>;

  const history = data?.yieldHistory || [];
  
  // Sort history by timestamp to ensure correct order
  const sortedHistory = [...history].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  // Filter data based on selected range
  const now = Date.now();
  let filtered = sortedHistory;

  if (range === '1H') filtered = sortedHistory.filter(d => new Date(d.timestamp) > new Date(now - 3600000));
  if (range === '6H') filtered = sortedHistory.filter(d => new Date(d.timestamp) > new Date(now - 6 * 3600000));
  if (range === '1D') filtered = sortedHistory.filter(d => new Date(d.timestamp) > new Date(now - 24 * 3600000));

  // Calculate yield line color based on average yield value
  const avgYield = filtered.length > 0 
    ? filtered.reduce((sum, item) => sum + item.yield, 0) / filtered.length
    : 0;
  
  const lineColor = avgYield >= 0 ? "#16a34a" : "#dc2626"; // Green for positive, red for negative

  // Detect dark mode for chart colors
  const isDarkMode = document.documentElement.classList.contains('dark');
  const gridColor = isDarkMode ? '#374151' : '#f0f0f0';
  const tickColor = isDarkMode ? '#9ca3af' : '#6b7280';
  const axisColor = isDarkMode ? '#4b5563' : '#e5e7eb';

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Yield History</h3>
        <div className="flex gap-1">
          {['1H', '6H', '1D', 'ALL'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-xs px-2 py-1 rounded border ${range === r 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' 
                : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="h-40 sm:h-48 border border-gray-100 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={filtered}
            margin={{ top: 10, right: 5, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatTime}
              tick={{ fontSize: 10, fill: tickColor }}
              stroke={axisColor}
              minTickGap={15}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 10, fill: tickColor }}
              stroke={axisColor}
              width={38}
              tickFormatter={(value) => `${value.toFixed(2)}%`}
            />
            <Tooltip 
              labelFormatter={formatTime}
              formatter={(value) => [`${value.toFixed(2)}%`, 'Yield']}
              contentStyle={{ 
                borderRadius: '6px', 
                border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                backgroundColor: isDarkMode ? '#1f2937' : 'white',
                color: isDarkMode ? '#e5e7eb' : 'inherit'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="yield" 
              stroke={lineColor} 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 5, stroke: lineColor, strokeWidth: 1, fill: lineColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 