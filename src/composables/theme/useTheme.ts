import { ref, computed } from "vue";
import { updatePreset } from "@primevue/themes";
import type { ThemePalette } from "./types";
import { chartPalettes, primaryPalettes, surfacePalettes } from "./palettes";
import { loadThemeFromStorage, saveThemeToStorage } from "./storage";

// ============================================
// Global Theme State
// ============================================

const storedConfig = loadThemeFromStorage();
const currentPrimary = ref<string>(storedConfig.primary);
const currentSurface = ref<string>(storedConfig.surface);
const isDark = ref<boolean>(storedConfig.isDark);
const themeKey = ref<number>(0);

// Computed chart palette based on current primary color
const chartPalette = computed(() => {
  const palette = chartPalettes[currentPrimary.value] ?? chartPalettes.azia;
  return {
    main: palette.main,
    light: palette.light,
    all: [...palette.main, ...palette.light],
  };
});

// ============================================
// Color Utility Functions
// ============================================

/**
 * Get a color from the current theme's chart palette.
 * Uses the combined (main + light) palette.
 */
export function getColorFromPalette(index: number): string {
  const palette = chartPalette.value.all;
  return palette[index % palette.length];
}

/**
 * Get a light color from the current theme's chart palette.
 */
export function getLightColorFromPalette(index: number): string {
  const palette = chartPalette.value.light;
  return palette[index % palette.length];
}

/**
 * Get the main color palette array from the current theme.
 */
export function getMainColorPalette(): string[] {
  return chartPalette.value.main;
}

// ============================================
// Internal Functions
// ============================================

function applyDarkMode(dark: boolean): void {
  if (dark) {
    document.documentElement.classList.add("app-dark");
  } else {
    document.documentElement.classList.remove("app-dark");
  }
}

function applyTheme(saveToStorage = true): void {
  const primary = primaryPalettes.find((p) => p.name === currentPrimary.value);
  const surface = surfacePalettes.find((p) => p.name === currentSurface.value);

  if (!primary || !surface) return;

  updatePreset({
    semantic: {
      primary: primary.palette,
      colorScheme: {
        light: {
          surface: surface.palette,
        },
        dark: {
          surface: surface.palette,
        },
      },
    },
  });

  if (saveToStorage) {
    themeKey.value++;
    saveThemeToStorage({
      primary: currentPrimary.value,
      surface: currentSurface.value,
      isDark: isDark.value,
    });
  }
}

// ============================================
// Main Composable
// ============================================

export function useTheme() {
  function setPrimary(name: string): void {
    currentPrimary.value = name;
    applyTheme();
  }

  function setSurface(name: string): void {
    currentSurface.value = name;
    applyTheme();
  }

  function toggleDarkMode(): void {
    isDark.value = !isDark.value;
    applyDarkMode(isDark.value);
    saveThemeToStorage({
      primary: currentPrimary.value,
      surface: currentSurface.value,
      isDark: isDark.value,
    });
    themeKey.value++;
  }

  function getCurrentPrimary(): ThemePalette | undefined {
    return primaryPalettes.find((p) => p.name === currentPrimary.value);
  }

  function getCurrentSurface(): ThemePalette | undefined {
    return surfacePalettes.find((p) => p.name === currentSurface.value);
  }

  return {
    // State
    currentPrimary,
    currentSurface,
    isDark,
    themeKey,
    chartPalette,
    // Palette data
    primaryPalettes,
    surfacePalettes,
    // Methods
    setPrimary,
    setSurface,
    toggleDarkMode,
    getCurrentPrimary,
    getCurrentSurface,
  };
}

// ============================================
// Theme Initialization
// ============================================

let initialized = false;

/**
 * Initialize theme from localStorage.
 * Must be called after PrimeVue is installed.
 */
export function initTheme(): void {
  if (initialized) return;
  applyTheme(false);
  applyDarkMode(isDark.value);
  initialized = true;
}
