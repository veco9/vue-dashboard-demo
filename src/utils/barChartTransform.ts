/**
 * Bar chart data transformation for AG Charts.
 */
import type { AgBarSeriesOptions, AgBarSeriesTooltipRendererParams } from "ag-charts-enterprise";
import type { AgChartLabelFormatterParams } from "ag-charts-types";
import {
  type ChartConfig,
  type ChartRowBase,
  type ChartValueItem,
  COMPACT_FORMAT,
  COMPARE_STACK,
  createKeyMapping,
  formatCompareKey,
  getUniqueSeriesNames,
  mapCategoriesToIndex,
  pickCompareStackColor,
  pickSeriesColor,
  pickSplitStackColor,
  PRIMARY_STACK,
  toSafeKey,
  type TransformResult
} from "./chartHelpers";
import { useTheme } from "@/composables";

const LABEL_SERIES_KEY = "_categoryLabel";

// Types

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

interface BarRow extends ChartRowBase {
  category: string;
}

interface SeriesContext {
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

// Color logic

/**
 * Returns a static fill color when possible.
 */
function getStaticFill(ctx: SeriesContext): string | undefined {
  const { config, isLast, forCompare, hasCompare, allLabels, colorIndex, categoryIndexMap, label } =
    ctx;

  if (config?.stackBars && config?.splitStacks) {
    return pickSplitStackColor(isLast, forCompare);
  }

  if (config?.colorByCategory) {
    // For colorByCategory, label is a category name
    const index = categoryIndexMap[label] ?? 0;
    return pickSeriesColor(index, forCompare, hasCompare);
  }

  if (config?.floatingCategoryLabels && colorIndex !== undefined) {
    return pickSeriesColor(colorIndex, forCompare, hasCompare);
  }

  if (forCompare) {
    return pickCompareStackColor(formatCompareKey(label), allLabels);
  }

  return undefined;
}

function createItemStyler(ctx: SeriesContext) {
  const { config, forCompare, hasCompare, categoryIndexMap, isLast, allLabels, colorIndex, label } =
    ctx;

  if (config?.stackBars && config?.splitStacks) {
    return () => ({ fill: pickSplitStackColor(isLast, forCompare) });
  }

  if (config?.colorByCategory) {
    return (params: { datum: Record<string, unknown> }) => {
      const cat = params.datum.category as string;
      return { fill: pickSeriesColor(categoryIndexMap[cat] ?? 0, forCompare, hasCompare) };
    };
  }

  if (config?.floatingCategoryLabels && colorIndex !== undefined) {
    return () => ({ fill: pickSeriesColor(colorIndex, forCompare, hasCompare) });
  }

  if (forCompare) {
    return () => ({ fill: pickCompareStackColor(formatCompareKey(label), allLabels) });
  }

  return undefined;
}

function sumStackValues(
  datum: Record<string, unknown>,
  labels: string[],
  keyMap: Record<string, string>,
  forCompare: boolean,
): number {
  let total = 0;
  for (const label of labels) {
    const key = keyMap[label] ?? toSafeKey(label);
    const finalKey = forCompare ? formatCompareKey(key) : key;
    total += (datum[finalKey] as number) ?? 0;
  }
  return total;
}

function createLabelFormatter(ctx: SeriesContext) {
  const { config, isLast, allLabels, forCompare, keyMap } = ctx;
  if (!config?.valueFormatter) return undefined;

  return (params: AgChartLabelFormatterParams<unknown>) => {
    if (!config.stackBars) {
      return config.valueFormatter!(params.value, COMPACT_FORMAT);
    }
    if (isLast) {
      const total = sumStackValues(
        params.datum as Record<string, unknown>,
        allLabels,
        keyMap,
        forCompare,
      );
      return config.valueFormatter!(total, COMPACT_FORMAT);
    }
    return "";
  };
}

function createTooltipRenderer(ctx: SeriesContext) {
  const { config } = ctx;

  // Only needed for colorByCategory where fill varies per item
  if (!config?.colorByCategory) return undefined;

  return (params: AgBarSeriesTooltipRendererParams) => {
    const value = params.datum[params.yKey] as number;
    const formattedValue = config.valueFormatter
      ? config.valueFormatter(value, COMPACT_FORMAT)
      : value.toLocaleString();

    // return `<span style="color: ${params.fill};">●</span> ${params.yName}: ${formattedValue}`;
    return `<div class="ag-charts-tooltip-content">
        <span class="ag-charts-tooltip-heading">${params.datum[params.xKey]}</span>
        <span class="ag-charts-tooltip-symbol">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="5"
                  fill="${params.fill}" fill-opacity="${params.fillOpacity}"
                  stroke="${params.stroke}" stroke-opacity="${params.strokeOpacity}"
                  stroke-width="${params.strokeWidth}" />
          </svg>
        </span>
        <div class="ag-charts-tooltip-row ag-charts-tooltip-row--inline">
          <span class="ag-charts-tooltip-label">${params.yName}</span>
          <span class="ag-charts-tooltip-value">${formattedValue}</span>
        </div>
      </div>`;
  };
}

// Series building

function buildSeries(ctx: SeriesContext): AgBarSeriesOptions {
  const { baseOptions, config, label, forCompare, keyMap } = ctx;
  const sanitized = keyMap[label] ?? toSafeKey(label);
  const yKey = forCompare ? formatCompareKey(sanitized) : sanitized;
  const yName = forCompare ? formatCompareKey(label) : label;

  const tooltipRenderer = createTooltipRenderer(ctx);

  return {
    ...(baseOptions ?? {}),
    type: "bar",
    xKey: "category",
    yKey,
    yName,
    stackGroup: config?.stackBars ? (forCompare ? COMPARE_STACK : PRIMARY_STACK) : undefined,
    fill: getStaticFill(ctx),
    itemStyler: createItemStyler(ctx),
    label: {
      enabled: config?.showValueLabels,
      placement: "outside-end",
      formatter: createLabelFormatter(ctx),
      ...(baseOptions?.label ?? {}),
    },
    ...(tooltipRenderer && { tooltip: { renderer: tooltipRenderer } }),
  };
}

function buildAllSeries(
  labels: string[],
  hasCompare: boolean,
  categoryIndexMap: Record<string, number>,
  keyMap: Record<string, string>,
  baseOptions?: Omit<AgBarSeriesOptions, "type" | "xKey" | "yKey">,
  config?: BarConfig,
): AgBarSeriesOptions[] {
  const series: AgBarSeriesOptions[] = [];
  let colorIdx = 0;

  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const isLast = i === labels.length - 1;
    const currentColorIdx = colorIdx;

    const ctx: SeriesContext = {
      label,
      isLast,
      allLabels: labels,
      categoryIndexMap,
      keyMap,
      forCompare: false,
      hasCompare,
      colorIndex: config?.floatingCategoryLabels ? currentColorIdx : undefined,
      config,
      baseOptions,
    };

    series.push(buildSeries(ctx));
    colorIdx++;

    if (hasCompare) {
      series.push(buildSeries({ ...ctx, forCompare: true }));
    }
  }

  return series;
}

// Data transformation

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

function buildLabelSeries({
  seriesOptions,
  customOptions,
}: {
  seriesOptions?: Omit<AgBarSeriesOptions, "type" | "xKey" | "yKey">;
  customOptions: BarConfig;
}): AgBarSeriesOptions {
  const { isDark, getCurrentSurface } = useTheme();
  const surface = getCurrentSurface()!.palette;

  return {
    type: "bar",
    xKey: "category",
    yKey: LABEL_SERIES_KEY,
    yName: "",
    direction: seriesOptions?.direction,
    showInLegend: false,
    fill: "transparent",
    stroke: "transparent",
    label: {
      enabled: true,
      placement: "inside-start",
      spacing: 2,
      itemStyler: () => ({
        color: customOptions.categoryLabelColor ?? (isDark.value ? surface[100] : surface[900]),
      }),
      // color: customOptions.categoryLabelColor ?? (isDark.value ? surface[100] : surface[900]),
      formatter: (params) => (params.datum as BarRow).category,
    },
    tooltip: { enabled: false },
  };
}

// Main export
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
