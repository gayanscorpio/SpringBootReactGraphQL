import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { setContext } from '@apollo/client/link/context';

// 1. Dynamically attach JWT token to HTTP requests
const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    return {
        headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : '',
        },
    };
});

// 2. HTTP link (for queries and mutations)
const httpLink = new HttpLink({
    uri: 'http://localhost:8080/graphql',
});

// 3. WebSocket client with event handlers
const wsClient = createClient({
    url: 'ws://localhost:8080/graphql',
    lazy: false, // Immediately connect instead of waiting for first subscription
    retryAttempts: 5,
    shouldRetry: () => true, // always retry
    connectionParams: () => {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage (ws):', token);
        return {
            authorization: token ? `Bearer ${token}` : '',
        };
    },
    on: {
        connecting: () => console.log('WebSocket connecting...'),
        connected: () => console.log('WebSocket connected'),
        closed: (event) => console.log('WebSocket disconnected', event),
        error: (err) => console.error('WebSocket error', err),
    },
});

// 4. WebSocket link
const wsLink = new GraphQLWsLink(wsClient);

// 5. Split link for queries/mutations vs subscriptions
const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    authLink.concat(httpLink)
);

// 6. Create Apollo Client
export const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
});
