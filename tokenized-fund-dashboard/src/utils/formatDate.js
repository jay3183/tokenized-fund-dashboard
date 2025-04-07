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
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid Date';
  }
} 