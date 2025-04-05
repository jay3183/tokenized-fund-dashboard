/**
 * GraphQL Server for Intraday Yield and NAV tracking
 * Provides real-time data for tokenized funds
 */

const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const path = require('path');
const resolvers = require('./resolvers');
const { users, funds, auditLogs } = require('./mockData');

// Read schema from graphql file
const typeDefs = fs.readFileSync(
  path.join(__dirname, 'schema.graphql'),
  'utf8'
);

// Configure Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { users, funds, auditLogs },
  playground: true,
  introspection: true,
  cors: {
    origin: 'http://localhost:5173', // Specify the exact frontend origin
    credentials: true
  },
});

// Start the server
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`📊 Simulating live NAV and yield updates every 15 seconds`);
  
  // Start data simulation
  simulateDataUpdates();
});

/**
 * Simulates realistic market data updates for all funds
 */
function simulateDataUpdates() {
  setInterval(() => {
    funds.forEach(fund => {
      updateFundNav(fund);
      updateFundYield(fund);
    });
  }, 15000);
}

/**
 * Updates a fund's NAV with realistic market-like movements
 */
function updateFundNav(fund) {
  const previousNav = fund.currentNav;
  // Generate small random changes with mean reversion
  const change = (Math.random() - 0.5) * 0.05;
  const newNav = Math.max(previousNav + change, 95);
  
  fund.currentNav = parseFloat(newNav.toFixed(2));
  fund.navHistory.push({
    timestamp: new Date().toISOString(),
    nav: fund.currentNav,
    fundId: fund.id
  });
  
  console.log(`Updated ${fund.name} NAV: ${previousNav} → ${fund.currentNav}`);
}

/**
 * Updates a fund's intraday yield with time-dependent patterns
 */
function updateFundYield(fund) {
  const previousYield = fund.intradayYield;
  const hour = new Date().getHours();
  
  // More volatility in morning, stabilization in afternoon
  let volatilityFactor = 1.0;
  if (hour < 10) volatilityFactor = 1.5;
  else if (hour > 14) volatilityFactor = 0.7;
  
  const change = (Math.random() - 0.5) * 0.02 * volatilityFactor;
  const newYield = Math.max(previousYield + change, 0);
  
  fund.intradayYield = parseFloat(newYield.toFixed(4));
  fund.yieldHistory.push({
    timestamp: new Date().toISOString(),
    yield: fund.intradayYield
  });
  
  console.log(`Updated ${fund.name} Yield: ${previousYield.toFixed(4)}% → ${fund.intradayYield.toFixed(4)}%`);
}

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server');
  process.exit(0);
});
