import { MoreHorizontal } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { styled } from "../stitches.config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIconTrigger,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import LogoUrl from "/images/Aard-Light-Text-Full.png";

const Container = styled("div", {
  width: "100%",
  height: "50px",
  padding: "10px 24px",
  position: "absolute",
  top: "0",
  left: "0",

  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const Logo = styled("div", {
  height: "100%",

  img: {
    height: "calc(100% - 4px)",
    marginTop: "2px",
  },
});

export const Navbar = () => {
  const navigate = useNavigate();

  const onSettingsSelect = () => {
    navigate("/settings");
  };

  return (
    <Container>
      <Logo>
        <Link to="/browse/videos">
          <img src={LogoUrl} />
        </Link>
      </Logo>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <DropdownMenuIconTrigger>
            <MoreHorizontal size={16} />
          </DropdownMenuIconTrigger>
        </DropdownMenuTrigger>

        <DropdownMenuContent sideOffset={5}>
          <DropdownMenuItem onSelect={onSettingsSelect}>Settings</DropdownMenuItem>
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Container>
  );
};
