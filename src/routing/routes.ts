import { loadQuery } from "react-relay";
import { RouteConfig } from "react-router-config";
import { RelayEnvironment } from "../relay-environment";

import { TSResource } from "./TSResource";

export const routes: RouteConfig[] = [
  {
    component: TSResource("Root", () => import("../../pages/Root")),
    prepare: () => {
      return {};
    },
    routes: [
      {
        path: "/movies",
        component: TSResource("movies", () => import("../../pages/Movies")),
        prepare: () => {
          const Query = require("../__generated__/MoviesQuery.graphql");
          return {
            moviesQuery: loadQuery(
              RelayEnvironment,
              Query,
              {},
              {
                fetchPolicy: "network-only",
              }
            ),
          };
        },
      },
    ],
  },
];
