import { styled } from "../stitches.config";

export const ContentPage = styled("div", {
  flex: "1",
  position: "relative",

  "> *": {
    padding: "$sizes$contentTopMargin 32px 32px 32px",
  },
});

export const ContentPageTitle = styled("h1", {
  fontSize: "$24",
  fontWeight: "600",
});
