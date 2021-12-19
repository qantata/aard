import { Outlet } from "react-router-dom";
import { styled } from "@stitches/react";
import { Library, Settings as SettingsIcon, User } from "lucide-react";

import * as Sidebar from "../components/Sidebar";
import { ContentPage } from "../components/ContentPage";

const Container = styled("div", {
  width: "100%",
  height: "100%",
  display: "flex",
});

const Settings = () => {
  return (
    <Container>
      <Sidebar.Root>
        <Sidebar.Navbar />

        <Sidebar.LinkGroup>
          <Sidebar.HyperLink to="/settings/general">
            <Sidebar.LinkGroupHeader>
              <SettingsIcon size={18} />
              General
            </Sidebar.LinkGroupHeader>
          </Sidebar.HyperLink>
        </Sidebar.LinkGroup>

        <Sidebar.LinkGroup>
          <Sidebar.HyperLink to="/settings/libraries">
            <Sidebar.LinkGroupHeader>
              <Library size={18} />
              Libraries
            </Sidebar.LinkGroupHeader>
          </Sidebar.HyperLink>
        </Sidebar.LinkGroup>

        <Sidebar.LinkGroup>
          <Sidebar.HyperLink to="/settings/users">
            <Sidebar.LinkGroupHeader>
              <User size={18} />
              Users
            </Sidebar.LinkGroupHeader>
          </Sidebar.HyperLink>
        </Sidebar.LinkGroup>
      </Sidebar.Root>

      <ContentPage>
        <Outlet />
      </ContentPage>
    </Container>
  );
};

export default Settings;
