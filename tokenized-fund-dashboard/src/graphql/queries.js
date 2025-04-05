import { gql } from '@apollo/client';

export const GET_PORTFOLIO = gql`
  query GetPortfolio($investorId: ID!, $fundId: ID!) {
    fund(id: $fundId) {
      id
      name
      currentNav
      intradayYield
    }
    portfolio(investorId: $investorId, fundId: $fundId) {
      id
      investorId
      fundId
      shares
      __typename
    }
  }
`;

export const MINT_SHARES = gql`
  mutation MintShares($input: MintSharesInput!) {
    mintShares(input: $input) {
      sharesMinted
      navUsed
      timestamp
    }
  }
`;

export const REDEEM_SHARES = gql`
  mutation RedeemShares($input: RedeemSharesInput!) {
    redeemShares(input: $input) {
      sharesRedeemed
      navUsed
      amountUSD
      timestamp
    }
  }
`;

export const WITHDRAW_YIELD = gql`
  mutation WithdrawYield($investorId: ID!, $fundId: ID!) {
    withdrawYield(investorId: $investorId, fundId: $fundId) {
      amount
      timestamp
    }
  }
`; 