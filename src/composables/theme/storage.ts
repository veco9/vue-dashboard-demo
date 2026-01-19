import type { ThemeConfig } from "./types";
import { primaryPalettes, surfacePalettes } from "./palettes";

const STORAGE_KEY = "dashboard-theme";

const DEFAULT_CONFIG: ThemeConfig = {
  primary: "azia",
  surface: "slate",
  isDark: true,
};

export function loadThemeFromStorage(): ThemeConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const config = JSON.parse(stored);

      // Validate that stored values exist in available palettes
      const validPrimary = primaryPalettes.some((p) => p.name === config.primary);
      const validSurface = surfacePalettes.some((p) => p.name === config.surface);

      return {
        primary: validPrimary ? config.primary : DEFAULT_CONFIG.primary,
        surface: validSurface ? config.surface : DEFAULT_CONFIG.surface,
        isDark: typeof config.isDark === "boolean" ? config.isDark : DEFAULT_CONFIG.isDark,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_CONFIG;
}

export function saveThemeToStorage(config: ThemeConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
