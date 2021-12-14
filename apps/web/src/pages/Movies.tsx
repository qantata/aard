import { graphql } from "react-relay";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import styled from "styled-components";

import { MovieGridItem } from "../components/MovieGridItem";
import { MoviesQuery } from "./__generated__/MoviesQuery.graphql";

const Container = styled.div`
  width: 100%;
  display: grid;

  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));

  row-gap: 32px;
  column-gap: 24px;
`;

type Props = {
  prepared: {
    moviesQuery: PreloadedQuery<MoviesQuery>;
  };
};

const Movies: React.FunctionComponent<Props> = ({ prepared }) => {
  const data = usePreloadedQuery<MoviesQuery>(
    graphql`
      query MoviesQuery {
        movies {
          id
          ...MovieGridItem_movie
        }
      }
    `,
    prepared.moviesQuery
  );

  return (
    <Container>
      {data.movies.map((movie) => {
        if (!movie) return null;

        return <MovieGridItem key={movie.id} movie={movie} />;
      })}
    </Container>
  );
};

export default Movies;
