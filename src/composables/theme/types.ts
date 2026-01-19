export interface ThemePalette {
  name: string;
  label: string;
  color: string; // Preview color (500 shade)
  palette: Record<string, string>;
}

export interface ChartColorPalette {
  main: string[];
  light: string[];
}

export interface ThemeConfig {
  primary: string;
  surface: string;
  isDark: boolean;
}
