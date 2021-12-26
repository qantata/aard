import { useContext } from "react";
import { MoreHorizontal } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/themeContext";

import { styled } from "../stitches.config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIconTrigger,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";

import LightLogoUrl from "/images/Aard-Light-Text-Full.png";
import DarkLogoUrl from "/images/Aard-Dark-Text-Full.png";

const Container = styled("div", {
  width: "100%",
  height: "70px",
  padding: "20px 24px",
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
  const theme = useContext(ThemeContext);
  const navigate = useNavigate();

  const onSettingsSelect = () => {
    navigate("/settings");
  };

  return (
    <Container>
      <Logo>
        <Link to="/browse/videos">
          <img src={theme.theme === "Light" ? LightLogoUrl : DarkLogoUrl} />
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
