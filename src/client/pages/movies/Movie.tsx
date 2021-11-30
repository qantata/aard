import { useEffect } from "react";
import { useMutation, graphql } from "react-relay";
import styled from "styled-components";
import { useHistory } from "../../routing/useHistory";
import { getClientStreamProfile } from "../../utils/client-stream-profile";
import { Movie_createVideoStreamSessionMutation } from "./__generated__/Movie_createVideoStreamSessionMutation.graphql";

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
  const history = useHistory();

  const [commitCreateVideoStreamSession] = useMutation<Movie_createVideoStreamSessionMutation>(graphql`
    mutation Movie_createVideoStreamSessionMutation($entryId: String!, $profile: ClientStreamProfileInput!) {
      createVideoStreamSession(entryId: $entryId, profile: $profile) {
        id
      }
    }
  `);

  useEffect(() => {
    commitCreateVideoStreamSession({
      variables: {
        entryId: prepared.id,
        profile: getClientStreamProfile(),
      },
      onCompleted: (res) => {
        history.replace(`/video-session/${res.createVideoStreamSession?.id}`);
      },
      onError: (err) => {
        console.error(err);
      },
    });
  }, []);

  return null;
};

export default Movie;
