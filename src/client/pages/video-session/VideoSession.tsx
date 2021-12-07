import React, { useEffect, useRef, useState } from "react";
import { VideoSessionQuery } from "./__generated__/VideoSessionQuery.graphql";
import { graphql, PreloadedQuery, useMutation, usePreloadedQuery } from "react-relay";

import { VideoSession_deleteVideoStreamSessionMutation } from "./__generated__/VideoSession_deleteVideoStreamSessionMutation.graphql";
import { Hls } from "../../utils/Hls";

type Props = {
  prepared: {
    id: string;
    videoSessionQuery: PreloadedQuery<VideoSessionQuery>;
  };
};

const VideoSession: React.FunctionComponent<Props> = ({ prepared }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferedSegments, setBufferedSegments] = useState<number[]>([]);
  const [hls, setHls] = useState<Hls | null>(null);

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
    if (videoRef.current) {
      setHls(
        new Hls(videoRef.current, `http://localhost:5004/data/session/${prepared.id}/stream/${profile!.id}/index.m3u8`)
      );
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.ontimeupdate = (event) => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
        }
      };
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.ontimeupdate = null;
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
    <>
      <video ref={videoRef} controls width="100%">
        {false && <source type="video/mp4" src={`http://localhost:5004/data/session/${prepared.id}/direct`} />}
      </video>
    </>
  );
};

export default VideoSession;
