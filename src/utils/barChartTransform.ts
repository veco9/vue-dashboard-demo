/**
 * Bar chart data transformation for AG Charts.
 *
 * Sub-modules:
 *   barChartTypes.ts      – type definitions
 *   barChartColors.ts     – fill / item-styler logic
 *   barChartFormatters.ts – label & tooltip formatters
 *   barChartSeries.ts     – series builders (buildSeries, buildAllSeries, buildLabelSeries)
 */
import type { AgBarSeriesOptions } from "ag-charts-enterprise";
import {
  createKeyMapping,
  formatCompareKey,
  getUniqueSeriesNames,
  mapCategoriesToIndex,
  toSafeKey,
  type TransformResult,
} from "./chartHelpers";
import type { BarRow, BarDataPoint, BarConfig } from "./barChartTypes";
import { buildAllSeries, buildLabelSeries } from "./barChartSeries";

// Re-export public types so consumers keep importing from this file
export type { BarDataPoint, BarConfig } from "./barChartTypes";

const LABEL_SERIES_KEY = "_categoryLabel";

function transformRow(
  point: BarDataPoint,
  hasCompare: boolean,
  keyMap: Record<string, string>,
): BarRow {
  const row: BarRow = { category: point.xLabel };

  for (const v of point.values) {
    const key = keyMap[v.valueLabel] ?? toSafeKey(v.valueLabel);
    row[key] = v.value;

    if (hasCompare && v.valueCompare !== undefined) {
      row[formatCompareKey(key)] = v.valueCompare;
    }
  }

  return row;
}

export function buildBarChartData({
  data,
  compareActive,
  seriesOptions,
  customOptions,
}: {
  data: BarDataPoint[];
  compareActive?: boolean;
  seriesOptions?: Omit<AgBarSeriesOptions, "type" | "xKey" | "yKey">;
  customOptions?: BarConfig;
}): TransformResult<AgBarSeriesOptions> {
  const labels = getUniqueSeriesNames(data);
  const keyMap = createKeyMapping(labels);
  const hasCompare = Boolean(compareActive);
  const chartData = data.map((point) => transformRow(point, hasCompare, keyMap));
  const categoryIndexMap = mapCategoriesToIndex(data);

  const series = buildAllSeries(
    labels,
    hasCompare,
    categoryIndexMap,
    keyMap,
    seriesOptions,
    customOptions,
  );

  if (customOptions?.floatingCategoryLabels) {
    for (const row of chartData) {
      row[LABEL_SERIES_KEY] = 0;
    }

    const labelSeries = buildLabelSeries({ seriesOptions, customOptions });
    series.unshift(labelSeries);
  }

  return { chartData, series };
}
