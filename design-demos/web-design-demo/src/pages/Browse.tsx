import { Outlet } from "react-router-dom";
import { styled } from "@stitches/react";

import * as Sidebar from "../components/Sidebar";
import { Video } from "lucide-react";
import { ContentPage } from "../components/ContentPage";
import { BrowseContentBar } from "../components/BrowseContentBar";

const Container = styled("div", {
  width: "100%",
  height: "100%",
  display: "flex",
});

const Browse = () => {
  return (
    <Container>
      <Sidebar.Root>
        <Sidebar.Navbar />

        <Sidebar.LinkGroup>
          <Sidebar.HyperLink to="/browse/videos">
            <Sidebar.LinkGroupHeader>
              <Video size={18} />
              Videos
            </Sidebar.LinkGroupHeader>
          </Sidebar.HyperLink>
        </Sidebar.LinkGroup>
      </Sidebar.Root>

      <ContentPage>
        <BrowseContentBar />

        <Outlet />
      </ContentPage>
    </Container>
  );
};

export default Browse;
