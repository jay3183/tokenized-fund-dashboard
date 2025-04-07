import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { readFile } from 'fs/promises';
import { resolvers } from './resolvers.js';
import { users, funds, auditLogs } from './mockData.js';
import { getUser } from './auth-utils.js';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from './auth.js';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

const app = express();
const prisma = new PrismaClient();

// Frontend may run on various ports during development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5180',
  'http://localhost:5181',
  'http://localhost:5182',
  'http://localhost:5183'
];

// Apply CORS for all routes
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const httpServer = http.createServer(app);

const typeDefs = await readFile('./schema.graphql', 'utf8');

const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    // Get the user token from the headers
    const token = req.headers.authorization || '';
    
    // Try to retrieve a user with the token
    const user = getUserFromToken(token);
    
    // Add the user to the context
    return { user, prisma };
  },
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

// GraphQL endpoint with enhanced CORS and debugging
app.use(
  '/graphql',
  cors({
    origin: allowedOrigins,
    credentials: true
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      console.log(`[GraphQL] Received request for operation: ${req.body?.operationName || 'unnamed'}`);
      
      // Extract token from Authorization header
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace('Bearer ', '');
      
      console.log(`[GraphQL] Auth header present: ${authHeader ? 'Yes' : 'No'}`);
      
      // ✅ Handle demo tokens
      if (token.startsWith('demo_token_')) {
        const parts = token.split('_');
        const userId = parts.length >= 3 ? parts[2] : null;
        const role = parts.length >= 4 ? parts[3] : null;
        
        console.log(`[GraphQL] Authenticated with demo token: ${userId} (${role})`);
        
        return {
          users,
          funds,
          auditLogs,
          prisma,
          user: {
            id: userId,
            role,
            email: role === 'MANAGER' ? 'manager@example.com' : 'investor@example.com',
            name: `Demo ${role.charAt(0)}${role.slice(1).toLowerCase()}`,
          },
          isAuthenticated: true,
          req
        };
      }
      
      // For standard JWT tokens, use existing auth
      const user = getUser(req);
      console.log(`[GraphQL] Authenticated user: ${user ? `${user.id} (${user.role})` : 'None'}`);
      
      return {
        users,
        funds,
        auditLogs,
        prisma,
        user,
        isAuthenticated: user !== null,
        req
      };
    }
  })
);

// Optional health check
app.get('/', (req, res) => {
  res.send('🚀 GraphQL server is up!');
});

httpServer.listen(4000, () => {
  console.log('🚀 Server ready at http://localhost:4000/graphql');
});