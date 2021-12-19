import { IntrinsicElementsKeys } from "@stitches/react/types/styled-component";

import { styled } from "../stitches.config";

export const StyledFocus = (type: IntrinsicElementsKeys) =>
  styled(type, {
    variants: {
      focus: {
        true: {
          outline: "2px solid $accentBorder",
        },
      },
    },
  });
