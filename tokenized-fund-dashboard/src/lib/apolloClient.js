import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

// Create a standard HTTP link
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'same-origin'
});

// Add auth headers to every request
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  
  // Log token status and exactly what's being sent
  if (token) {
    console.log(`[ApolloClient] Adding Authorization header with token: ${token.substring(0, 15)}...`);
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

// Add error handling
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Operation: ${operation.operationName}`
      );
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    // You could dispatch to your app state management here
    console.log(`[Network error]: Operation: ${operation.operationName}, Variables:`, operation.variables);
  }
  
  return forward(operation);
});

// Add retry logic for network failures
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 3000,
    jitter: true
  },
  attempts: {
    max: 5,
    retryIf: (error, operation) => {
      console.log(`[RetryLink] Retrying ${operation.operationName} due to error:`, error);
      return !!error && (error.statusCode >= 500 || !error.statusCode);
    }
  }
});

// Create the Apollo Client with all links properly chained
const client = new ApolloClient({
  link: ApolloLink.from([retryLink, errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only', // Don't use cache by default
      errorPolicy: 'all', // Handle errors gracefully
    },
    query: {
      fetchPolicy: 'network-only', // Don't use cache by default
      errorPolicy: 'all', // Handle errors gracefully
    },
    mutate: {
      errorPolicy: 'all', // Handle errors gracefully
    }
  },
});

export default client; 