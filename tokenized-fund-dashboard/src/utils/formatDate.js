import { format } from 'date-fns';

/**
 * Format a date string into a readable date format
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date detected in formatDate.js:', dateString);
      // Return current date as fallback
      return format(new Date(), 'MMM d, yyyy');
    }
    
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    // Use current date as fallback
    return format(new Date(), 'MMM d, yyyy');
  }
} 