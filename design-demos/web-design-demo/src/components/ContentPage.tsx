import { styled } from "../stitches.config";

export const ContentPage = styled("div", {
  width: "calc(100% - 280px)",
  marginLeft: "280px",
  position: "relative",

  "> *": {
    padding: "$sizes$contentTopMargin 32px 32px 32px",
  },
});

export const ContentPageHeader = styled("div", {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
});

export const ContentPageHeaderTitles = styled("div", {});

export const ContentPageHeaderActions = styled("div");

export const ContentPageTitle = styled("h1", {
  fontSize: "$20",
  fontFamily: "$600",
  marginBottom: "8px",
  color: "$grayTextPrimary",
});

export const ContentPageSubtitle = styled("p", {
  fontSize: "$14",
  fontFamily: "$600",
  color: "$grayTextSecondary",
});
