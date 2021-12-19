import { useState } from "react";

import { ContentPageTitle } from "../../components/ContentPage";
import { Divider } from "../../components/Divider";
import { Select } from "../../components/Select";
import { SettingsSubtitle } from "../../components/SettingsSubtitle";
import { styled } from "../../stitches.config";

const Container = styled("div");

const General = () => {
  const [theme, setTheme] = useState("Light");

  return (
    <Container>
      <ContentPageTitle>General Settings</ContentPageTitle>

      <Divider />

      <SettingsSubtitle>Appearance</SettingsSubtitle>

      <div>
        <Select options={["Light", "Dark"]} value={theme} onChange={setTheme} />
      </div>
    </Container>
  );
};

export default General;
