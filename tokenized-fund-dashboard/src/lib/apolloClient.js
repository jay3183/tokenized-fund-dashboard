import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Create a standard HTTP link
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

// Add auth headers to every request
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  
  // Log token status and exactly what's being sent
  if (token) {
    console.log(`[ApolloClient] Adding Authorization header with token: ${token.substring(0, 15)}...`);
    console.log(`[ApolloClient] Final header value: 'Bearer ${token}'`);
  } else {
    console.log('[ApolloClient] No token found in localStorage');
  }
  
  // Return headers with Authorization (capitalized) if token exists
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create the Apollo Client with the authLink chained to httpLink
const client = new ApolloClient({
  connectToDevTools: true,
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only', // Don't use cache by default
    },
    query: {
      fetchPolicy: 'network-only', // Don't use cache by default
    },
  },
});

export default client; 