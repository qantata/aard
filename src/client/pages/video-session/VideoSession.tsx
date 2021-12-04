import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
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
  const [hls, setHls] = useState<Hls | null>(null);
  const [seekPosition, setSeekPosition] = useState(-1);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [bufferedSegments, setBufferedSegments] = useState<number[]>([]);

  // We need to update the segments inside a useEffect
  const bufferedSegmentsRef = useRef<number[]>();
  bufferedSegmentsRef.current = bufferedSegments;

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
    if (profile?.isHls && videoRef.current) {
      console.log("Loading new");
      const newHls = new Hls({
        debug: true,
        startPosition: seekPosition,
      });
      newHls.attachMedia(videoRef.current);

      newHls.on(Hls.Events.MEDIA_ATTACHED, () => {
        newHls!.loadSource(`http://localhost:5004/data/session/${prepared.id}/stream/${profile!.id}/playlist`);
        newHls!.on(Hls.Events.ERROR, (event, data) => {
          console.error("ERROR:", data);
        });
        newHls!.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          //videoRef.current?.requestFullscreen();
        });

        newHls!.on(Hls.Events.FRAG_BUFFERED, (event, data) => {
          if (typeof data.frag.sn === "number") {
            setBufferedSegments([...bufferedSegmentsRef.current!, data.frag.sn]);
          }
        });
      });

      videoRef.current.ontimeupdate = (event) => {
        if (videoRef.current) {
          setCurrentPosition(videoRef.current.currentTime);
        }
      };

      setHls(newHls);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.ontimeupdate = null;
      }

      setBufferedSegments([]);
      hls?.destroy();
    };
  }, [seekPosition]);

  useEffect(() => {
    return () => {
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

  const onButtonClick = () => {
    setSeekPosition(240);
  };

  if (!data.videoStreamSession) {
    console.error("Video stream session not found");
    return null;
  }

  if (!profile) {
    console.error("No profile");
    return null;
  }

  return (
    <>
      <video ref={videoRef} controls autoPlay style={{ width: "100%", maxWidth: "100%", aspectRatio: "16 / 9" }}>
        {!profile.isHls && <source type="video/mp4" src={`http://localhost:5004/data/session/${prepared.id}/direct`} />}
      </video>

      <button onClick={onButtonClick}>Seek to 240</button>
    </>
  );
};

export default VideoSession;
