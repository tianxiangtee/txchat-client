import {
  ApolloClient, ApolloProvider as Provider,
  createHttpLink, InMemoryCache, split
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'
import React from 'react'

const host = 'localhost:4000';
const uri = `http://${host}`;
const websocket = `ws://${host}`;

// const host = 'txchat-server.herokuapp.com:';
// const uri = `https://${host}`;
// const websocket = `wss://${host}`;

let httpLink = createHttpLink({
  uri: uri,  
})

const authLink = setContext((_, { headers }) => {
  // // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token')
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

httpLink = authLink.concat(httpLink)



const wsLink = new WebSocketLink({
  uri: websocket,
  options: {
    reconnect: true,
    connectionParams: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  },
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

export default function ApolloProvider(props) {
  return <Provider client={client} {...props} />
}