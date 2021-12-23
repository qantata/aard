import * as DialogPrimitive from "@radix-ui/react-dialog";
import { blackA } from "@radix-ui/colors";

import { keyframes, styled } from "../stitches.config";

const overlayShow = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});

const contentShow = keyframes({
  "0%": { opacity: 0, transform: "translate(-50%, -48%) scale(.96)" },
  "100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});

const StyledOverlay = styled(DialogPrimitive.Overlay, {
  backgroundColor: blackA.blackA9,
  position: "fixed",
  inset: 0,
  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
});

const StyledContent = styled(DialogPrimitive.Content, {
  backgroundColor: "white",
  borderRadius: 6,
  overflow: "hidden",
  boxShadow: "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
  padding: "24px",
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  minWidth: "400px",
  maxWidth: "90vw",
  maxHeight: "85vh",
  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
  "&:focus": { outline: "none" },
});

const Content: React.FC = ({ children, ...props }) => {
  return (
    <DialogPrimitive.Portal>
      <StyledOverlay />
      <StyledContent {...props}>{children}</StyledContent>
    </DialogPrimitive.Portal>
  );
};

const StyledHeader = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const StyledFooter = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "24px",
  marginTop: "32px",
});

const StyledTitle = styled(DialogPrimitive.Title, {
  margin: 0,
  fontFamily: "$600",
  color: "$grayTextPrimary",
  fontSize: "$20 ",
});

const StyledDescription = styled(DialogPrimitive.Description, {
  margin: "10px 0 20px",
  color: "$grayTextSecondary",
  fontSize: "$14",
  lineHeight: 1.5,
});

const StyledCancelButton = styled("button", {
  all: "unset",
  flex: "1",
  padding: "8px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "$grayUIBg",
  color: "$grayTextSecondary",
  cursor: "pointer",
  userSelect: "none",
  "&:hover": {
    backgroundColor: "$grayUIBgHover",
    color: "$grayTextPrimary",
  },
});

const StyledConfirmButton = styled("button", {
  all: "unset",
  flex: "1",
  padding: "8px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "$accentUIBg",
  color: "$accentTextSecondary",
  cursor: "pointer",
  userSelect: "none",
  "&:hover": {
    backgroundColor: "$accentUIBgHover",
    color: "$accentTextPrimary",
  },
});

const StyledCloseButton = styled("button", {
  all: "unset",
  padding: "8px",
  marginRight: "1px",
  fontFamily: "inherit",
  borderRadius: "100%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "$grayTextSecondary",
  "&:hover": {
    backgroundColor: "$accentUIBgHover",
    color: "$accentTextSecondary",
  },
});

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogContent = Content;
export const DialogHeader = StyledHeader;
export const DialogFooter = StyledFooter;
export const DialogCloseButton = StyledCloseButton;
export const DialogCancelButton = StyledCancelButton;
export const DialogConfirmButton = StyledConfirmButton;
export const DialogTitle = StyledTitle;
export const DialogDescription = StyledDescription;
export const DialogClose = DialogPrimitive.Close;
