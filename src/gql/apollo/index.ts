import { from, ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { onError } from '@apollo/client/link/error';

// // const REFRESH_AUTHENTICATION_MUTATION = `
// //   mutation Refresh($request: RefreshRequest!) {
// //     refresh(request: $request) {
// //       accessToken
// //       refreshToken
// //     }
// //   }
// // `;

// Defaults to this app's own /api/graphql route. Set NEXT_PUBLIC_API_URL only
// when pointing at a backend on another origin.
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/graphql`
    : '/api/graphql',
  fetch
});

// RetryLink is a link that retries requests based on the status code returned.
const retryLink = new RetryLink({
  delay: {
    initial: 100
  },
  attempts: {
    max: 2,
    retryIf: (error) => Boolean(error)
  }
});

const clearStorage = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('companyUuid');
};

const authLink = new ApolloLink((operation, forward) => {
  const accessToken = localStorage.getItem('accessToken');
  const companyUuid = localStorage.getItem('companyUuid');

  if (!accessToken || accessToken === 'undefined') {
    clearStorage();
    return forward(operation);
  }

  // TODO [ ] handle token expiration
  operation.setContext({
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
      Company: companyUuid ? companyUuid : ''
    }
  });

  return forward(operation);

  // return fromPromise(
  //   axios(API_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     data: JSON.stringify({
  //       operationName: 'Refresh',
  //       query: REFRESH_AUTHENTICATION_MUTATION,
  //       variables: {
  //         request: { refreshToken: localStorage.getItem('refreshToken') }
  //       }
  //     })
  //   })
  //     .then(({ data }) => {
  //       const accessToken = data?.data?.refresh?.accessToken;
  //       const refreshToken = data?.data?.refresh?.refreshToken;
  //       operation.setContext({
  //         headers: {
  //           'x-access-token': `Bearer ${accessToken}`
  //         }
  //       });

  //       localStorage.setItem('accessToken', accessToken);
  //       localStorage.setItem('refreshToken', refreshToken);

  //       return toPromise(forward(operation));
  //     })
  //     .catch(() => {
  //       return toPromise(forward(operation));
  //     })
  // );
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ code, message, locations, path }) => {
      console.log(`[GraphQL error]: Message: ${message}, Path: ${path}, Code: ${code}`);
      // console.log('code:', code);
      // FIXME howto
      if (code == 4000) {
        // AM.error(message);
        clearStorage();
      }
    });

  if (networkError) console.error(`[Network error]: ${networkError}`);
});

const client = new ApolloClient({
  link: from([retryLink, authLink, errorLink, httpLink]),
  cache: new InMemoryCache(),
  // FIXME: queyr loading always false when not refresh
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: "ignore",
      // notifyOnNetworkStatusChange: true
    },
    // mutate: {
    //   errorPolicy: "ignore",
    // }
  }
});

export const headerData = () => {
  const token = localStorage.getItem('accessToken');
  const company = localStorage.getItem('companyUuid');

  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    Company: company ? company : undefined,
  };
};


export const apolloNodeClient = new ApolloClient({
  link: from([httpLink]),
  cache: new InMemoryCache()
});

export default client;
