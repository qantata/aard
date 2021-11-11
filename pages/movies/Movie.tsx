import styled from "styled-components";

const Video = styled.video`
  width: 100%;
  max-height: 100%;
`;

type Props = {
  prepared: {
    id: string;
  };
};

const Movie: React.FunctionComponent<Props> = ({ prepared }) => {
  return (
    <Video controls autoPlay>
      <source
        src={`http://localhost:5005/data/movies/${prepared.id}/video`}
        type="video/mp4"
      />
    </Video>
  );
};

export default Movie;
