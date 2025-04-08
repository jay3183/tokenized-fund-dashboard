// auth-setup.js - Script to initialize authentication for development
// Run this in the browser console before using the app

// Demo token format: demo_token_userId_role
// Set up the demo investor token
function setupDemoInvestor() {
  const demoToken = 'demo_token_I1_INVESTOR';
  localStorage.setItem('token', demoToken);
  localStorage.setItem('userId', 'I1');
  localStorage.setItem('role', 'INVESTOR');
  console.log('Demo investor authentication set up successfully!');
  console.log('Token:', demoToken);
  console.log('Please refresh the page to apply authentication.');
}

// Set up the demo fund manager token
function setupDemoManager() {
  const demoToken = 'demo_token_M1_MANAGER';
  localStorage.setItem('token', demoToken);
  localStorage.setItem('userId', 'M1');
  localStorage.setItem('role', 'MANAGER');
  console.log('Demo fund manager authentication set up successfully!');
  console.log('Token:', demoToken);
  console.log('Please refresh the page to apply authentication.');
}

// Clear authentication tokens
function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('role');
  console.log('Authentication tokens cleared!');
  console.log('Please refresh the page to apply changes.');
}

// Export the functions for easy access
export { setupDemoInvestor, setupDemoManager, clearAuth };

// Log instructions
console.log('Auth setup loaded! Run one of these functions in the browser console:');
console.log('- window.setupDemoInvestor() - Set up demo investor authentication');
console.log('- window.setupDemoManager() - Set up demo fund manager authentication');
console.log('- window.clearAuth() - Clear all authentication tokens');

// Add functions to global scope for console access
window.setupDemoInvestor = setupDemoInvestor;
window.setupDemoManager = setupDemoManager;
window.clearAuth = clearAuth; 