import { useEffect, useRef, RefObject } from "react";
import { blackA } from "@radix-ui/colors";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";

import { styled } from "../stitches.config";
import { AlertTriangle, Info, X, XOctagon } from "lucide-react";

const Container = styled("div", {
  width: "420px",
  height: "100vh",
  position: "fixed",
  top: "0",
  right: "0",
  backgroundColor: "$grayBg",
  transform: "translateX(100%)",
  padding: "24px",
  overflowY: "auto",

  transition: "transform 0.25s ease-out",

  variants: {
    open: {
      true: {
        transform: "translateX(0)",
      },
    },
  },
});

const Overlay = styled("div", {
  width: "100%",
  height: "100%",
  position: "fixed",
  left: "0",
  top: "0",
  backgroundColor: blackA.blackA11,
  pointerEvents: "none",
  opacity: "0",

  transition: "opacity 0.25s ease-out",

  variants: {
    visible: {
      true: {
        opacity: "1",
        pointerEvents: "initial",
      },
    },
  },
});

const Header = styled("div", {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "16px",
  color: "$grayTextPrimary",

  "&:not(:first-child)": {
    marginTop: "32px",
  },
});

const Title = styled("h2", {
  fontFamily: "$500",
  fontSize: "$20",
});

const ClearAll = styled("p", {
  fontSize: "12px",
  textTransform: "uppercase",
  cursor: "pointer",
});

const Notification = styled("div", {
  width: "100%",
  borderRadius: "10px",
  padding: "16px",
  backgroundColor: "$grayUIBg",

  display: "flex",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "8px",

  "&:hover": {
    backgroundColor: "$grayUIBgHover",
  },
});

const NotificationIcon = styled("div", {
  display: "flex",
  paddingTop: "1px",

  variants: {
    type: {
      info: {
        color: "$accentBgSolid",
      },
      warning: {
        color: "$warningBgSolid",
      },
      error: {
        color: "$errorBgSolid",
      },
    },
  },

  defaultVariants: {
    type: "info",
  },
});

const NotificationContent = styled("div", {
  flex: "1",
});

const NotificationHeader = styled("div", {});

const NotificationDismiss = styled("div", {
  float: "right",
  display: "flex",
  alignItems: "flex-end",
  color: "$grayTextPrimary",

  "&:hover": {
    color: "$accentTextSecondary",
  },
});

const NotificationTitle = styled("h3", {
  fontSize: "$18",
  color: "$grayTextPrimary",
});

const NotificationText = styled("p", {
  fontSize: "$16",
  color: "$grayTextSecondary",
  marginTop: "16px",
});

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const NotificationsBar: React.FC<Props> = ({ isOpen, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef?.current) {
      return;
    }

    if (isOpen) {
      disableBodyScroll(containerRef.current, {
        reserveScrollBarGap: true,
      });
    } else {
      enableBodyScroll(containerRef.current);
    }
  }, [isOpen, containerRef]);

  return (
    <>
      <Overlay visible={isOpen} onClick={onClose} />
      <Container ref={containerRef} open={isOpen}>
        <Header>
          <Title>Notifications</Title>

          <ClearAll>Clear all</ClearAll>
        </Header>

        <Notification>
          <NotificationIcon>
            <Info size={21} />
          </NotificationIcon>

          <NotificationContent>
            <NotificationHeader>
              <NotificationDismiss>
                <X size={20} />
              </NotificationDismiss>

              <NotificationTitle>A library scan has finished</NotificationTitle>
            </NotificationHeader>

            <NotificationText>
              A movie library located at /path/to/home/Videos/movies has been scanned.
            </NotificationText>
          </NotificationContent>
        </Notification>

        <Notification>
          <NotificationIcon type="warning">
            <AlertTriangle size={21} />
          </NotificationIcon>

          <NotificationContent>
            <NotificationHeader>
              <NotificationDismiss>
                <X size={20} />
              </NotificationDismiss>

              <NotificationTitle>A warning occured</NotificationTitle>
            </NotificationHeader>

            <NotificationText>
              Something went wrong but it's not that bad. So this is a warning instead of an error. Not sure what a
              warning could be yet so this text is here instead for now.
            </NotificationText>
          </NotificationContent>
        </Notification>

        <Notification>
          <NotificationIcon type="error">
            <XOctagon size={21} />
          </NotificationIcon>

          <NotificationContent>
            <NotificationHeader>
              <NotificationDismiss>
                <X size={20} />
              </NotificationDismiss>

              <NotificationTitle>Failed to delete user</NotificationTitle>
            </NotificationHeader>

            <NotificationText>
              There was an error while trying to delete a user. You should probably check the logs.
            </NotificationText>
          </NotificationContent>
        </Notification>

        <Header>
          <Title>Running tasks</Title>

          <ClearAll>Cancel all</ClearAll>
        </Header>

        <Notification>
          <NotificationIcon>
            <Info size={21} />
          </NotificationIcon>

          <NotificationContent>
            <NotificationHeader>
              <NotificationDismiss>
                <X size={20} />
              </NotificationDismiss>

              <NotificationTitle>A library scan has finished</NotificationTitle>
            </NotificationHeader>

            <NotificationText>
              A movie library located at /path/to/home/Videos/movies has been scanned.
            </NotificationText>
          </NotificationContent>
        </Notification>

        <Notification>
          <NotificationIcon type="warning">
            <AlertTriangle size={21} />
          </NotificationIcon>

          <NotificationContent>
            <NotificationHeader>
              <NotificationDismiss>
                <X size={20} />
              </NotificationDismiss>

              <NotificationTitle>A warning occured</NotificationTitle>
            </NotificationHeader>

            <NotificationText>
              Something went wrong but it's not that bad. So this is a warning instead of an error. Not sure what a
              warning could be yet so this text is here instead for now.
            </NotificationText>
          </NotificationContent>
        </Notification>

        <Notification>
          <NotificationIcon type="error">
            <XOctagon size={21} />
          </NotificationIcon>

          <NotificationContent>
            <NotificationHeader>
              <NotificationDismiss>
                <X size={20} />
              </NotificationDismiss>

              <NotificationTitle>Failed to delete user</NotificationTitle>
            </NotificationHeader>

            <NotificationText>
              There was an error while trying to delete a user. You should probably check the logs.
            </NotificationText>
          </NotificationContent>
        </Notification>

        <Notification>
          <NotificationIcon>
            <Info size={21} />
          </NotificationIcon>

          <NotificationContent>
            <NotificationHeader>
              <NotificationDismiss>
                <X size={20} />
              </NotificationDismiss>

              <NotificationTitle>A library scan has finished</NotificationTitle>
            </NotificationHeader>

            <NotificationText>
              A movie library located at /path/to/home/Videos/movies has been scanned.
            </NotificationText>
          </NotificationContent>
        </Notification>

        <Notification>
          <NotificationIcon type="warning">
            <AlertTriangle size={21} />
          </NotificationIcon>

          <NotificationContent>
            <NotificationHeader>
              <NotificationDismiss>
                <X size={20} />
              </NotificationDismiss>

              <NotificationTitle>A warning occured</NotificationTitle>
            </NotificationHeader>

            <NotificationText>
              Something went wrong but it's not that bad. So this is a warning instead of an error. Not sure what a
              warning could be yet so this text is here instead for now.
            </NotificationText>
          </NotificationContent>
        </Notification>

        <Notification>
          <NotificationIcon type="error">
            <XOctagon size={21} />
          </NotificationIcon>

          <NotificationContent>
            <NotificationHeader>
              <NotificationDismiss>
                <X size={20} />
              </NotificationDismiss>

              <NotificationTitle>Failed to delete user</NotificationTitle>
            </NotificationHeader>

            <NotificationText>
              There was an error while trying to delete a user. You should probably check the logs.
            </NotificationText>
          </NotificationContent>
        </Notification>

        <Notification>
          <NotificationIcon>
            <Info size={21} />
          </NotificationIcon>

          <NotificationContent>
            <NotificationHeader>
              <NotificationDismiss>
                <X size={20} />
              </NotificationDismiss>

              <NotificationTitle>A library scan has finished</NotificationTitle>
            </NotificationHeader>

            <NotificationText>
              A movie library located at /path/to/home/Videos/movies has been scanned.
            </NotificationText>
          </NotificationContent>
        </Notification>

        <Notification>
          <NotificationIcon type="warning">
            <AlertTriangle size={21} />
          </NotificationIcon>

          <NotificationContent>
            <NotificationHeader>
              <NotificationDismiss>
                <X size={20} />
              </NotificationDismiss>

              <NotificationTitle>A warning occured</NotificationTitle>
            </NotificationHeader>

            <NotificationText>
              Something went wrong but it's not that bad. So this is a warning instead of an error. Not sure what a
              warning could be yet so this text is here instead for now.
            </NotificationText>
          </NotificationContent>
        </Notification>

        <Notification>
          <NotificationIcon type="error">
            <XOctagon size={21} />
          </NotificationIcon>

          <NotificationContent>
            <NotificationHeader>
              <NotificationDismiss>
                <X size={20} />
              </NotificationDismiss>

              <NotificationTitle>Failed to delete user</NotificationTitle>
            </NotificationHeader>

            <NotificationText>
              There was an error while trying to delete a user. You should probably check the logs.
            </NotificationText>
          </NotificationContent>
        </Notification>
      </Container>
    </>
  );
};
