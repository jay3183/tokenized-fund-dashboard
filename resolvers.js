// resolvers.js
const { users, funds, auditLogs } = require('./mockData');

/**
 * GraphQL resolvers for the Franklin Templeton Fund Dashboard
 */
const resolvers = {
  Query: {
    user: (_, { id }) => users.find(user => user.id === id),
    
    fund: (_, { id }) => funds.find(fund => fund.id === id),
    
    allFunds: () => funds,

    navHistory: (_, { fundId }) => {
      const fund = funds.find(f => f.id === fundId);
      return fund?.navHistory?.map(item => ({
        id: `${fundId}-nav-${item.timestamp}`,
        fundId,
        nav: item.nav,
        timestamp: item.timestamp,
        source: 'historical'
      })) || [];
    },

    yieldHistory: (_, { fundId }) => {
      const fund = funds.find(f => f.id === fundId);
      return fund?.yieldHistory || [];
    },

    portfolio: (_, { investorId, fundId }) => {
      const user = users.find(u => u.id === investorId);
      const holding = user?.holdings.find(h => h.fundId === fundId);
      
      return holding
        ? {
            id: `${investorId}-${fundId}`,
            investorId,
            fundId,
            shares: holding.shares,
          }
        : null;
    },

    auditLogs: (_, { fundId }) => {
      return auditLogs.filter(log => log.target === fundId);
    },
  },

  Mutation: {
    updateNav: (_, { input }) => {
      const { fundId, nav, source = 'system' } = input;
      const fund = funds.find(f => f.id === fundId);
      
      if (!fund) {
        throw new Error(`Fund with ID ${fundId} not found`);
      }

      // Create a new NAV snapshot
      const timestamp = new Date().toISOString();
      const previousNav = fund.currentNav;
      
      // Update the fund's current NAV
      fund.currentNav = nav;
      
      // Create the NAV snapshot
      const navSnapshot = {
        id: `nav-${Date.now()}`,
        fundId,
        nav,
        timestamp,
        source
      };
      
      // Update the fund's currentNAV field
      fund.currentNAV = navSnapshot;
      
      // Add an audit log
      auditLogs.push({
        id: `log-${Date.now()}`,
        actor: source,
        action: 'NAV_UPDATE',
        target: fundId,
        timestamp,
        metadata: {
          previousNav,
          newNav: nav,
        },
      });
      
      return navSnapshot;
    },
    
    mintShares: (_, { input }) => {
      const { fundId, investorId, amountUsd } = input;
      const fund = funds.find(f => f.id === fundId);
      const user = users.find(u => u.id === investorId);

      if (!fund || !user) {
        throw new Error('Fund or user not found');
      }

      const nav = fund.currentNav ?? 100; // fallback for safety
      const shares = amountUsd / nav;
      const timestamp = new Date().toISOString();

      const holding = user.holdings.find(h => h.fundId === fundId);
      if (holding) {
        holding.shares = (holding.shares || 0) + shares;
      } else {
        user.holdings.push({ 
          fundId, 
          shares 
        });
      }
      
      // Update total AUM
      fund.totalAum = (fund.totalAum || 0) + amountUsd;
      
      // Add an audit log
      auditLogs.push({
        id: `log-${Date.now()}`,
        actor: investorId,
        action: 'MINT',
        target: fundId,
        timestamp,
        metadata: {
          sharesMinted: shares,
          amountUsd,
          navUsed: nav,
        },
      });

      return {
        sharesMinted: shares,
        navUsed: nav,
        timestamp,
      };
    },
    
    redeemShares: (_, { input }) => {
      const { fundId, investorId, shares } = input;
      const fund = funds.find(f => f.id === fundId);
      const user = users.find(u => u.id === investorId);
      
      if (!fund || !user) {
        throw new Error('Invalid fund or user');
      }

      const holding = user.holdings.find(h => h.fundId === fundId);
      if (!holding || holding.shares < shares) {
        throw new Error('Insufficient shares');
      }

      const nav = fund.currentNAV?.nav || fund.currentNav || 0;
      const amountUsd = parseFloat((shares * nav).toFixed(2));
      const timestamp = new Date().toISOString();
      
      // Update the user's holdings
      holding.shares -= shares;
      
      // Remove the holding if shares become 0
      if (holding.shares <= 0) {
        user.holdings = user.holdings.filter(h => h.fundId !== fundId);
      }
      
      // Update total AUM
      fund.totalAum = Math.max(0, (fund.totalAum || 0) - amountUsd);

      // Add an audit log
      const logEntry = {
        id: `log-${Date.now()}`,
        actor: investorId,
        action: 'REDEEM',
        target: fundId,
        timestamp,
        metadata: {
          sharesRedeemed: shares,
          navUsed: nav,
          amountUsd,
        },
      };
      auditLogs.push(logEntry);

      return {
        sharesRedeemed: shares,
        navUsed: nav,
        amountUsd,
        timestamp,
      };
    },
  },

  User: {
    holdings: (user) => {
      return user.holdings.map(h => ({
        ...h,
        fund: funds.find(f => f.id === h.fundId),
      }));
    },
  },

  Holding: {
    fund: (holding) => funds.find(f => f.id === holding.fundId),
  },

  Fund: {
    currentNAV: (fund) => ({
      id: `${fund.id}-nav-${Date.now()}`,
      fundId: fund.id,
      nav: fund.currentNav,
      timestamp: new Date().toISOString(),
      source: 'system'
    }),
    
    auditLogs: (fund) => auditLogs.filter(log => log.target === fund.id),
    
    // Ensure consistency between totalAUM and totalAum
    totalAum: (fund) => fund.totalAum || fund.totalAUM,
  },
};

module.exports = resolvers;