import { useContext } from "react";

import { ContentPageSubtitle, ContentPageTitle } from "../../components/ContentPage";
import { Divider } from "../../components/Divider";
import { Select } from "../../components/Select";
import { ThemeContext, ThemeContextType } from "../../context/themeContext";
import { styled } from "../../stitches.config";

const Container = styled("div");

const General = () => {
  const theme = useContext(ThemeContext);

  const onThemeChange = (newTheme: ThemeContextType["theme"]) => {
    theme.setTheme(newTheme);
  };

  const themeOptions: ThemeContextType["theme"][] = ["Light", "Dark"];

  return (
    <Container>
      <ContentPageTitle>Appearance</ContentPageTitle>
      <ContentPageSubtitle>Change the theme of the app</ContentPageSubtitle>

      <Divider />

      <div>
        <Select
          options={themeOptions}
          value={theme.theme}
          onChange={(newTheme: string) => onThemeChange(newTheme as ThemeContextType["theme"])}
        />
      </div>
    </Container>
  );
};

export default General;
