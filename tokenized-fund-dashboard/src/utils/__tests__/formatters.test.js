import { describe, it, expect } from 'vitest'
import { 
  formatCurrency, 
  formatPercentage, 
  formatDate, 
  formatTimeAgo,
  truncateText,
  formatNumber 
} from '../formatters'

describe('formatCurrency', () => {
  it('shows dollar signs and formats cents correctly for small values', () => {
    expect(formatCurrency(0.5)).toBe('$0.50')
    expect(formatCurrency(10)).toBe('$10.00')
    expect(formatCurrency(99.99)).toBe('$99.99')
  })
  
  it('abbreviates large numbers appropriately', () => {
    expect(formatCurrency(1234.56)).toBe('1.2K')
    expect(formatCurrency(1000000)).toBe('1.0M')
    expect(formatCurrency(1500000000)).toBe('1.5B')
  })
  
  it('handles edge cases gracefully', () => {
    expect(formatCurrency(null)).toBe('$0.00')
    expect(formatCurrency(undefined)).toBe('$0.00')
    expect(formatCurrency(NaN)).toBe('$0.00')
  })
})

describe('formatPercentage', () => {
  it('formats percentages with proper decimal places', () => {
    expect(formatPercentage(5.45)).toBe('5.45%')
    expect(formatPercentage(0)).toBe('0.00%')
    expect(formatPercentage(-2.5)).toBe('-2.50%')
  })
  
  it('converts decimal fractions to percentages', () => {
    expect(formatPercentage(0.0567)).toBe('5.67%') // 0.0567 -> 5.67%
    expect(formatPercentage(0.5)).toBe('50.00%')   // 0.5 -> 50%
  })
  
  it('handles edge cases gracefully', () => {
    expect(formatPercentage(null)).toBe('0.00%')
    expect(formatPercentage(undefined)).toBe('0.00%')
    expect(formatPercentage(NaN)).toBe('0.00%')
  })
  
  it('respects the specified decimal places', () => {
    expect(formatPercentage(12.3456, 0)).toBe('12%')
    expect(formatPercentage(12.3456, 1)).toBe('12.3%')
    expect(formatPercentage(12.3456, 3)).toBe('12.346%')
  })
})

describe('formatDate', () => {
  it('formats dates in a readable way', () => {
    // Create a fixed date for testing
    const date = new Date(2023, 6, 4) // July 4, 2023
    expect(formatDate(date)).toBe('Jul 4, 2023')
    
    // Should work with ISO strings too
    expect(formatDate('2023-07-04')).toContain('Jul')
    expect(formatDate('2023-07-04')).toContain('2023')
  })
  
  it('handles invalid dates gracefully', () => {
    // Mock the console.error to avoid test noise
    const originalError = console.error
    console.error = vi.fn()
    
    // When given invalid date, it returns a valid date string
    expect(formatDate('not-a-date')).not.toBe('Invalid Date')
    expect(formatDate('not-a-date')).toMatch(/\w{3} \d{1,2}, \d{4}/)
    
    // Restore console.error
    console.error = originalError
  })
  
  it('returns N/A for null or undefined input', () => {
    expect(formatDate(null)).toBe('N/A')
    expect(formatDate(undefined)).toBe('N/A')
    expect(formatDate('')).toBe('N/A')
  })
})

describe('formatTimeAgo', () => {
  it('formats recent times correctly', () => {
    const now = new Date()
    
    // 30 seconds ago
    const seconds = new Date(now.getTime() - 30 * 1000)
    expect(formatTimeAgo(seconds)).toContain('seconds ago')
    
    // 5 minutes ago
    const minutes = new Date(now.getTime() - 5 * 60 * 1000)
    expect(formatTimeAgo(minutes)).toContain('minutes ago')
  })
  
  it('formats older times correctly', () => {
    const now = new Date()
    
    // 3 hours ago
    const hours = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    expect(formatTimeAgo(hours)).toContain('hours ago')
    
    // 2 days ago
    const days = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    expect(formatTimeAgo(days)).toContain('days ago')
  })
  
  it('handles edge cases gracefully', () => {
    // Mock the console.error to avoid test noise
    const originalError = console.error
    console.error = vi.fn()
    
    expect(formatTimeAgo(null)).toBe('Recent')
    expect(formatTimeAgo('')).toBe('Recent')
    expect(formatTimeAgo('not-a-date')).toBe('Recent')
    
    // Restore console.error
    console.error = originalError
  })
})

describe('truncateText', () => {
  it('truncates text longer than maxLength with ellipsis', () => {
    const longText = 'This is a very long text that should be truncated'
    expect(truncateText(longText, 10)).toBe('This is a ...')
    expect(truncateText(longText, 20)).toBe('This is a very long ...')
  })
  
  it('does not truncate text shorter than maxLength', () => {
    const shortText = 'Short text'
    expect(truncateText(shortText, 20)).toBe('Short text')
  })
  
  it('handles edge cases gracefully', () => {
    expect(truncateText('', 10)).toBe('')
    expect(truncateText(null, 10)).toBe('')
    expect(truncateText(undefined, 10)).toBe('')
  })
})

describe('formatNumber', () => {
  it('formats numbers with proper thousand separators', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56')
    expect(formatNumber(1000000)).toBe('1,000,000.00')
    expect(formatNumber(0)).toBe('0.00')
  })
  
  it('respects the specified decimal places', () => {
    expect(formatNumber(1234.56789, 0)).toBe('1,235')
    expect(formatNumber(1234.56789, 1)).toBe('1,234.6')
    expect(formatNumber(1234.56789, 3)).toBe('1,234.568')
  })
  
  it('handles edge cases gracefully', () => {
    expect(formatNumber(null)).toBe('0')
    expect(formatNumber(undefined)).toBe('0')
    expect(formatNumber(NaN)).toBe('0')
  })
}) 