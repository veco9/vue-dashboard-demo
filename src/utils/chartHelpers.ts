/**
 * Shared utilities for chart data transformation.
 */
import i18n from "@/plugins/i18n";
import { getColorFromPalette, getLightColorFromPalette, getMainColorPalette } from "@/composables/theme";

// Types

export type ChartFormatter = (
  value: string | number | null | undefined,
  options?: Intl.NumberFormatOptions,
) => string;

export interface ChartValueItem {
  valueLabel: string;
  value: number;
  valueCompare?: number;
}

export type ChartValue = string | number | ChartValueItem[] | undefined;

export interface ChartRowBase {
  category?: string;
  xLabel?: string;
  [key: string]: ChartValue;
}

export type TooltipMode = "single" | "shared" | "compact" | undefined;

export interface ChartConfig {
  valueFormatter?: ChartFormatter;
  tooltipValueFormatter?: ChartFormatter;
  categoryTooltipFormatter?: (value: string) => string;
  showValueLabels?: boolean;
  tooltipMode?: TooltipMode;
}

export interface TransformResult<TSeries> {
  chartData: ChartRowBase[];
  series: TSeries[];
}

// Constants

export const COMPACT_FORMAT: Intl.NumberFormatOptions = {
  notation: "compact",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
};

export const PRIMARY_STACK = "primary";
export const COMPARE_STACK = "compare";

// HTML escaping

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

// Key utilities

export function toSafeKey(label: string): string {
  return label
    .replace(/[()[\]{}]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_\u00C0-\u024F]/g, "");
}

export function createKeyMapping(labels: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const label of labels) {
    map[label] = toSafeKey(label);
  }
  return map;
}

// Label utilities

export function formatCompareKey(label: string): string {
  return `${label} (${i18n.global.t("widget.comparison")})`;
}

export function getUniqueSeriesNames(data: { values?: ChartValueItem[] }[]): string[] {
  const seen = new Set<string>();
  for (const group of data) {
    for (const v of group.values ?? []) {
      seen.add(v.valueLabel);
    }
  }
  return Array.from(seen);
}

export function mapCategoriesToIndex(data: { xLabel: string }[]): Record<string, number> {
  const map: Record<string, number> = {};
  data.forEach((group, idx) => {
    map[group.xLabel] = idx;
  });
  return map;
}

// Color utilities

export function pickSeriesColor(index: number, isCompare: boolean, pairedMode = false): string {
  if (isCompare) {
    return getLightColorFromPalette(index);
  }
  if (pairedMode) {
    const palette = getMainColorPalette();
    return palette[index % palette.length];
  }
  return getColorFromPalette(index);
}

export function pickSplitStackColor(isTop?: boolean, isCompare?: boolean): string {
  const idx = isCompare ? 1 : 0;
  return isTop ? getLightColorFromPalette(idx) : getColorFromPalette(idx);
}

export function pickCompareStackColor(compareLabel: string, allLabels: string[]): string {
  const idx = allLabels.findIndex((label) => formatCompareKey(label) === compareLabel);
  return getLightColorFromPalette(idx);
}

export function findSeriesIndex(key: string, primaryKeys: string[], compareKeys: string[]): number {
  if (compareKeys.includes(key)) {
    return compareKeys.indexOf(key);
  }
  return primaryKeys.indexOf(key);
}
