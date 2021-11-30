import { useRef } from "react";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import { graphql } from "react-relay";
import { VideoSessionQuery } from "./__generated__/VideoSessionQuery.graphql";

type Props = {
  prepared: {
    id: string;
    videoSessionQuery: PreloadedQuery<VideoSessionQuery>;
  };
};

const VideoSession: React.FunctionComponent<Props> = ({ prepared }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const data = usePreloadedQuery<VideoSessionQuery>(
    graphql`
      query VideoSessionQuery($id: String!) {
        videoStreamSession(id: $id) {
          id
          clients {
            id
            profiles {
              isHls
              width
              height
              videoCodec
              audioCodec
            }
          }
        }
      }
    `,
    prepared.videoSessionQuery
  );

  if (!data.videoStreamSession) {
    console.error("Video stream session not found");
    return null;
  }

  let profile = data.videoStreamSession.clients[0].profiles.find((p) => !p.isHls);
  if (!profile) {
    profile = data.videoStreamSession.clients[0].profiles[0];
  }

  if (!profile) {
    console.error("No profile");
    return null;
  }

  return (
    <video ref={videoRef} controls style={{ maxWidth: "100%" }}>
      {!profile.isHls && <source type="video/mp4" src={`http://localhost:5004/data/session/${prepared.id}/direct`} />}
    </video>
  );
};

export default VideoSession;
