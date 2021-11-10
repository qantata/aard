import "./_app.css";

// For MUI
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import React from "react";
import { RelayEnvironmentProvider } from "react-relay";

import { RoutingContext } from "../src/routing/RoutingContext";
import { RouteRenderer } from "../src/routing/RouteRenderer";
import { createRouter } from "../src/routing/createRouter";
import { routes } from "../src/routing/routes";
import { RelayEnvironment } from "../src/relay-environment";

function App() {
  // Make sure we only render on the client
  if (typeof window === "undefined") {
    return null;
  }

  const router: any = createRouter(routes);

  return (
    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <RoutingContext.Provider value={router.context}>
        <RouteRenderer />
      </RoutingContext.Provider>
    </RelayEnvironmentProvider>
  );
}

export default App;
