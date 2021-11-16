import { loadQuery } from "react-relay";
import { RouteConfig } from "react-router-config";

import { RelayEnvironment } from "../relay-environment";
import { TSResource } from "./TSResource";
import MoviesQuery from "../pages/__generated__/MoviesQuery.graphql";
import LibrariesQuery from "../pages/__generated__/LibrariesQuery.graphql";

export const routes: RouteConfig[] = [
  {
    component: TSResource("Root", () => import("../pages/Root")),
    prepare: () => {
      return {};
    },
    routes: [
      {
        path: "/movies",
        exact: true,
        component: TSResource("Movies", () => import("../pages/Movies")),
        prepare: () => {
          return {
            moviesQuery: loadQuery(
              RelayEnvironment,
              MoviesQuery,
              {},
              {
                fetchPolicy: "network-only",
              }
            ),
          };
        },
      },
      {
        path: "/movies/:id",
        exact: true,
        component: TSResource("Movie", () => import("../pages/movies/Movie")),
        prepare: (params: any) => {
          return {
            id: params.id,
          };
        },
      },
      {
        path: "/libraries",
        exact: true,
        component: TSResource("Libraries", () => import("../pages/Libraries")),
        prepare: () => {
          return {
            librariesQuery: loadQuery(RelayEnvironment, LibrariesQuery, {}),
          };
        },
      },
    ],
  },
];
