import { Environment, Network, RecordSource, Store } from "relay-runtime";

// Define a function that fetches the results of an operation (query/mutation/etc)
// and returns its results as a Promise:
async function fetchQuery(params: any, variables: any) {
  const res = await fetch("http://localhost:5005/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: params.text,
      variables,
    }),
  });

  const json = await res.json();

  // GraphQL returns exceptions (for example, a missing required variable) in the "errors"
  // property of the response. If any exceptions occurred when processing the request,
  // throw an error to indicate to the developer what went wrong.
  if (Array.isArray(json.errors)) {
    console.log(json.errors);
    throw new Error(
      `Error fetching GraphQL query '${
        params.name
      }' with variables '${JSON.stringify(variables)}': ${JSON.stringify(
        json.errors
      )}`
    );
  }

  return json;
}

/*
const subscriptionClient = new SubscriptionClient(
  "ws://localhost:5005/graphql",
  {
    reconnect: true,
  },
  typeof window === "undefined" ? ws : null
);

const subscribe = (request: any, variables: any) => {
  const subscribeObservable = subscriptionClient.request({
    query: request.text,
    operationName: request.name,
    variables,
  });
  // Important: Convert subscriptions-transport-ws observable type to Relay's
  // @ts-ignore
  return Observable.from(subscribeObservable);
};*/

export const RelayEnvironment = new Environment({
  // @ts-ignore
  network: Network.create(fetchQuery /*, subscribe*/),
  store: new Store(new RecordSource(), {
    // This property tells Relay to not immediately clear its cache when the user
    // navigates around the app. Relay will hold onto the specified number of
    // query results, allowing the user to return to recently visited pages
    // and reusing cached data if its available/fresh.
    // TODO: Test out different values for this
    //gcReleaseBufferSize: 10,
  }),
});
