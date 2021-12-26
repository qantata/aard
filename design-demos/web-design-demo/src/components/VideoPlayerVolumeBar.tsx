import { createRef, useEffect, useState } from "react";
import { styled } from "../stitches.config";

const VolumeBarContainer = styled("div", {
  height: "100%",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
});

const VolumeBar = styled("div", {
  width: "100px",
  height: "4px",
  position: "relative",
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  borderRadius: "999px",
});

const VolumeBarVolume = styled("div", {
  height: "100%",
  width: "25%",
  backgroundColor: "#fff",
  position: "absolute",
  borderRadius: "999px",
});

const VolumeBarBall = styled("div", {
  $$ballWidth: "12px",
  width: "$$ballWidth",
  aspectRatio: "1 / 1",
  backgroundColor: "#fff",
  position: "absolute",
  borderRadius: "50%",
});

type Props = {
  volume: number;
  onVolumeChange: (volume: number) => void;
};

export const VideoPlayerVolumeBar: React.FC<Props> = ({ volume, onVolumeChange }) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const containerRef = createRef<HTMLDivElement>();

  const onMouseEvent = (event: MouseEvent | React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (containerRef.current) {
      const containerX = containerRef.current.getBoundingClientRect().x;
      const containerWidth = containerRef.current.clientWidth;
      const mouseX = event.clientX;

      let percentage = (mouseX - containerX) / containerWidth;
      percentage = Math.max(0, Math.min(percentage, 1));

      onVolumeChange(percentage);
    }
  };

  useEffect(() => {
    const onMouseUp = () => {
      setIsMouseDown(false);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isMouseDown) {
        onMouseEvent(event);
      }
    };

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [containerRef]);

  const onVolumeBarMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsMouseDown(true);
    onMouseEvent(event);
  };

  const ballWidth = 12;
  const fullVolume = volume * 100;

  return (
    <VolumeBarContainer ref={containerRef} onMouseDown={onVolumeBarMouseDown}>
      <VolumeBar>
        <VolumeBarVolume
          css={{
            width: `${fullVolume}%`,
          }}
        />
        <VolumeBarBall
          css={{
            width: ballWidth,
            left: `calc(${fullVolume}% - (${ballWidth}px / 2))`,
            top: `calc(-${ballWidth}px / 3)`,
          }}
        />
      </VolumeBar>
    </VolumeBarContainer>
  );
};
