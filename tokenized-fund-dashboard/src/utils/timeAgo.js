/**
 * Formats a timestamp into a human-readable relative time (e.g., "30s ago")
 * @param {string|Date} timestamp - ISO string or Date object
 * @returns {string} Formatted relative time
 */
export function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
} 