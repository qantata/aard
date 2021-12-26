import { createContext } from "react";

export type ThemeContextType = {
  theme: "Light" | "Dark";
  setTheme: (theme: ThemeContextType["theme"]) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "Light",
  setTheme: (theme: ThemeContextType["theme"]) => {},
});
