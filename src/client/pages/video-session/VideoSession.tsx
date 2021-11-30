import Hls from "hls.js";
import { useEffect, useRef } from "react";
import { VideoSessionQuery } from "./__generated__/VideoSessionQuery.graphql";
import { graphql, PreloadedQuery, useMutation, usePreloadedQuery } from "react-relay";
import { VideoSession_deleteVideoStreamSessionMutation } from "./__generated__/VideoSession_deleteVideoStreamSessionMutation.graphql";

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
              id
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

  const [deleteVideoStreamSession] = useMutation<VideoSession_deleteVideoStreamSessionMutation>(graphql`
    mutation VideoSession_deleteVideoStreamSessionMutation($id: String!) {
      deleteVideoStreamSession(id: $id)
    }
  `);

  let profile = data.videoStreamSession?.clients[0].profiles.find((p) => p.isHls);
  if (!profile) {
    profile = data.videoStreamSession?.clients[0].profiles[0];
  }

  useEffect(() => {
    let hls: Hls | null = null;

    if (profile?.isHls) {
      hls = new Hls();
      // @ts-ignore
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls!.loadSource(`http://localhost:5004/data/session/${prepared.id}/stream/${profile!.id}/playlist`);
        hls!.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          videoRef.current?.requestFullscreen();
        });
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }

      deleteVideoStreamSession({
        variables: {
          id: prepared.id,
        },
        onCompleted: (res) => {
          if (!res.deleteVideoStreamSession) {
            console.error("Couldn't delete video stream session");
          }
        },
        onError: (err) => {
          console.error(err);
        },
      });
    };
  }, []);

  if (!data.videoStreamSession) {
    console.error("Video stream session not found");
    return null;
  }

  if (!profile) {
    console.error("No profile");
    return null;
  }

  return (
    <video ref={videoRef} controls autoPlay style={{ maxWidth: "100%" }}>
      {!profile.isHls && <source type="video/mp4" src={`http://localhost:5004/data/session/${prepared.id}/direct`} />}
    </video>
  );
};

export default VideoSession;
