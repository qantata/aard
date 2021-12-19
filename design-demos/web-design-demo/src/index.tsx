import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { globalCss } from "./stitches.config";
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
    fontFamily: "$primary",
    outlineColor: "$accentBorderHover",
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
  ],
});

const App: React.FC<any> = ({ children }) => {
  globalStyles();

  return children;
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
