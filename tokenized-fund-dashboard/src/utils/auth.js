// Utility functions for authentication
console.log('[auth.js] Module loaded ✅');

/**
 * Handle user logout - clears tokens and reloads page
 */
export const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('role');
  window.location.href = '/login';
};

/**
 * Determine dashboard route by user role
 * @param {string} role - User's role
 * @returns {string} Dashboard route path
 */
export function getDashboardByRole(role) {
  switch (role) {
    case 'INVESTOR':
      return '/investor';
    case 'ADMIN':
      return '/admin';
    case 'MANAGER':
      return '/manager';
    default:
      return '/';
  }
}

/**
 * Check if token exists in localStorage
 * @returns {boolean}
 */
export function hasToken() {
  return !!localStorage.getItem('token');
}

/**
 * Get user role from localStorage
 * @returns {string}
 */
export function getUserRole() {
  return localStorage.getItem('role') || 'GUEST';
}

/**
 * Get full user object from localStorage
 * @returns {{ id: string|null, role: string, token: string|null }}
 */
export function getUser() {
  return {
    id: localStorage.getItem('userId') || null,
    role: localStorage.getItem('role') || 'GUEST',
    token: localStorage.getItem('token') || null,
  };
}