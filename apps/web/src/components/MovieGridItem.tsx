import { Typography } from "@mui/material";
import { graphql } from "react-relay";
import { useFragment } from "react-relay";
import styled from "styled-components";

import Link from "../routing/Link";
import { MovieGridItem_movie$key } from "./__generated__/MovieGridItem_movie.graphql";
import { MoviesQueryResponse } from "../pages/__generated__/MoviesQuery.graphql";

const Cover = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1.5;
  background-size: cover;
  background-color: lightgray;
`;

type Props = {
  movie: MoviesQueryResponse["movies"][number];
};

export const MovieGridItem: React.FunctionComponent<Props> = ({ movie }) => {
  const data = useFragment<MovieGridItem_movie$key>(
    graphql`
      fragment MovieGridItem_movie on Movie {
        id
        title
      }
    `,
    movie
  );

  if (!data) {
    return null;
  }

  return (
    <Link to={`/movies/${data.id}`}>
      <Cover
        style={{
          backgroundImage: `url(http://localhost:5004/api/movies/${data.id}/cover)`,
        }}
      />

      <Typography variant="subtitle1" sx={{ marginTop: 1 }}>
        {data.title}
      </Typography>
    </Link>
  );
};
