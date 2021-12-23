import { cloneElement } from "react";
import { Link, LinkProps, useResolvedPath, useMatch } from "react-router-dom";
import { gray, sage, slate } from "@radix-ui/colors";

import { styled } from "../stitches.config";

const LinkGroup = styled("div", {
  width: "100%",
});

const LinkGroupHeader = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "12px 16px",
  borderRadius: "10px",
  fontSize: "$13",
  fontFamily: "$500",
  color: "$grayTextSecondary",

  "&:hover": {
    backgroundColor: "$grayUIBgHover",
  },

  variants: {
    active: {
      true: {
        color: "$grayTextPrimary",
        backgroundColor: "$grayUIBgActive !important",
        fontFamily: "$600",
      },
    },
  },
});

// In future version
const LinkGroupItems = styled("div", {});

// In future version
const LinkGroupItem = styled("div", {});

export const HyperLink: React.FC<LinkProps> = ({ to, children, ...props }) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });
  const active = match !== null;

  const ChildrenWithActive = cloneElement(children as React.ReactElement<any>, {
    active,
  });

  return (
    <Link to={to} {...props}>
      {ChildrenWithActive}
    </Link>
  );
};
/*
export const SidebarLinkGroup = LinkGroup;
export const SidebarLinkGroupHeader = LinkGroupHeader;
export const SidebarLinkGroupHeaderIcon = LinkGroupHeaderIcon;
export const SidebarLinkGroupItems = LinkGroupItems;
export const SidebarLinkGroupItem = LinkGroupItem;*/

export { LinkGroup, LinkGroupHeader, LinkGroupItems, LinkGroupItem };
