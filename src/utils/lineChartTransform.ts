/**
 * Line chart data transformation for AG Charts.
 */
import type { AgLineSeriesOptions } from "ag-charts-enterprise";
import {
  type ChartConfig,
  type TransformResult,
  type ChartRowBase,
  formatCompareKey,
  pickSeriesColor,
  findSeriesIndex,
  toSafeKey,
  PRIMARY_STACK,
  COMPARE_STACK,
} from "./chartHelpers";

// Types

export interface LineDataPoint {
  label: string;
  xLabel: string;
  value: number;
  valueCompare?: number;
}

export interface LineConfig extends ChartConfig {
  stacked?: boolean;
  stackGroup?: string;
  yValueLabel?: string;
  useCustomTooltip?: boolean;
}

interface LineRow extends ChartRowBase {
  xLabel: string;
}

// Series building

function buildSeries(
  yKey: string,
  yName: string,
  index: number,
  forCompare: boolean,
  baseOptions?: Omit<AgLineSeriesOptions, "type" | "xKey" | "yKey">,
  config?: LineConfig,
): AgLineSeriesOptions {
  const color = pickSeriesColor(index, forCompare);

  return {
    ...(baseOptions ?? {}),
    type: "line",
    xKey: "xLabel",
    yKey,
    yName,
    stacked: config?.stacked,
    stackGroup: config?.stacked ? (forCompare ? COMPARE_STACK : PRIMARY_STACK) : undefined,
    stroke: color,
    marker: {
      enabled: true,
      fill: color,
      ...(baseOptions?.marker ?? {}),
    },
  };
}

function buildAllSeries(
  primaryKeys: string[],
  compareKeys: string[],
  allKeys: Set<string>,
  keyMap: Record<string, string>,
  baseOptions?: Omit<AgLineSeriesOptions, "type" | "xKey" | "yKey">,
  config?: LineConfig,
): AgLineSeriesOptions[] {
  return Array.from(allKeys).map((yName) => {
    const forCompare = compareKeys.includes(yName);
    const index = findSeriesIndex(yName, primaryKeys, compareKeys);
    const yKey = keyMap[yName] ?? toSafeKey(yName);
    return buildSeries(yKey, yName, index, forCompare, baseOptions, config);
  });
}

// Data transformation

function groupDataByXLabel(
  data: LineDataPoint[],
  compareActive?: boolean,
): {
  chartData: LineRow[];
  primaryKeys: string[];
  compareKeys: string[];
  allKeys: Set<string>;
  keyMap: Record<string, string>;
} {
  const grouped: Record<string, LineRow> = {};
  const primarySet = new Set<string>();
  const compareSet = new Set<string>();
  const allKeys = new Set<string>();
  const keyMap: Record<string, string> = {};

  for (const entry of data) {
    const { xLabel, label, value, valueCompare } = entry;

    if (!grouped[xLabel]) {
      grouped[xLabel] = { xLabel };
    }

    const row = grouped[xLabel];
    const key = toSafeKey(label);
    const compareKey = toSafeKey(formatCompareKey(label));

    keyMap[label] = key;
    row[key] = value;

    primarySet.add(label);
    allKeys.add(label);

    if (compareActive) {
      keyMap[formatCompareKey(label)] = compareKey;
      row[compareKey] = valueCompare;
      compareSet.add(formatCompareKey(label));
      allKeys.add(formatCompareKey(label));
    }
  }

  return {
    chartData: Object.values(grouped),
    primaryKeys: Array.from(primarySet),
    compareKeys: Array.from(compareSet),
    allKeys,
    keyMap,
  };
}

// Main export

export function buildLineChartData({
  data,
  compareActive,
  seriesOptions,
  customOptions,
}: {
  data: LineDataPoint[];
  compareActive?: boolean;
  seriesOptions?: Omit<AgLineSeriesOptions, "type" | "xKey" | "yKey">;
  customOptions?: LineConfig;
}): TransformResult<AgLineSeriesOptions> {
  const { chartData, primaryKeys, compareKeys, allKeys, keyMap } = groupDataByXLabel(data, compareActive);

  const series = buildAllSeries(primaryKeys, compareKeys, allKeys, keyMap, seriesOptions, customOptions);

  return { chartData, series };
}
