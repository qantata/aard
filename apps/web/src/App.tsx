import React from "react";
import { RelayEnvironmentProvider } from "react-relay";

import { RoutingContext } from "./routing/RoutingContext";
import { RouteRenderer } from "./routing/RouteRenderer";
import { createRouter } from "./routing/createRouter";
import { routes } from "./routing/routes";
import { RelayEnvironment } from "./relay-environment";

const router: any = createRouter(routes);

export const App = () => {
  return (
    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <RoutingContext.Provider value={router.context}>
        <RouteRenderer />
      </RoutingContext.Provider>
    </RelayEnvironmentProvider>
  );
};
