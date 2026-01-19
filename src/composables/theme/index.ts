// Types
export type { ThemePalette, ChartColorPalette, ThemeConfig } from "./types";

// Palette data
export { chartPalettes, primaryPalettes, surfacePalettes } from "./palettes";

// Storage utilities
export { loadThemeFromStorage, saveThemeToStorage } from "./storage";

// Color utilities
export { getColorFromPalette, getLightColorFromPalette, getMainColorPalette } from "./useTheme";

// Main composable
export { useTheme } from "./useTheme";

// Initialization
export { initTheme } from "./useTheme";
