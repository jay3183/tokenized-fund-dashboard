import { gql } from '@apollo/client';

// Query to get all funds
export const GET_FUNDS = gql`
  query GetFunds {
    allFunds {
      id
      name
      chainId
      assetType
      intradayYield
      currentNav
      previousNav
      totalAum
      inceptionDate
      updatedAt
    }
  }
`;

// Query to get portfolio data - updated to match schema exactly
export const GET_PORTFOLIO = gql`
  query GetPortfolio($investorId: String!, $fundId: String!) {
    portfolio(investorId: $investorId, fundId: $fundId) {
      shares
      accruedYield
      lastYieldWithdrawal
      fund {
        name
      }
    }
  }
`;

// Mutation to mint tokens with input object
export const MINT_TOKENS = gql`
  mutation MintTokens($input: MintSharesInput!) {
    mintShares(input: $input) {
      sharesMinted
      navUsed
      timestamp
    }
  }
`;

// Mutation to redeem tokens with input object
export const REDEEM_TOKENS = gql`
  mutation RedeemTokens($input: RedeemSharesInput!) {
    redeemShares(input: $input) {
      sharesRedeemed
      navUsed
      amountUSD
      timestamp
    }
  }
`;

// Mutation to withdraw yield
export const WITHDRAW_YIELD = gql`
  mutation WithdrawYield($input: WithdrawYieldInput!) {
    withdrawYield(input: $input) {
      amount
      timestamp
    }
  }
`;

// Simplified portfolio query for fallback use
export const GET_PORTFOLIO_SIMPLE = gql`
  query GetPortfolioSimple($investorId: ID!) {
    portfolio(investorId: $investorId, fundId: "F1") {
      shares
    }
  }
`;

// Fund Queries
export const GET_FUND_DETAILS = gql`
  query GetFundDetails($fundId: ID!) {
    fundDetails(fundId: $fundId) {
      id
      name
      manager
      type
      description
      currentNav
      currentYield
      totalAum
      inceptionDate
      lastUpdated
      yieldHistory {
        oneMonth
        threeMonths
        ytd
      }
    }
  }
`;

export const GET_FUND_STATS = gql`
  query GetFundStats($fundId: ID!) {
    fundStats(fundId: $fundId) {
      id
      currentNav
      navChange
      totalAum
      aumChange
      currentYield
      yieldChange
      totalInvestors
      investorsChange
      totalShares
      sharesChange
      dailyVolume
      volumeChange
      lastUpdated
    }
  }
`;

export const GET_CHART_DATA = gql`
  query GetChartData($fundId: ID!, $range: String!) {
    chartData(fundId: $fundId, range: $range) {
      date
      nav
      yield
    }
  }
`;

// Add NAV_HISTORY for backwards compatibility
export const NAV_HISTORY = gql`
  query GetNAVHistory($fundId: ID!) {
    navHistory(fundId: $fundId) {
      id
      timestamp
      nav
    }
  }
`;

// Mutations
export const MINT_SHARES = gql`
  mutation MintShares($fundId: ID!, $amount: Float!) {
    mintShares(fundId: $fundId, amount: $amount) {
      id
      shares
      amount
      timestamp
    }
  }
`;

export const REDEEM_SHARES = gql`
  mutation RedeemShares($fundId: ID!, $shares: Float!) {
    redeemShares(fundId: $fundId, shares: $shares) {
      id
      shares
      amount
      timestamp
    }
  }
`;

export const UPDATE_FUND_NAV = gql`
  mutation UpdateFundNav($fundId: ID!, $nav: Float!) {
    updateFundNav(fundId: $fundId, nav: $nav) {
      id
      currentNav
      lastUpdate
    }
  }
`;

export const UPDATE_FUND_YIELD = gql`
  mutation UpdateFundYield($fundId: ID!, $yieldRate: Float!) {
    updateFundYield(fundId: $fundId, yieldRate: $yieldRate) {
      id
      currentYield
      lastUpdate
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;
