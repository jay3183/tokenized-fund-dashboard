import React from 'react'
import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'
import { AuthContext } from '../contexts/AuthContext'
import { RoleContext } from '../RoleContext'

/**
 * Renders a component with Apollo MockedProvider
 * 
 * @param {React.ReactElement} ui - The component to render
 * @param {Object} options - Render options
 * @param {Array} options.mocks - Apollo GraphQL mocks
 * @param {boolean} options.addTypename - Whether to add __typename to query results
 * @returns {Object} The rendered component and utilities
 */
export function renderWithApollo(ui, { mocks = [], addTypename = false, ...options } = {}) {
  const Wrapper = ({ children }) => (
    <MockedProvider mocks={mocks} addTypename={addTypename}>
      {children}
    </MockedProvider>
  )
  
  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Renders a component with BrowserRouter
 * 
 * @param {React.ReactElement} ui - The component to render
 * @param {Object} options - Render options
 * @param {string} options.route - The current route
 * @returns {Object} The rendered component and utilities
 */
export function renderWithRouter(ui, { route = '/', ...options } = {}) {
  window.history.pushState({}, 'Test page', route)
  
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
  
  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Renders a component with MemoryRouter
 * 
 * @param {React.ReactElement} ui - The component to render
 * @param {Object} options - Render options
 * @param {Array} options.initialEntries - Initial entries for the router
 * @param {number} options.initialIndex - Initial index in the history stack
 * @returns {Object} The rendered component and utilities
 */
export function renderWithMemoryRouter(ui, { initialEntries = ['/'], initialIndex = 0, ...options } = {}) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      {children}
    </MemoryRouter>
  )
  
  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Renders a component with all providers (Apollo, Router, Auth, Role)
 * 
 * @param {React.ReactElement} ui - The component to render
 * @param {Object} options - Render options
 * @param {Array} options.mocks - Apollo GraphQL mocks
 * @param {string} options.route - The current route
 * @param {Array} options.initialEntries - Initial entries for the router
 * @param {Object} options.initialAuthState - Initial auth state
 * @param {string} options.userRole - User role for the RoleContext
 * @returns {Object} The rendered component and utilities
 */
export function renderWithProviders(ui, { 
  mocks = [], 
  route = '/', 
  initialEntries = [route],
  initialAuthState = { isAuthenticated: false, user: null, role: 'GUEST' },
  userRole = 'GUEST',
  ...options 
} = {}) {
  const AllProviders = ({ children }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthContext.Provider value={{
          isAuthenticated: initialAuthState.isAuthenticated,
          user: initialAuthState.user,
          role: initialAuthState.role,
          loading: false,
          login: vi.fn(),
          logout: vi.fn()
        }}>
          <RoleContext.Provider value={{
            userRole,
            setUserRole: vi.fn()
          }}>
            {children}
          </RoleContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    </MockedProvider>
  )
  
  return render(ui, { wrapper: AllProviders, ...options })
}

/**
 * Mocks localStorage for tests
 * 
 * @returns {Object} The mock localStorage object
 */
export function mockLocalStorage() {
  const localStorageMock = (() => {
    let store = {}
    return {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value.toString()
      }),
      removeItem: vi.fn((key) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      }),
      _getStore: () => store
    }
  })()
  
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  return localStorageMock
}

/**
 * Waits for Apollo mocks to resolve
 * This is a helper for tests that use MockedProvider
 * 
 * @returns {Promise} A promise that resolves after a tick
 */
export const waitForApolloMock = async () => new Promise(resolve => setTimeout(resolve, 0)) 