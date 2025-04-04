# GraphQL Intraday Yield Service

A GraphQL API for tracking tokenized fund data, including NAV (Net Asset Value) and intraday yield information.

## Overview

This service provides real-time tracking of tokenized funds, including:

- Current and historical NAV data
- Intraday yield information
- User holdings and portfolios
- Fund operations (mint/redeem shares)
- Audit logging for all operations

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```

The GraphQL server will be available at http://localhost:4000 with the GraphQL Playground interface for testing queries.

## GraphQL Schema

The API provides the following main types:

- `User`: Information about platform users
- `Fund`: Tokenized fund data including NAV and yield information
- `Holding`: User's holdings of fund shares
- `NavHistory`: Historical NAV data points
- `YieldHistory`: Historical yield data points
- `Portfolio`: A user's collection of fund holdings
- `AuditLog`: Record of all operations performed

## Example Queries

### Get Fund Information

```graphql
query GetFund {
  fund(id: "F1") {
    id
    name
    currentNav
    intradayYield
    totalAum
  }
}
```

### Get User Portfolio

```graphql
query GetPortfolio {
  portfolio(userId: "1") {
    holdings {
      fund {
        name
        currentNav
      }
      shares
      valueUsd
    }
    totalValueUsd
  }
}
```

### Get NAV History

```graphql
query GetNavHistory {
  navHistory(fundId: "F1", days: 7) {
    timestamp
    nav
    source
  }
}
```

## Mutations

The API supports the following operations:

- `updateNav`: Update a fund's NAV
- `mintShares`: Mint new fund shares for a user
- `redeemShares`: Redeem (burn) shares from a user

## Simulated Data

The service includes a simulation engine that generates realistic market data, including:

- Time-dependent NAV changes
- Intraday yield fluctuations with market-like patterns
- Updates every 15 seconds

## Project Structure

- `index.js`: Main server entry point and data simulation
- `schema.graphql`: GraphQL schema definition
- `resolvers.js`: GraphQL resolver functions
- `mockData.js`: Sample data and simulation helpers

## License

MIT
