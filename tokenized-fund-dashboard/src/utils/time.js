// Time utility functions

/**
 * Formats a timestamp to a human readable relative time (e.g., "5 minutes ago")
 * @param {string|number|Date} timestamp - The timestamp to format
 * @returns {string} - Formatted relative time
 */
export const relativeTime = (timestamp) => {
  if (!timestamp) return 'unknown time';

  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      // Format as a date if more than a week ago
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
      });
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'invalid date';
  }
}; 