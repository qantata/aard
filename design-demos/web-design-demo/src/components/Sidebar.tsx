import { styled } from "../stitches.config";

const Container = styled("div", {
  width: "280px",
  height: "100%",
  padding: "$sizes$contentTopMargin 24px 0 24px",
  position: "fixed",
  backgroundColor: "$grayBg",

  display: "flex",
  flexDirection: "column",
  gap: "6px",
});

export const Root = Container;
export * from "./SidebarNavbar";
export * from "./SidebarLinkGroup";
