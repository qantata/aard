import { useRef, useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";

import { styled } from "../stitches.config";
import { useResizeObserver } from "@react-aria/utils";
import { NotificationsBar } from "./NotificationsBar";

const Container = styled("div", {
  width: "100%",
  padding: "0 !important",
});

const FixedContainer = styled("div", {
  width: "calc(100% - 280px)",
  height: "70px",
  position: "fixed",
  top: "0",
  padding: "15px 32px",
  display: "flex",

  "> *": {
    height: "100%",
  },
});

const ActionsContainer = styled("div", {
  flex: "1",
});

const NotificationsBarToggle = styled("div", {
  display: "flex",
  alignItems: "center",
});

const BellContainer = styled("div", {
  height: "100%",
  aspectRatio: "1 / 1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  color: "$warningTextSecondary",
  backgroundColor: "$grayUIBg",
  borderRadius: "50%",
  cursor: "pointer",

  "&:hover": {
    backgroundColor: "$grayUIBgHover",
  },
});

const BellBubble = styled("div", {
  position: "absolute",
  top: "11px",
  right: "13px",
  width: "6px",
  aspectRatio: "1 / 1",
  backgroundColor: "$warningBgSolid",
  borderRadius: "50%",
  zIndex: "999",
});

export const BrowseContentBar = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fixedContainerRef = useRef<HTMLDivElement>(null);
  const [maxWidth, setMaxWidth] = useState("unset");
  const [isNotificationsBarOpen, setIsNotificationsBarOpen] = useState(false);

  const onResize = useCallback(() => {
    if (containerRef.current && fixedContainerRef.current) {
      // Fixed elements overlap scrollbars when their width is set to 100%.
      // That's why we need to calculate the width of the scrollbar and factor that in
      // to the width of the container, so that the bar lines up with the content of the page.
      // TODO: replace with scrollbar-gutter when it's supported on firefox.
      // https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-gutter
      setMaxWidth(
        `${
          fixedContainerRef.current.clientWidth -
          (fixedContainerRef.current.clientWidth - containerRef.current.clientWidth)
        }px`
      );
    }
  }, [containerRef, fixedContainerRef]);

  useResizeObserver({
    ref: containerRef,
    onResize,
  });

  return (
    <Container ref={containerRef}>
      <FixedContainer ref={fixedContainerRef} css={{ maxWidth }}>
        {maxWidth !== "unset" && (
          <>
            <ActionsContainer />

            <NotificationsBarToggle onClick={() => setIsNotificationsBarOpen(true)}>
              <BellContainer>
                <BellBubble />
                <Bell size={16} />
              </BellContainer>
            </NotificationsBarToggle>
          </>
        )}
      </FixedContainer>

      <NotificationsBar isOpen={isNotificationsBarOpen} onClose={() => setIsNotificationsBarOpen(false)} />
    </Container>
  );
};
