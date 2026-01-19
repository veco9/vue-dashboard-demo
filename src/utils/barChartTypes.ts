/**
 * Type definitions for bar chart data transformation.
 */
import type { AgBarSeriesOptions } from "ag-charts-enterprise";
import type { ChartConfig, ChartRowBase, ChartValueItem } from "./chartHelpers";

export interface BarDataPoint {
  xLabel: string;
  values: ChartValueItem[];
}

export interface BarConfig extends ChartConfig {
  colorByCategory?: boolean;
  stackBars?: boolean;
  splitStacks?: boolean;
  floatingCategoryLabels?: boolean;
  categoryLabelColor?: string;
}

export interface BarRow extends ChartRowBase {
  category: string;
}

export interface SeriesContext {
  label: string;
  isLast: boolean;
  allLabels: string[];
  categoryIndexMap: Record<string, number>;
  keyMap: Record<string, string>;
  forCompare: boolean;
  hasCompare: boolean;
  colorIndex?: number;
  config?: BarConfig;
  baseOptions?: Omit<AgBarSeriesOptions, "type" | "xKey" | "yKey">;
}
