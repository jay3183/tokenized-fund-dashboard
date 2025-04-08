import React from 'react';

const RecentActivity = ({ logs, loading }) => {
  // Helper for formatting time ago
  const timeAgo = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle various timestamp formats
      const now = new Date();
      let past;
      
      if (typeof timestamp === 'number') {
        // Unix timestamp in milliseconds
        past = new Date(timestamp);
      } else if (typeof timestamp === 'string') {
        // ISO string or other string format
        past = new Date(timestamp);
      } else {
        // Unknown format
        return 'Unknown date';
      }
      
      // Check if date is valid
      if (isNaN(past.getTime())) {
        console.error("Invalid date from timestamp:", timestamp);
        // For testing, return today's date formatted
        return new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      const diffMs = now - past;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMinutes < 1) return 'just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 30) return `${diffDays}d ago`;
      
      // If more than a month, return formatted date
      return past.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error parsing date:", error, timestamp);
      return 'Date error';
    }
  };

  // Helper to get icon based on action type
  const getActionIcon = (action) => {
    if (!action) return null;
    
    if (action.includes('REDEEM')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
    
    if (action.includes('MINT')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    
    if (action.includes('WITHDRAW_YIELD') || action.includes('YIELD')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    if (action.includes('NAV')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    }
    
    if (action.includes('USER') || action.includes('ROLE')) {
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
    if (!action) return 'bg-gray-500';
    
    if (action.includes('REDEEM')) return 'bg-red-500';
    if (action.includes('MINT')) return 'bg-green-500';
    if (action.includes('WITHDRAW_YIELD') || action.includes('YIELD')) return 'bg-purple-500';
    if (action.includes('NAV')) return 'bg-blue-500';
    if (action.includes('USER') || action.includes('ROLE')) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  // Parse metadata for display
  const parseMetadata = (metadata) => {
    if (!metadata) return '';
    
    try {
      let data;
      if (typeof metadata === 'string') {
        try {
          data = JSON.parse(metadata);
        } catch (e) {
          return metadata.toString();
        }
      } else {
        data = metadata;
      }
      
      // Format specific transaction types
      if (data.sharesRedeemed) {
        return `${data.sharesRedeemed} shares @ $${data.navUsed} = $${data.amountUSD}`;
      }
      
      if (data.sharesMinted) {
        return `${data.sharesMinted} shares @ $${data.navUsed} = $${data.amountUsd || data.amountUSD}`;
      }
      
      if (data.amount && data.transactionId) {
        return `$${data.amount} (ID: ${data.transactionId})`;
      }
      
      if (data.fund && data.navValue) {
        return `${data.fund}: $${data.navValue}`;
      }
      
      if (data.fund && data.yieldValue) {
        return `${data.fund}: ${data.yieldValue}%`;
      }
      
      if (data.user && data.role) {
        return `${data.user} → ${data.role}`;
      }
      
      // Otherwise just return as key-value pairs
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } catch (err) {
      console.error("Error parsing metadata:", err, metadata);
      return String(metadata);
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
            {logs.map((log, idx) => (
              <div key={log.id || idx} className="flex items-start space-x-3">
                <div className={`p-2 mt-1 rounded-full ${getActionColor(log.action)} text-white`}>
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-white font-medium">{log.action}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {parseMetadata(log.metadata)}
                  </p>
                  <div className="flex items-center text-gray-400 dark:text-gray-500 text-xs mt-1">
                    <span className="mr-2">{log.actor || 'System'}</span>
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