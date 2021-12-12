import Hls from "hls.js";
import React, { useEffect, useRef, useState } from "react";
import { VideoSessionQuery } from "./__generated__/VideoSessionQuery.graphql";
import { graphql, PreloadedQuery, useMutation, usePreloadedQuery } from "react-relay";
import styled from "styled-components";

import { VideoSession_deleteVideoStreamSessionMutation } from "./__generated__/VideoSession_deleteVideoStreamSessionMutation.graphql";

const SeekBar = styled.div`
  width: 100%;
  height: 50px;
  background-color: #000;
  position: relative;
`;

const SeekBarProgress = styled.div`
  height: 100%;
  position: absolute;
  inset: 0;
  z-index: 2;
  background-color: lightblue;
`;

const SeekBarBuffer = styled.div`
  height: 100%;
  position: absolute;
  inset: 0;
  z-index: 1;
  background-color: gray;
`;

type Props = {
  prepared: {
    id: string;
    videoSessionQuery: PreloadedQuery<VideoSessionQuery>;
  };
};

const VideoSession: React.FunctionComponent<Props> = ({ prepared }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const [hls, setHls] = useState<Hls | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekPosition, setSeekPosition] = useState(-1);
  const [bufferedSegments, setBufferedSegments] = useState<number[]>([]);

  // We need to update the segments inside a useEffect
  const bufferedSegmentsRef = useRef<number[]>();
  bufferedSegmentsRef.current = bufferedSegments;

  // TODO: Parse this from the manifest, don't hardcode
  const segmentDuration = 2;

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
    let newHls: Hls | null = null;

    if (videoRef.current) {
      hls?.destroy();

      newHls = new Hls({
        startPosition: seekPosition,
      });

      newHls.attachMedia(videoRef.current);

      newHls.on(Hls.Events.MEDIA_ATTACHED, () => {
        newHls?.loadSource(`http://localhost:5004/data/session/${prepared.id}/index.m3u8`);

        newHls?.on(Hls.Events.MANIFEST_PARSED, () => {
          newHls?.startLoad(-1);
          videoRef.current?.play();
        });
      });

      newHls.on(Hls.Events.FRAG_BUFFERED, (event, data) => {
        if (bufferedSegmentsRef.current && typeof data.frag.sn === "number") {
          setBufferedSegments([...bufferedSegmentsRef.current, data.frag.sn]);
        }
      });

      setBufferedSegments([]);
      setHls(newHls);
    }

    return () => {
      newHls?.destroy();
    };
  }, [seekPosition]);

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

  const onSeekBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!seekBarRef.current || !videoRef.current) {
      return;
    }

    // Calculate where we should seek
    const seekBarX = seekBarRef.current.getBoundingClientRect().x;
    const seekBarWidth = seekBarRef.current.clientWidth;
    const clickX = event.clientX;

    let clickPercent = (clickX - seekBarX) / seekBarWidth;
    clickPercent = Math.max(0, Math.min(clickPercent, 1.0));

    // Calculate seek position & which segment it belongs to
    const position = clickPercent * videoRef.current.duration;
    const currentPosition = videoRef.current.currentTime;
    const seekSegment = Math.floor(position / segmentDuration);
    let shouldSeek = false;

    if (position < currentPosition) {
      // Check if the whole time from the seek position to current time is buffered
      // We need to flush the hls.js buffer if it's not.
      // That's because if there's a gap in the buffer, when the player catches up
      // with the current time, there will likely be an audio/video glitch because
      // the different parts of the buffer were transcoded with separate ffmpeg
      // commands. So this ensures that everything we play is transcoded with
      // the same ffmpeg command.
      // TODO: Currently "flushing the whole buffer" means that we create a new Hls.js
      // instance, because Hls.js sometimes detects a discontinuity when seeking which
      // leads to playback stall. This should be fixed in some way because creating a new
      // instance every time we need to flush the buffer isn't very optimal.
      for (let i = seekSegment; i <= Math.floor(currentPosition / segmentDuration); i++) {
        if (!bufferedSegments.includes(i)) {
          shouldSeek = true;
          break;
        }
      }
    } else {
      // When seeking forward we don't need to check the whole buffer
      // because there's no gaps we need to worry about since we're going
      // to be only going forward.
      shouldSeek = !bufferedSegments.includes(seekSegment);
    }

    if (shouldSeek) {
      console.log("Seeking to", position);
      setSeekPosition(position);
    } else {
      videoRef.current.currentTime = position;
    }
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
      <video ref={videoRef} controls width="100%" style={{ aspectRatio: "16 / 9" }}>
        {false && <source type="video/mp4" src={`http://localhost:5004/data/session/${prepared.id}/direct`} />}
      </video>

      {videoRef.current && (
        <SeekBar ref={seekBarRef} onClick={onSeekBarClick}>
          <SeekBarProgress style={{ width: `${(currentTime / videoRef.current.duration) * 100}%` }} />
          {videoRef.current.buffered.length && (
            <SeekBarBuffer
              style={{
                left: `${(videoRef.current.buffered.start(0) / videoRef.current.duration) * 100}%`,
                width: `${
                  ((videoRef.current.buffered.end(0) - videoRef.current.buffered.start(0)) /
                    videoRef.current.duration) *
                  100
                }%`,
              }}
            />
          )}
        </SeekBar>
      )}
    </>
  );
};

export default VideoSession;
