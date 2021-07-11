import {
  ApolloClient, ApolloProvider as Provider,
  createHttpLink, InMemoryCache, split
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'
import React from 'react'

let httpLink = createHttpLink({
  //uri: '/graphql/',
    uri: 'https://txchat-server.herokuapp.com',
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

//const host = window.location.host
const host = 'https://txchat-server.herokuapp.com'

const wsLink = new WebSocketLink({
  uri: `wss://txchat-server.herokuapp.com:`,
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