import React from 'react';

const formatTimestamp = (timestamp) => {
  // Guard against invalid date values
  if (!timestamp) return 'Unknown time';
  
  try {
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid date';
  }
};

const getTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return 'Just now';
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (error) {
    console.error('Error calculating time ago:', error);
    return '';
  }
};

const getActionBadge = (action) => {
  const colors = {
    'NAV Update': 'bg-blue-100 text-blue-800',
    'Yield Update': 'bg-green-100 text-green-800',
    'User Permission Change': 'bg-purple-100 text-purple-800',
    'MINT': 'bg-yellow-100 text-yellow-800',
    'REDEEM': 'bg-red-100 text-red-800',
    'NAV_UPDATE': 'bg-blue-100 text-blue-800',
    'WITHDRAW_YIELD': 'bg-green-100 text-green-800',
    // Default for any other action
    'default': 'bg-gray-100 text-gray-800'
  };

  return colors[action] || colors['default'];
};

const formatMetadata = (metadata) => {
  if (!metadata) return null;
  
  try {
    // If it's already a string, parse it first
    const data = typeof metadata === 'string' 
      ? JSON.parse(metadata) 
      : metadata;
    
    // Format the output based on content
    if (data.amount) {
      return `Amount: ${parseFloat(data.amount).toFixed(4)}`;
    }
    
    // Return formatted JSON for other types
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error formatting metadata:', error);
    return String(metadata);
  }
};

const AuditLogPanel = ({ logs }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Admin Activity</h2>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Last {logs.length} activities
        </span>
      </div>
      
      {logs.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          No recent activity found
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition duration-150">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                    {log.action}
                  </span>
                  <div className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {log.actor}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</div>
                  <div className="text-xs text-gray-400 mt-1">{getTimeAgo(log.timestamp)}</div>
                </div>
              </div>
              
              {log.metadata && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  {formatMetadata(log.metadata)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {logs.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Activity →
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogPanel; 