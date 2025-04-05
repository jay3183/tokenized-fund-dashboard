const { users, funds, auditLogs } = require('./mockData');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Keep track of last yield withdrawal timestamp for each investor-fund pair
const lastYieldWithdrawalTime = {};

const resolvers = {
  Query: {
    user: (_, { id }) => users.find(user => user.id === id),
    fund: (_, { id }) => funds.find(fund => fund.id === id),
    allFunds: () => funds,

    navHistory: (_, { fundId }) => {
      const fund = funds.find(f => f.id === fundId);
      return fund?.navHistory?.map((item, index) => ({
        id: `${fundId}-nav-${index}`,
        fundId: fundId,
        nav: item.nav,
        timestamp: item.timestamp,
        source: 'system',
        __typename: 'NAVSnapshot'
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
            shares: holding.units,
          }
        : null;
    },

    auditLogs: async (_, { fundId }) => {
      // Use Prisma to fetch audit logs
      const logs = await prisma.auditLog.findMany({
        where: { fundId },
        orderBy: { timestamp: 'desc' }
      });
      
      return logs;
    },
  },

  Mutation: {
    updateNAV: async (_, { input }) => {
      const { fundId, nav, source = 'system' } = input;
      const fund = funds.find(f => f.id === fundId);
      if (!fund) throw new Error('Fund not found');

      fund.currentNav = nav;
      const timestamp = new Date();

      const navSnapshot = {
        id: `nav-${Date.now()}`,
        fundId,
        nav,
        timestamp: timestamp.toISOString(),
        source,
        __typename: 'NAVSnapshot'
      };

      fund.navHistory.push(navSnapshot);
      
      // Create audit log using Prisma
      await prisma.auditLog.create({
        data: {
          actor: source,
          action: 'NAV_UPDATE',
          target: fundId,
          timestamp,
          metadata: { newNav: nav },
          fundId
        }
      });

      return navSnapshot;
    },

    mintShares: async (_, { input }) => {
      const { fundId, investorId, amountUsd } = input;
      const fund = funds.find(f => f.id === fundId);
      const user = users.find(u => u.id === investorId);
      
      if (!fund || !user) throw new Error('Invalid fund or user');

      const nav = fund.currentNav ?? 100;
      const shares = amountUsd / nav;
      const timestamp = new Date();

      const holding = user.holdings.find(h => h.fundId === fundId);
      if (holding) {
        holding.units += shares;
      } else {
        user.holdings.push({ fundId, units: shares });
      }
      
      // Create audit log using Prisma
      await prisma.auditLog.create({
        data: {
          actor: investorId,
          action: 'MINT',
          target: fundId,
          timestamp,
          metadata: {
            sharesMinted: parseFloat(shares.toFixed(2)),
            navUsed: nav,
            amountUsd
          },
          fundId
        }
      });

      return {
        sharesMinted: parseFloat(shares.toFixed(2)),
        navUsed: nav,
        timestamp: timestamp.toISOString(),
      };
    },

    redeemShares: async (_, { input }) => {
      const { fundId, investorId, shares } = input;
      const fund = funds.find(f => f.id === fundId);
      const user = users.find(u => u.id === investorId);
      
      if (!fund || !user) throw new Error('Invalid fund or user');

      const holding = user.holdings.find(h => h.fundId === fundId);
      if (!holding || holding.units < shares) throw new Error('Insufficient shares');

      const nav = fund.currentNAV?.nav || fund.currentNav || 100;
      const amountUsd = parseFloat((shares * nav).toFixed(2));
      holding.units -= shares;
      const timestamp = new Date();

      // Create audit log using Prisma
      await prisma.auditLog.create({
        data: {
          actor: investorId,
          action: 'REDEEM',
          target: fundId,
          timestamp,
          metadata: {
            sharesRedeemed: shares,
            navUsed: nav,
            amountUSD: amountUsd,
          },
          fundId
        }
      });

      return {
        sharesRedeemed: shares,
        navUsed: nav,
        amountUSD: amountUsd,
        timestamp: timestamp.toISOString(),
      };
    },

    withdrawYield: async (_, { investorId, fundId }) => {
      const fund = funds.find(f => f.id === fundId);
      const user = users.find(u => u.id === investorId);

      if (!fund || !user) throw new Error('Invalid fund or user');

      const holding = user.holdings.find(h => h.fundId === fundId);
      if (!holding) throw new Error('No holdings for this fund');

      const nav = fund.currentNav;
      const yieldRate = fund.intradayYield / 100;
      
      // Get the current timestamp
      const currentTime = new Date();
      const withdrawalKey = `${investorId}-${fundId}`;
      
      // Get the last withdrawal time or use a default (e.g., 24 hours ago)
      const lastWithdrawalTime = lastYieldWithdrawalTime[withdrawalKey] || 
                               new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
      
      // Calculate time difference in days since last withdrawal
      const timeDiff = (currentTime - lastWithdrawalTime) / (1000 * 60 * 60 * 24);
      
      // Calculate yield based on time passed since last withdrawal
      const yieldAmount = parseFloat(((nav * holding.units * yieldRate) * timeDiff).toFixed(2));
      
      // Record this withdrawal time
      lastYieldWithdrawalTime[withdrawalKey] = currentTime;
      
      // Create audit log using Prisma
      await prisma.auditLog.create({
        data: {
          actor: investorId,
          action: 'YIELD_WITHDRAW',
          target: fundId,
          timestamp: currentTime,
          metadata: {
            yieldAmount,
            navUsed: nav,
            yieldRate: fund.intradayYield,
            shares: holding.units,
            timeSinceLastWithdrawal: timeDiff
          },
          fundId
        }
      });

      return {
        amount: yieldAmount,
        timestamp: currentTime.toISOString()
      };
    },
  },

  User: {
    holdings: (user) => user.holdings.map(h => ({ ...h, fund: funds.find(f => f.id === h.fundId) })),
  },

  Holding: {
    fund: (holding) => holding.fund,
  },

  Fund: {
    currentNAV: (fund) => ({
      id: `${fund.id}-nav-${Date.now()}`,
      fundId: fund.id,
      nav: fund.currentNav,
      timestamp: new Date().toISOString(),
      source: 'system',
      __typename: 'NAVSnapshot'
    }),
    auditLogs: async (fund) => {
      // Use Prisma to fetch audit logs for this fund
      return await prisma.auditLog.findMany({
        where: { fundId: fund.id },
        orderBy: { timestamp: 'desc' }
      });
    },
    totalAum: (fund) => fund.totalAUM
  },
};

module.exports = resolvers;
