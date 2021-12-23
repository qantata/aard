import ReactDOM from "react-dom";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { darkTheme, globalCss, lightTheme, styled } from "./stitches.config";
import { ThemeContext, ThemeContextType } from "./context/themeContext";
import Browse from "./pages/Browse";
import Settings from "./pages/Settings";
import Videos from "./pages/browse/Videos";
import Watch from "./pages/browse/Watch";
import General from "./pages/settings/General";
import Libraries from "./pages/settings/Libraries";
import Users from "./pages/settings/Users";

const globalStyles = globalCss({
  "*": {
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
    outlineColor: "$accentBorderHover",
    fontFamily: "$400",
  },
  html: {
    height: "100%",
    fontSize: "16px",
  },
  body: {
    height: "100%",
    overflowY: "hidden",

    "> #root": {
      height: "100%",
    },
  },
  a: {
    textDecoration: "none",
    color: "inherit",
  },
  "@font-face": [
    {
      fontFamily: "Inter",
      src: "url(/fonts/Inter/Inter-Var.ttf)",
      fontDisplay: "swap",
      fontWeight: "100 900",
    },
    {
      fontFamily: "Lato100",
      src: "url(/fonts/Lato/Lato-Hairline.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato200",
      src: "url(/fonts/Lato/Lato-Thin.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato300",
      src: "url(/fonts/Lato/Lato-Light.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato400",
      src: "url(/fonts/Lato/Lato-Regular.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato500",
      src: "url(/fonts/Lato/Lato-Medium.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato600",
      src: "url(/fonts/Lato/Lato-Semibold.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato700",
      src: "url(/fonts/Lato/Lato-Bold.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato800",
      src: "url(/fonts/Lato/Lato-Heavy.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato900",
      src: "url(/fonts/Lato/Lato-Black.ttf)",
      fontDisplay: "swap",
    },
  ],
});

const ThemeContainer = styled("div", {
  width: "100%",
  height: "100%",
});

const App: React.FC<any> = ({ children }) => {
  globalStyles();

  const [theme, setTheme] = useState<ThemeContextType["theme"]>("Dark");

  const updateBodyClass = (newTheme: ThemeContextType["theme"]) => {
    if (document.body.classList.contains(lightTheme)) {
      document.body.classList.remove(lightTheme);
    }

    if (document.body.classList.contains(darkTheme)) {
      document.body.classList.remove(darkTheme);
    }

    document.body.classList.add(newTheme === "Dark" ? darkTheme : lightTheme);
  };

  useEffect(() => {
    updateBodyClass(theme);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: (newTheme) => {
          updateBodyClass(newTheme);
          setTheme(newTheme);
        },
      }}
    >
      <ThemeContainer>{children}</ThemeContainer>
    </ThemeContext.Provider>
  );
};

// @ts-ignore until react-18 types come out
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <App>
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Navigate replace to="/browse" />} />

          <Route path="browse" element={<Browse />}>
            <Route path="videos">
              <Route index element={<Videos />} />
            </Route>
          </Route>

          <Route path="settings" element={<Settings />}>
            <Route index element={<Navigate replace to="/settings/general" />} />
            <Route path="general" element={<General />} />
            <Route path="libraries" element={<Libraries />} />
            <Route path="users" element={<Users />} />
          </Route>

          <Route path="watch" element={<Watch />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </App>
);
