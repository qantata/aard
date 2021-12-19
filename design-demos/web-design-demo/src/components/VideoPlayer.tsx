import { blue } from "@radix-ui/colors";
import { createRef, useEffect, useState } from "react";
import { Maximize, Minimize, Pause, Settings2, Volume, Volume1, Volume2, VolumeX } from "lucide-react";

import { styled } from "../stitches.config";
import { VideoPlayerVolumeBar } from "./VideoPlayerVolumeBar";
import { Collapsible, CollapsibleContent } from "./Collapsible";
import { VideoPlayerSettings } from "./VideoPlayerSettings";
import { formatDigitalTime } from "../utils/formatDigitalTime";

const Container = styled("div", {
  position: "relative",
  backgroundColor: "#000",

  "> video": {
    width: "100%",
    height: "100%",
  },
});

const Controls = styled("div", {
  position: "absolute",
  bottom: "0",
  left: "0",

  width: "100%",
  height: "100px",
  display: "flex",
  justifyContent: "flex-end",
  flexDirection: "column",
  padding: "0 24px",

  background: "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
});

const ProgressBar = styled("div", {
  width: "100%",
  height: "5px",
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  cursor: "pointer",
  position: "relative",
  borderRadius: "999px",

  "&:hover": {
    transform: "scaleY(1.5)",
  },
});

const ProgressBarBuffer = styled("div", {
  position: "absolute",
  width: "20%",
  height: "100%",
  backgroundColor: "rgba(255, 255, 255, 0.6)",
  borderRadius: "999px",
});

const ProgressBarProgress = styled("div", {
  position: "absolute",
  width: "15%",
  height: "100%",
  backgroundColor: blue.blue9,
  borderRadius: "999px",
});

const ControlButtonsBar = styled("div", {
  width: "100%",
  padding: "12px 16px",
  height: "50px",

  display: "flex",
  justifyContent: "space-between",

  "> div": {
    height: "100%",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    color: "#fff",
  },
});

const ControlButton = styled("div", {
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
});

const VolumeCollapsible = styled(Collapsible, {
  display: "flex",
  gap: "24px",
});

const Time = styled("p", {
  fontSize: "$12",
  userSelect: "none",
});

export const VideoPlayer = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isVolumeBarVisible, setIsVolumeBarVisible] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState("00:00");
  const [durationStr, setDurationStr] = useState("00:00");
  const containerRef = createRef<HTMLDivElement>();
  const videoRef = createRef<HTMLVideoElement>();

  useEffect(() => {
    document.body.onfullscreenchange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    return () => {
      document.body.onfullscreenchange = null;
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.ondblclick = () => {
        onFullscreenClick();
      };
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.ondblclick = null;
      }
    };
  }, [videoRef]);

  useEffect(() => {
    const updateTimeStrings = () => {
      if (videoRef.current) {
        if (videoRef.current.currentTime) {
          setCurrentTimeStr(formatDigitalTime(videoRef.current.currentTime));
        }

        if (videoRef.current.duration) {
          setDurationStr(formatDigitalTime(videoRef.current.duration));
        }
      }
    };
    updateTimeStrings();

    videoRef.current?.addEventListener("timeupdate", updateTimeStrings);

    return () => {
      videoRef.current?.removeEventListener("timeupdate", updateTimeStrings);
    };
  }, [videoRef]);

  const onFullscreenClick = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else if (containerRef.current) {
      document.body.requestFullscreen();
    }
  };

  const onControlsMouseLeave = () => {
    setIsVolumeBarVisible(false);
  };

  const onVolumeAreaMouseEnter = () => {
    setIsVolumeBarVisible(true);
  };

  return (
    <Container
      ref={containerRef}
      css={{
        width: isFullscreen ? "100vw" : "100%",
        height: isFullscreen ? "100vh" : "100%",
      }}
    >
      <video ref={videoRef} autoPlay>
        <source type="video/mp4" src="/ChristmasTree.mp4" />
      </video>

      <Controls onMouseLeave={onControlsMouseLeave}>
        <ProgressBar>
          <ProgressBarBuffer />
          <ProgressBarProgress />
        </ProgressBar>

        <ControlButtonsBar>
          <div>
            <ControlButton>
              <Pause size={16} fill="#fff" />
            </ControlButton>

            <VolumeCollapsible
              open={isVolumeBarVisible}
              onOpenChange={setIsVolumeBarVisible}
              onMouseEnter={onVolumeAreaMouseEnter}
            >
              <ControlButton onClick={() => setIsMuted(!isMuted)}>
                {(isMuted || volume === 0) && <VolumeX size={18} />}
                {!isMuted && volume > 0 && volume < 0.2 && <Volume size={18} />}
                {!isMuted && volume >= 0.2 && volume < 0.6 && <Volume1 size={18} />}
                {!isMuted && volume >= 0.6 && <Volume2 size={18} />}
              </ControlButton>

              <CollapsibleContent>
                <VideoPlayerVolumeBar volume={volume} onVolumeChange={setVolume} />
              </CollapsibleContent>
            </VolumeCollapsible>

            <Time>
              {currentTimeStr} / {durationStr}
            </Time>
          </div>

          <div>
            <ControlButton>
              <VideoPlayerSettings />
            </ControlButton>
            <ControlButton onClick={onFullscreenClick}>
              {isFullscreen && <Minimize size={16} />}
              {!isFullscreen && <Maximize size={16} />}
            </ControlButton>
          </div>
        </ControlButtonsBar>
      </Controls>
    </Container>
  );
};
