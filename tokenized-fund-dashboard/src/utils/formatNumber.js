/**
 * Format a number with commas and consistent decimal places
 * @param {number|string} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {boolean} addDollarSign - Whether to prefix with dollar sign (default: false)
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 2, addDollarSign = false) {
  // Handle null, undefined or empty values
  if (value === null || value === undefined || value === '') {
    return addDollarSign ? '$0.00' : '0.00';
  }
  
  // Convert to number if it's not already
  const numValue = typeof value === 'number' ? value : Number(value);
  
  // Handle NaN
  if (isNaN(numValue)) {
    return addDollarSign ? '$0.00' : '0.00';
  }
  
  // Format with locale string for commas and fixed decimal places
  const formattedValue = numValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return addDollarSign ? `$${formattedValue}` : formattedValue;
}

/**
 * Format a currency value with dollar sign and commas
 * @param {number|string} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, decimals = 2) {
  return formatNumber(value, decimals, true);
} 