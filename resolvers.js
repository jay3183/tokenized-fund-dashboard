// resolvers.js
const { users, funds, auditLogs } = require('./mockData');

const resolvers = {
  Query: {
    user: (_, { id }) => users.find(user => user.id === id),
    fund: (_, { id }) => funds.find(fund => fund.id === id),
    allFunds: () => funds,

    navHistory: (_, { fundId }) => {
      const fund = funds.find(f => f.id === fundId);
      return fund?.navHistory || [];
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
            shares: holding.units,
          }
        : null;
    },

    auditLogs: (_, { fundId }) => {
      return auditLogs.filter(log => log.target === fundId);
    },
  },

  Mutation: {
    mintShares: (_, { fundId, investorId, amountUSD }) => {
      const fund = funds.find(f => f.id === fundId);
      const user = users.find(u => u.id === investorId);

      if (!fund || !user) {
        throw new Error('Fund or user not found');
      }

      const nav = fund.currentNav ?? 100; // fallback for safety
      const shares = amountUSD / nav;

      const holding = user.holdings.find(h => h.fundId === fundId);
      if (holding) {
        holding.units += shares;
      } else {
        user.holdings.push({ fundId, units: shares });
      }

      return {
        sharesMinted: shares,
        navUsed: nav,
        timestamp: new Date().toISOString(),
      };
    },
    
    redeemShares: (_, { fundId, investorId, shares }) => {
      const fund = funds.find(f => f.id === fundId);
      const user = users.find(u => u.id === investorId);
      if (!fund || !user) throw new Error('Invalid fund or user');

      const holding = user.holdings.find(h => h.fundId === fundId);
      if (!holding || holding.units < shares) {
        throw new Error('Insufficient shares');
      }

      const nav = fund.currentNAV?.nav || 0;
      const amountUSD = parseFloat((shares * nav).toFixed(2));
      holding.units -= shares;

      const logEntry = {
        id: `log-${Date.now()}`,
        actor: investorId,
        action: 'redeemShares',
        target: fundId,
        timestamp: new Date().toISOString(),
        metadata: {
          sharesRedeemed: shares,
          navUsed: nav,
          amountUSD,
        },
      };
      auditLogs.push(logEntry);

      return {
        sharesRedeemed: shares,
        navUsed: nav,
        amountUSD,
        timestamp: logEntry.timestamp,
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
    fund: (holding) => holding.fund,
  },

  Fund: {
    currentNAV: (fund) => ({
      id: `${fund.id}-nav`,
      fundId: fund.id,
      nav: fund.currentNav,
      timestamp: new Date().toISOString(),
      source: 'system'
    }),
    auditLogs: (fund) => auditLogs.filter(log => log.target === fund.id),
    totalAum: (fund) => fund.totalAUM
  },
};

module.exports = resolvers;