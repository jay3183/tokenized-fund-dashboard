import React from 'react';

const RecentActivity = ({ logs, loading }) => {
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

  // Helper to get icon based on action type
  const getActionIcon = (action) => {
    if (action.includes('NAV') || action.includes('Update')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      );
    }
    
    if (action.includes('Yield')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
    
    if (action.includes('User') || action.includes('Permission')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    }
    
    // Default icon
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  // Helper to get background color based on action type
  const getActionColor = (action) => {
    if (action.includes('NAV') || action.includes('Update')) return 'bg-blue-500';
    if (action.includes('Yield')) return 'bg-purple-500';
    if (action.includes('User') || action.includes('Permission')) return 'bg-green-500';
    return 'bg-gray-500';
  };

  // Parse metadata for display
  const parseMetadata = (metadata) => {
    if (!metadata) return '';
    
    try {
      const data = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } catch (err) {
      return metadata.toString();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Activity</h3>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            No recent activity to display
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3">
                <div className={`p-2 mt-1 rounded-full ${getActionColor(log.action)} text-white`}>
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-white font-medium">{log.action}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {parseMetadata(log.metadata)}
                  </p>
                  <div className="flex items-center text-gray-400 dark:text-gray-500 text-xs mt-1">
                    <span className="mr-2">{log.actor}</span>
                    <span>{timeAgo(log.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity; 