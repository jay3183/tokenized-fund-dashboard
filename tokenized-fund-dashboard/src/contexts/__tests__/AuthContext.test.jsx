import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth, AuthContext } from '../AuthContext'
import jwtDecode from 'jwt-decode'

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  default: vi.fn(),
}))

// Mock console methods to reduce noise
console.log = vi.fn()
console.error = vi.fn()

// Create a test component that uses the auth context
function TestComponent() {
  const { isAuthenticated, user, role, login, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Logged In' : 'Logged Out'}</div>
      <div data-testid="user-id">{user.id || 'No ID'}</div>
      <div data-testid="user-name">{user.name || 'No Name'}</div>
      <div data-testid="user-role">{role}</div>
      <button data-testid="login-btn" onClick={() => login('test_token', { id: 'user123', name: 'Test User', role: 'INVESTOR' })}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key]),
    setItem: vi.fn((key, value) => {
      store[key] = value
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    _getStore: () => store, // Helper for tests
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('AuthContext', () => {
  // Reset mocks and localStorage before each test
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    jwtDecode.mockReset()
  })
  
  it('initializes with unauthenticated state when no token exists', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Wait for the useEffect to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out')
      expect(screen.getByTestId('user-id')).toHaveTextContent('No ID')
      expect(screen.getByTestId('user-role')).toHaveTextContent('GUEST')
    })
    
    // Should have checked localStorage
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token')
  })
  
  it('authenticates user with demo token format', async () => {
    // Setup demo token in localStorage
    localStorageMock.setItem('token', 'demo_token_user456_ADMIN')
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Wait for the auth state to be processed
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In')
      expect(screen.getByTestId('user-id')).toHaveTextContent('user456')
      expect(screen.getByTestId('user-name')).toHaveTextContent('Demo Admin')
      expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN')
    })
    
    // Should not have called jwt-decode for demo tokens
    expect(jwtDecode).not.toHaveBeenCalled()
  })
  
  it('authenticates user with valid JWT token', async () => {
    // Setup valid JWT token
    const mockToken = 'valid.jwt.token'
    localStorageMock.setItem('token', mockToken)
    localStorageMock.setItem('userId', 'user789')
    localStorageMock.setItem('role', 'MANAGER')
    
    // Mock JWT decode to return valid data
    jwtDecode.mockReturnValue({
      id: 'user789',
      name: 'Jane Manager',
      email: 'jane@example.com',
      role: 'MANAGER',
      exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
    })
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Wait for the auth state to be processed
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In')
      expect(screen.getByTestId('user-id')).toHaveTextContent('user789')
      expect(screen.getByTestId('user-name')).toHaveTextContent('Jane Manager')
      expect(screen.getByTestId('user-role')).toHaveTextContent('MANAGER')
    })
    
    // Should have called jwt-decode
    expect(jwtDecode).toHaveBeenCalledWith(mockToken)
  })
  
  it('handles expired JWT token by logging out', async () => {
    // Setup expired JWT token
    const mockToken = 'expired.jwt.token'
    localStorageMock.setItem('token', mockToken)
    
    // Mock JWT decode to return expired token
    jwtDecode.mockReturnValue({
      id: 'user123',
      name: 'Expired User',
      role: 'INVESTOR',
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    })
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Wait for auth to process the expired token
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out')
      expect(screen.getByTestId('user-role')).toHaveTextContent('GUEST')
    })
    
    // Should have removed the token from storage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
  })
  
  it('handles JWT decode errors gracefully', async () => {
    // Setup invalid JWT token
    localStorageMock.setItem('token', 'invalid.token')
    
    // Mock JWT decode to throw an error
    jwtDecode.mockImplementation(() => {
      throw new Error('Invalid token')
    })
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Wait for auth to process and handle the error
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out')
      expect(screen.getByTestId('user-role')).toHaveTextContent('GUEST')
    })
    
    // Should have removed the token and logged the error
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    expect(console.error).toHaveBeenCalled()
  })
  
  it('updates auth state when login is called', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Initial state should be logged out
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out')
    
    // Simulate login
    await act(async () => {
      screen.getByTestId('login-btn').click()
    })
    
    // State should be updated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In')
    expect(screen.getByTestId('user-id')).toHaveTextContent('user123')
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
    expect(screen.getByTestId('user-role')).toHaveTextContent('INVESTOR')
    
    // Should have saved to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test_token')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('userId', 'user123')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('role', 'INVESTOR')
  })
  
  it('updates auth state when logout is called', async () => {
    // Start with logged-in state
    localStorageMock.setItem('token', 'some_token')
    localStorageMock.setItem('userId', 'user123')
    localStorageMock.setItem('role', 'INVESTOR')
    
    jwtDecode.mockReturnValue({
      id: 'user123',
      name: 'Test User',
      role: 'INVESTOR',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Wait for initial auth state
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In')
    })
    
    // Simulate logout
    await act(async () => {
      screen.getByTestId('logout-btn').click()
    })
    
    // Auth state should be updated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out')
    expect(screen.getByTestId('user-id')).toHaveTextContent('No ID')
    expect(screen.getByTestId('user-role')).toHaveTextContent('GUEST')
    
    // Should have removed items from localStorage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('userId')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('role')
  })
}) 