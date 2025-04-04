/**
 * GraphQL API Test Queries
 * Run with: node test-queries.js
 * 
 * This script demonstrates how to use the GraphQL API
 * with sample queries for common operations.
 */

const { request, gql } = require('graphql-request');

const endpoint = 'http://localhost:4000';

// Sample queries
const queries = {
  getFund: gql`
    query GetFund {
      fund(id: "F1") {
        id
        name
        currentNav
        intradayYield
        totalAum
        inceptionDate
      }
    }
  `,
  
  getUser: gql`
    query GetUser {
      user(id: "1") {
        id
        name
        holdings {
          fundId
          shares
          fund {
            name
            currentNav
          }
        }
      }
    }
  `,
  
  getNavHistory: gql`
    query GetNavHistory {
      navHistory(fundId: "F1") {
        id
        fundId
        timestamp
        nav
        source
      }
    }
  `,
  
  getYieldHistory: gql`
    query GetYieldHistory {
      yieldHistory(fundId: "F1") {
        timestamp
        yield
      }
    }
  `,
  
  getAuditLogs: gql`
    query GetAuditLogs {
      auditLogs(fundId: "F1") {
        id
        actor
        action
        target
        timestamp
        metadata
      }
    }
  `
};

// Sample mutations
const mutations = {
  mintShares: gql`
    mutation MintShares {
      mintShares(input: {
        fundId: "F1",
        investorId: "1",
        amountUsd: 1000
      }) {
        sharesMinted
        navUsed
        timestamp
      }
    }
  `,
  
  redeemShares: gql`
    mutation RedeemShares {
      redeemShares(input: {
        fundId: "F1",
        investorId: "1",
        shares: 5
      }) {
        sharesRedeemed
        navUsed
        amountUsd
        timestamp
      }
    }
  `
};

// Execute a single query
async function executeQuery(name, query) {
  console.log(`\n=== Executing ${name} ===`);
  try {
    const data = await request(endpoint, query);
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Run all queries sequentially
async function runAllQueries() {
  console.log('GraphQL API Test\n');
  
  // Run queries
  for (const [name, query] of Object.entries(queries)) {
    await executeQuery(name, query);
  }
  
  // Run mutations
  for (const [name, mutation] of Object.entries(mutations)) {
    await executeQuery(name, mutation);
  }
  
  console.log('\nAll tests completed!');
}

// Start the tests
runAllQueries().catch(error => {
  console.error('Failed to run tests:', error);
}); 