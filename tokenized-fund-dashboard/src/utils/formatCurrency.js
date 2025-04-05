/**
 * Format a numerical value as USD currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string with $ sign
 */
export const formatUSD = (amount) => {
  if (amount == null) return '$0.00';
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format a large numerical value as currency in a compact format (e.g., $22.4M)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string in a compact, executive-friendly format
 */
export const formatAUM = (amount) => {
  // Handle null or undefined values
  if (amount == null) return '$0';
  
  if (amount >= 1e9) {
    return `$${(amount / 1e9).toFixed(1)}B`;
  } else if (amount >= 1e6) {
    return `$${(amount / 1e6).toFixed(1)}M`;
  } else if (amount >= 1e3) {
    return `$${(amount / 1e3).toFixed(1)}K`;
  } else {
    return `$${amount.toFixed(0)}`;
  }
}; 