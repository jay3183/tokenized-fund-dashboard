import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const resolvers = {
  Query: {
    // Get user by ID
    user: async (_, { id }) => {
      return await prisma.user.findUnique({ where: { id } });
    },
    
    // Get fund by ID
    fund: async (_, { id }) => {
      console.log(`[DEBUG] Query fund with ID: ${id}`);
      return await prisma.fund.findUnique({ where: { id } });
    },
    
    // Get all available funds
    allFunds: async () => {
      return await prisma.fund.findMany();
    },
    
    // Get NAV history for a specific fund
    navHistory: async (_, { fundId }) => {
      return await prisma.nAVSnapshot.findMany({
        where: { fundId },
        orderBy: { timestamp: 'desc' }
      });
    },
    
    // Get yield history for a specific fund
    yieldHistory: async (_, { fundId }) => {
      return await prisma.yieldHistory.findMany({
        where: { fundId },
        orderBy: { timestamp: 'desc' }
      });
    },
    
    // Get portfolio details for a specific investor and fund
    portfolio: async (_, { investorId, fundId }, { user, prisma }) => {
      console.log('[DEBUG] Authenticated user:', user);
      if (!user || user.id !== investorId) throw new Error('Unauthorized');

      return await prisma.portfolio.findUnique({
        where: {
          investorId_fundId: {
            investorId,
            fundId
          }
        },
        include: {
          fund: true
        }
      });
    },
    
    // Get the current user
    me: async (_, __, { user }) => {
      if (!user) return null;
      return await prisma.user.findUnique({ where: { id: user.id } });
    }
  },
  
  Mutation: {
    // User authentication
    login: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const valid = await bcrypt.compare(password, user.password);
      
      if (!valid) {
        throw new Error('Invalid password');
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return { token, user };
    },
    
    // Update NAV for a fund
    updateNAV: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      const { fundId, nav, source = 'system' } = input;
      const timestamp = new Date();
      
      // Update the fund's NAV
      await prisma.fund.update({
        where: { id: fundId },
        data: { currentNav: nav }
      });
      
      // Create a new NAV snapshot
      return await prisma.nAVSnapshot.create({
        data: {
          fundId,
          nav,
          timestamp,
          source
        }
      });
    },
    
    // Mint shares for an investor
    mintShares: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      const { fundId, investorId, amountUsd } = input;
      
      // Check if user is authorized
      if (user.id !== investorId && user.role !== 'ADMIN') {
        throw new Error('Not authorized to mint shares for this investor');
      }
      
      // Get the current NAV
      const fund = await prisma.fund.findUnique({ where: { id: fundId } });
      if (!fund) throw new Error('Fund not found');
      
      const nav = fund.currentNav;
      const sharesMinted = amountUsd / nav;
      
      // Update or create portfolio
      await prisma.portfolio.upsert({
        where: {
          investorId_fundId: {
            investorId,
            fundId
          }
        },
        update: {
          shares: {
            increment: sharesMinted
          }
        },
        create: {
          investorId,
          fundId,
          shares: sharesMinted,
          accruedYield: 0
        }
      });
      
      return {
        sharesMinted,
        navUsed: nav,
        timestamp: new Date().toISOString()
      };
    },
    
    // Redeem shares for an investor
    redeemShares: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      const { fundId, investorId, shares } = input;
      
      // Check if user is authorized
      if (user.id !== investorId && user.role !== 'ADMIN') {
        throw new Error('Not authorized to redeem shares for this investor');
      }
      
      // Get the current portfolio
      const portfolio = await prisma.portfolio.findUnique({
        where: {
          investorId_fundId: {
            investorId,
            fundId
          }
        }
      });
      
      if (!portfolio) throw new Error('Portfolio not found');
      if (portfolio.shares < shares) throw new Error('Insufficient shares');
      
      // Get the current NAV
      const fund = await prisma.fund.findUnique({ where: { id: fundId } });
      if (!fund) throw new Error('Fund not found');
      
      const nav = fund.currentNav;
      const amountUSD = shares * nav;
      
      // Update the portfolio
      await prisma.portfolio.update({
        where: {
          investorId_fundId: {
            investorId,
            fundId
          }
        },
        data: {
          shares: {
            decrement: shares
          }
        }
      });
      
      return {
        sharesRedeemed: shares,
        navUsed: nav,
        amountUSD,
        timestamp: new Date().toISOString()
      };
    },
    
    // Withdraw accrued yield for an investor
    withdrawYield: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      const { fundId, investorId } = input;
      
      // Check if user is authorized
      if (user.id !== investorId && user.role !== 'ADMIN') {
        throw new Error('Not authorized to withdraw yield for this investor');
      }
      
      // Get the current portfolio
      const portfolio = await prisma.portfolio.findUnique({
        where: {
          investorId_fundId: {
            investorId,
            fundId
          }
        }
      });
      
      if (!portfolio) throw new Error('Portfolio not found');
      if (portfolio.accruedYield <= 0) throw new Error('No yield to withdraw');
      
      const yieldAmount = portfolio.accruedYield;
      
      // Update the portfolio
      await prisma.portfolio.update({
        where: {
          investorId_fundId: {
            investorId,
            fundId
          }
        },
        data: {
          accruedYield: 0,
          lastYieldWithdrawal: new Date()
        }
      });
      
      return {
        amount: yieldAmount,
        timestamp: new Date().toISOString()
      };
    }
  }
}; 