/**
 * Format a number as currency with proper separators and abbreviations for large values
 * @param {number} value - The numeric value to format
 * @param {number} [digits=0] - Number of decimal digits to show
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }
  
  // Handle different scales for large numbers
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format a number as a percentage with proper decimal places
 * @param {number} value - The value to format (e.g., 0.25 for 25%)
 * @param {number} [digits=2] - Number of decimal places
 * @returns {string} - Formatted percentage string (e.g., "25.00%")
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%';
  }
  
  // If the value is a decimal (like 0.0432), convert it to a percentage (4.32)
  // But leave values ≥ 1 as they are (assuming they're already percentages)
  const percentageValue = Math.abs(value) < 1 && Math.abs(value) > 0 ? value * 100 : value;
  
  return `${percentageValue.toFixed(decimals)}%`;
};

/**
 * Format a date in a readable format
 * @param {string|Date} date - Date to format
 * @param {string} [format="MMM d, yyyy"] - Format pattern
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date detected:', dateString);
      // Return current date as a fallback
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    // Use current date as fallback instead of showing "Invalid Date"
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

/**
 * Format a date into relative time (e.g. "5 minutes ago")
 * @param {string|Date} dateStr - Date to format
 * @returns {string} - Human-readable time ago string
 */
export function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Recent';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error('Invalid date for formatTimeAgo:', dateStr);
      return 'Recent';
    }
    
    const seconds = Math.floor((Date.now() - date) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 120) return '1 minute ago';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    if (minutes < 120) return '1 hour ago';
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    if (hours < 48) return 'yesterday';
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months ago`;
    
    const years = Math.floor(months / 12);
    return `${years} years ago`;
  } catch (error) {
    console.error('Error calculating time ago:', error, dateStr);
    return 'Recent';
  }
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 20) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format a number with thousand separators and 2 decimal points
 * @param {number} value
 * @returns {string}
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};
