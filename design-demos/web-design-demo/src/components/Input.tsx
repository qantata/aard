import { useRef } from "react";
import { useTextField } from "@react-aria/textfield";

import { styled } from "../stitches.config";

const Container = styled("div", {
  display: "flex",
  flexDirection: "column",
});

const Label = styled("label", {
  color: "$grayTextPrimary",
  fontWeight: "500",
  marginBottom: "6px",
  fontSize: "$14",
});

const StyledInput = styled("input", {
  padding: "6px 12px",
  backgroundColor: "$grayUIBg",
  border: "0",
  borderRadius: "6px",
  fontSize: "$16",
  maxWidth: "300px",

  "&:hover": {
    backgroundColor: "$grayUIBgHover",
  },

  "&:focus": {
    backgroundColor: "$grayUIBgActive !important",
  },
});

type Props = {
  type: "text" | "password";
  label?: string;
  errorMessage?: string;
  description?: string;
};

export const Input: React.FC<Props> = (props) => {
  const { label } = props;
  let ref = useRef(null);
  let { labelProps, inputProps, descriptionProps, errorMessageProps } = useTextField(props, ref);

  return (
    <Container>
      {label && <Label {...labelProps}>{label}</Label>}
      <StyledInput {...inputProps} ref={ref} type={props.type} />
      {props.description && (
        <div {...descriptionProps} style={{ fontSize: 12 }}>
          {props.description}
        </div>
      )}
      {props.errorMessage && (
        <div {...errorMessageProps} style={{ color: "red", fontSize: 12 }}>
          {props.errorMessage}
        </div>
      )}
    </Container>
  );
};
