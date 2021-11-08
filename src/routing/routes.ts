import { RouteConfig } from "react-router-config";

import { TSResource } from "./TSResource";

export const routes: RouteConfig[] = [
  {
    component: TSResource("Root", () => import("../../pages/Root")),
    prepare: () => {
      return {};
    },
    routes: [],
  },
];
