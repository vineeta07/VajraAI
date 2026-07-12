import { createTheme as createMuiTheme } from "@mui/material/styles";
import { shadows } from "./core/shadows";
import { palette } from "./core/palette";
import { themeConfig } from "./theme-config";
import { components } from "./core/components";
import { typography } from "./core/typography";
import { customShadows } from "./core/custom-shadows";
export const baseTheme = {
  colorSchemes: {
    light: {
      palette: palette.light,
      shadows: shadows.light,
      customShadows: customShadows.light
    },
    dark: {
      palette: palette.dark,
      shadows: shadows.dark,
      customShadows: customShadows.dark
    }
  },
  components,
  typography,
  shape: { borderRadius: 8 },
  cssVariables: themeConfig.cssVariables
};
export function createTheme(mode, { themeOverrides = {} } = {}) {
  const theme = createMuiTheme({
    ...baseTheme,
    palette: mode === 'dark' ? palette.dark : palette.light,
    shadows: mode === 'dark' ? shadows.dark : shadows.light,
    customShadows: mode === 'dark' ? customShadows.dark : customShadows.light,
  }, themeOverrides);
  return theme;
}
