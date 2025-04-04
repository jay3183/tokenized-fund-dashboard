import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { gql, useQuery } from '@apollo/client';

const NAV_HISTORY = gql`
  query GetNavHistory($fundId: ID!) {
    navHistory(fundId: $fundId) {
      timestamp
      nav
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

// Helper function to export data to CSV
const exportToCSV = (data, filename) => {
  // Format the timestamp to a more readable format for CSV
  const formattedData = data.map(item => ({
    timestamp: new Date(item.timestamp).toLocaleString(),
    nav: item.nav
  }));
  
  // Create CSV headers
  const headers = Object.keys(formattedData[0]).join(',');
  
  // Convert data to CSV rows
  const csvRows = formattedData.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  );
  
  // Combine headers and rows into a CSV string
  const csvString = [headers, ...csvRows].join('\n');
  
  // Create a blob and download link
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function NavChart({ fundId }) {
  const [range, setRange] = useState('ALL');
  const { data, loading, error } = useQuery(NAV_HISTORY, {
    variables: { fundId },
    pollInterval: 15000, // 🕒 updates every 15 seconds
  });

  if (loading) return <div className="text-center py-4 text-sm text-gray-400 dark:text-gray-500 animate-pulse">Loading chart...</div>;
  if (error) return <p className="text-sm text-red-500 dark:text-red-400">Failed to load NAV history</p>;

  const history = data?.navHistory || [];
  
  // Filter data based on selected range
  const now = Date.now();
  let filtered = history;

  if (range === '1H') filtered = history.filter(d => new Date(d.timestamp) > new Date(now - 3600000));
  if (range === '6H') filtered = history.filter(d => new Date(d.timestamp) > new Date(now - 6 * 3600000));
  if (range === '1D') filtered = history.filter(d => new Date(d.timestamp) > new Date(now - 24 * 3600000));

  // Detect dark mode for chart colors
  const isDarkMode = document.documentElement.classList.contains('dark');
  const gridColor = isDarkMode ? '#374151' : '#f0f0f0';
  const tickColor = isDarkMode ? '#9ca3af' : '#6b7280';
  const axisColor = isDarkMode ? '#4b5563' : '#e5e7eb';

  // Handle CSV export
  const handleExport = () => {
    exportToCSV(filtered, `nav-history-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">NAV History</h3>
        <div className="flex gap-1 items-center">
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
          <button
            onClick={handleExport}
            className="text-xs px-2 py-1 rounded border ml-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
            title="Export NAV history as CSV"
          >
            Export CSV
          </button>
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
              width={30}
            />
            <Tooltip 
              labelFormatter={formatTime}
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
              dataKey="nav" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 5, stroke: '#1d4ed8', strokeWidth: 1, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 