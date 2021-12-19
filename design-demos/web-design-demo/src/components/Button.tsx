import { useRef } from "react";
import { useButton } from "@react-aria/button";

import { styled } from "../stitches.config";

export const StyledButton = styled("button", {
  padding: "7px 14px",
  fontSize: "$14",
  fontWeight: "500",
  backgroundColor: "$accentUIBg",
  border: "1px solid $accentBorder",
  borderRadius: "6px",
  cursor: "pointer",

  "&:hover": {
    backgroundColor: "$accentUIBgHover",
    borderColor: "$accentBorderHover",
  },
});

export const Button: React.FC = (props) => {
  let ref = useRef(null);
  let { buttonProps } = useButton(props, ref);

  return (
    <StyledButton {...buttonProps} ref={ref}>
      {props.children}
    </StyledButton>
  );
};
