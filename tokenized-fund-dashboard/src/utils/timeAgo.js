/**
 * Formats a timestamp into a human-readable relative time (e.g., "30s ago")
 * @param {string|Date} timestamp - ISO string or Date object
 * @returns {string} Formatted relative time
 */
export function timeAgo(timestamp) {
  const now = new Date();
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  // Ensure valid date
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const seconds = Math.floor((now - date) / 1000);
  
  // Less than a minute
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  
  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  
  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  
  // Less than a week
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  
  // Format as date for older timestamps
  return date.toLocaleDateString();
} 