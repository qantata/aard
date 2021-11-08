import React, { useContext } from "react";

import { RoutingContextType } from "./createRouter";

export const RoutingContext = React.createContext(null);

// @ts-ignore
export const useRoutingContext = (): RoutingContextType => {
  // @ts-ignore
  return useContext<RoutingContextType>(RoutingContext);
};
