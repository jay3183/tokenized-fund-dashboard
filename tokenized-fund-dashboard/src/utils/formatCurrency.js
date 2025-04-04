/**
 * Formats a number as USD currency
 * @param {number} value - The number to format
 * @returns {string} Formatted currency string
 */
export function formatUSD(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Formats large numbers as millions or billions with appropriate suffixes
 * @param {number} value - The AUM value to format
 * @returns {string} Formatted AUM string
 */
export function formatAUM(value) {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  } else {
    return formatUSD(value);
  }
} 