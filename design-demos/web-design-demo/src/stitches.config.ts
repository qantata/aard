import { createStitches } from "@stitches/react";
import { blue, blueDark, slate, slateDark } from "@radix-ui/colors";

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme: lightTheme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      ...blue,
      ...slate,

      // Accent "blue" color
      accent1: "$blue1",
      accent2: "$blue2",
      accent3: "$blue3",
      accent4: "$blue4",
      accent5: "$blue5",
      accent6: "$blue6",
      accent7: "$blue7",
      accent8: "$blue8",
      accent9: "$blue9",
      accent10: "$blue10",
      accent11: "$blue11",
      accent12: "$blue12",

      accentBg: "$accent1",
      accentBgSubtle: "$accent2",
      accentUIBg: "$accent3",
      accentUIBgHover: "$accent4",
      accentUIBgActive: "$accent5",
      accentBorderSubtle: "$accent6",
      accentBorder: "$accent7",
      accentBorderHover: "$accent8",
      accentBgSolid: "$accent9",
      accentBgSolidHover: "$accent10",
      accentTextSecondary: "$accent11",
      accentTextPrimary: "$accent12",

      // Grays
      gray1: "$slate1",
      gray2: "$slate2",
      gray3: "$slate3",
      gray4: "$slate4",
      gray5: "$slate5",
      gray6: "$slate6",
      gray7: "$slate7",
      gray8: "$slate8",
      gray9: "$slate9",
      gray10: "$slate10",
      gray11: "$slate11",
      gray12: "$slate12",

      grayBgVoid: "#fff",
      grayBgSubtle: "$gray1",
      grayBg: "$gray2",
      grayUIBg: "$gray3",
      grayUIBgHover: "$gray4",
      grayUIBgActive: "$gray5",
      grayBorderSubtle: "$gray6",
      grayBorder: "$gray7",
      grayBorderHover: "$gray8",
      grayBgSolid: "$gray9",
      grayBgSolidHover: "$gray10",
      grayTextSecondary: "$gray11",
      grayTextPrimary: "$gray12",
    },
    fonts: {
      primary: "Inter",
      100: "Lato100",
      200: "Lato200",
      300: "Lato300",
      400: "Lato400",
      500: "Lato500",
      600: "Lato600",
      700: "Lato700",
      800: "Lato800",
      900: "Lato900",
    },
    fontSizes: {
      10: "0.625rem",
      12: "0.75rem",
      13: "0.8125rem",
      14: "0.875rem",
      15: "0.9375rem",
      16: "1rem",
      18: "1.125rem",
      20: "1.25rem",
      22: "1.375rem",
      24: "1.5rem",
      32: "2rem",
      40: "2.5rem",
      48: "3rem",
    },
    sizes: {
      contentTopMargin: "100px",
    },
  },
});

export const darkTheme = createTheme({
  colors: {
    ...blueDark,
    ...slateDark,

    // Accent "blue" color
    accent1: "$blue1",
    accent2: "$blue2",
    accent3: "$blue3",
    accent4: "$blue4",
    accent5: "$blue5",
    accent6: "$blue6",
    accent7: "$blue7",
    accent8: "$blue8",
    accent9: "$blue9",
    accent10: "$blue10",
    accent11: "$blue11",
    accent12: "$blue12",

    accentBg: "$accent1",
    accentBgSubtle: "$accent2",
    accentUIBg: "$accent3",
    accentUIBgHover: "$accent4",
    accentUIBgActive: "$accent5",
    accentBorderSubtle: "$accent6",
    accentBorder: "$accent7",
    accentBorderHover: "$accent8",
    accentBgSolid: "$accent9",
    accentBgSolidHover: "$accent10",
    accentTextSecondary: "$accent11",
    accentTextPrimary: "$accent12",

    // Grays
    gray1: "$slate1",
    gray2: "$slate2",
    gray3: "$slate3",
    gray4: "$slate4",
    gray5: "$slate5",
    gray6: "$slate6",
    gray7: "$slate7",
    gray8: "$slate8",
    gray9: "$slate9",
    gray10: "$slate10",
    gray11: "$slate11",
    gray12: "$slate12",

    grayBgVoid: "#000",
    grayBgSubtle: "$gray1",
    grayBg: "$gray2",
    grayUIBg: "$gray3",
    grayUIBgHover: "$gray4",
    grayUIBgActive: "$gray5",
    grayBorderSubtle: "$gray6",
    grayBorder: "$gray7",
    grayBorderHover: "$gray8",
    grayBgSolid: "$gray9",
    grayBgSolidHover: "$gray10",
    grayTextSecondary: "$gray11",
    grayTextPrimary: "$gray12",
  },
});