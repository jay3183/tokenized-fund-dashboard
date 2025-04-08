import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock fetch globally
global.fetch = vi.fn()

// Mock IntersectionObserver
window.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  disconnect() {
    // Mock implementation
  }
  observe() {
    // Mock implementation
  }
  unobserve() {
    // Mock implementation
  }
}

// Mock ResizeObserver
window.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback
  }
  disconnect() {
    // Mock implementation
  }
  observe() {
    // Mock implementation
  }
  unobserve() {
    // Mock implementation
  }
}

// Mock match media
window.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // Deprecated
  removeListener: vi.fn(), // Deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    readText: vi.fn().mockImplementation(() => Promise.resolve('')),
  },
  writable: true,
})

// Mock localStorage
class LocalStorageMock {
  constructor() {
    this.store = {}
  }

  clear() {
    this.store = {}
  }

  getItem(key) {
    return this.store[key] || null
  }

  setItem(key, value) {
    this.store[key] = String(value)
  }

  removeItem(key) {
    delete this.store[key]
  }

  get length() {
    return Object.keys(this.store).length
  }

  key(index) {
    return Object.keys(this.store)[index] || null
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
  writable: true,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: new LocalStorageMock(),
  writable: true,
})

// Mock scrollTo
window.scrollTo = vi.fn()

// Mock URL object methods
if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: vi.fn() })
}
if (typeof window.URL.revokeObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'revokeObjectURL', { value: vi.fn() })
}

// Suppress specific console errors for tests
const originalConsoleError = console.error
console.error = (...args) => {
  // Filter out expected React warnings and Apollo errors
  const suppressList = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: useLayoutEffect does nothing on the server',
    'Error: Network error:',
  ]
  
  if (!args.some(arg => 
    suppressList.some(suppressed => 
      typeof arg === 'string' && arg.includes(suppressed)
    )
  )) {
    originalConsoleError(...args)
  }
}

// Suppress specific console warnings for tests
const originalConsoleWarn = console.warn
console.warn = (...args) => {
  // Filter out expected warnings
  const suppressList = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: The current testing environment',
  ]
  
  if (!args.some(arg => 
    suppressList.some(suppressed => 
      typeof arg === 'string' && arg.includes(suppressed)
    )
  )) {
    originalConsoleWarn(...args)
  }
} 