import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Hardcoded users for demo
const DEMO_USERS = {
  'admin@example.com': { password: 'admin123', role: 'ADMIN', id: 'A1', name: 'Admin User' },
  'investor@example.com': { password: 'investor123', role: 'INVESTOR', id: 'I1', name: 'Investor One' }
};

// This will be used for token extraction in getUser
export function parseAuthHeader(req) {
  const token = req.headers.authorization?.split(' ')[1];
  return token || null;
}

// Extract user from token or demo token pattern
export function getUser(req) {
  const token = parseAuthHeader(req);
  
  if (!token) {
    console.log('[Auth] No token found in request');
    return null;
  }
  
  console.log(`[Auth] Processing token: ${token.substring(0, 15)}...`);
  
  // Special handling for demo tokens
  if (token.includes('demo_token')) {
    try {
      console.log('[Auth] Processing demo token:', token);
      
      // Extract user ID from demo token
      let id, role;
      
      // Handle different demo token formats
      if (token.includes('_M1_')) {
        id = 'M1';
        role = 'MANAGER';
      } else if (token.includes('_I1_')) {
        id = 'I1';
        role = 'INVESTOR';
      } else if (token.includes('_A1_')) {
        id = 'A1';
        role = 'ADMIN';
      } else {
        // Extract from parts if possible
        const parts = token.split('_');
        if (parts.length >= 3) {
          id = parts[2];
          role = parts.length >= 4 ? parts[3] : 'INVESTOR';
        } else {
          // Fallback - allow any token with demo in it
          return {
            id: 'I1',
            role: 'INVESTOR',
            name: 'Demo Investor',
            email: 'investor@example.com'
          };
        }
      }
      
      const user = {
        id,
        name: `Demo ${role.charAt(0) + role.slice(1).toLowerCase()}`,
        email: `${role.toLowerCase()}@example.com`,
        role
      };
      
      console.log(`[Auth] Successfully parsed demo token - User:`, user);
      return user;
    } catch (error) {
      console.error(`[Auth] Error parsing demo token:`, error);
      // Fallback to a default user
      return {
        id: 'I1',
        role: 'INVESTOR',
        name: 'Demo Investor',
        email: 'investor@example.com'
      };
    }
  }
  
  // JWT verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`[Auth] JWT verification successful: ${decoded.id} (${decoded.role})`);
    return decoded;
  } catch (err) {
    console.error('[Auth] JWT verification failed:', err.message);
    return null;
  }
}

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const authenticate = (req) => {
  const token = parseAuthHeader(req);
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (err) {
      console.error('JWT verification failed:', err.message);
    }
  }
  return null;
};

export const authResolvers = {
  Mutation: {
    login: async (_, { email, password }) => {
      const user = DEMO_USERS[email];
      
      if (!user || user.password !== password) {
        throw new Error('Invalid credentials');
      }
      
      return {
        token: generateToken(user),
        user: {
          id: user.id,
          email,
          role: user.role,
          name: user.name
        }
      };
    }
  }
};

// Utility function to ensure user is authenticated
export const ensureAuthenticated = (context) => {
  if (!context.user) {
    throw new Error('You must be logged in to perform this action');
  }
  return context.user;
};

// Utility function to ensure user has appropriate role
export const ensureRole = (context, roles) => {
  const user = ensureAuthenticated(context);
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  if (!roleArray.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${roleArray.join(', ')}`);
  }
  
  return user;
}; 