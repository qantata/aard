import { useRef } from "react";
import { useToggleState } from "@react-stately/toggle";
import { useCheckbox } from "@react-aria/checkbox";
import { CheckIcon } from "@radix-ui/react-icons";

import { styled } from "../stitches.config";

const StyledLabel = styled("label", {
  color: "$grayTextSecondary",
  fontSize: "$15",
  display: "flex",
  alignItems: "center",
  position: "relative",
  marginBottom: "8px",
});

const StyledInput = styled("input", {
  width: "23px",
  aspectRatio: "1 / 1",
  marginRight: "8px",
  outline: "none",
  appearance: "none",
  borderRadius: "4px",
  border: "1px solid $accentBorderHover",

  "&:focus": {
    outline: "1px solid $grayTextPrimary",
  },

  "&:checked": {
    backgroundColor: "$accentUIBgActive",
  },
});

const Icon = styled("div", {
  position: "absolute",
  left: "4px",
  top: "4px",
  color: "$grayTextPrimary",
});

export const Checkbox: React.FC = (props) => {
  let { children } = props;
  let state = useToggleState(props);
  let ref = useRef(null);
  let { inputProps } = useCheckbox(props, state, ref);

  return (
    <StyledLabel>
      <StyledInput {...inputProps} ref={ref} />
      {state.isSelected && (
        <Icon>
          <CheckIcon />
        </Icon>
      )}
      {children}
    </StyledLabel>
  );
};
