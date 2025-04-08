import React from 'react'
import { render, screen } from '@testing-library/react'
import DeltaBadge from '../DeltaBadge'

// Mock console.log to avoid noise in tests
console.log = vi.fn()

describe('DeltaBadge Component', () => {
  it('shows positive values with a plus sign and green styling', () => {
    render(<DeltaBadge delta={2.5} />)
    
    // Should show +2.50%
    const badge = screen.getByText('+2.50%')
    expect(badge).toBeInTheDocument()
    
    // Parent element should have the green styling classes
    const container = badge.closest('span')
    expect(container).toHaveClass('bg-green-100')
    expect(container).toHaveClass('text-green-800')
  })
  
  it('shows negative values with a minus sign and red styling', () => {
    render(<DeltaBadge delta={-1.75} />)
    
    // Should display -1.75%
    const badge = screen.getByText('-1.75%')
    expect(badge).toBeInTheDocument()
    
    // Parent should have the red styling
    const container = badge.closest('span')
    expect(container).toHaveClass('bg-red-100')
    expect(container).toHaveClass('text-red-800')
  })
  
  it('handles zero values correctly as positive', () => {
    render(<DeltaBadge delta={0} />)
    
    // Zero is treated as positive
    const badge = screen.getByText('+0.00%')
    expect(badge).toBeInTheDocument()
    
    // Should get the green styling since 0 is considered "not negative"
    const container = badge.closest('span')
    expect(container).toHaveClass('bg-green-100')
    expect(container).toHaveClass('text-green-800')
  })
  
  it('handles null and undefined gracefully', () => {
    // Testing null
    const { rerender } = render(<DeltaBadge delta={null} />)
    
    // Should default to +0.00%
    expect(screen.getByText('+0.00%')).toBeInTheDocument()
    
    // Testing undefined
    rerender(<DeltaBadge delta={undefined} />)
    expect(screen.getByText('+0.00%')).toBeInTheDocument()
    
    // Testing NaN
    rerender(<DeltaBadge delta={NaN} />)
    expect(screen.getByText('+0.00%')).toBeInTheDocument()
  })
  
  it('formats decimals to two places', () => {
    // Testing with more decimal places
    render(<DeltaBadge delta={1.2345} />)
    
    // Should round to 2 decimal places
    expect(screen.getByText('+1.23%')).toBeInTheDocument()
  })
}) 