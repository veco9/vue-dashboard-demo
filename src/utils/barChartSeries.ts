/**
 * Series building for bar charts.
 */
import type { AgBarSeriesOptions } from "ag-charts-enterprise";
import type { BarConfig, BarRow, SeriesContext } from "./barChartTypes";
import { formatCompareKey, toSafeKey, COMPARE_STACK, PRIMARY_STACK } from "./chartHelpers";
import { getStaticFill, createItemStyler } from "./barChartColors";
import { createLabelFormatter, createTooltipRenderer } from "./barChartFormatters";
import { useTheme } from "@/composables";

const LABEL_SERIES_KEY = "_categoryLabel";

export function buildSeries(ctx: SeriesContext): AgBarSeriesOptions {
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

export function buildAllSeries(
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

export function buildLabelSeries({
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
      formatter: (params) => (params.datum as BarRow).category,
    },
    tooltip: { enabled: false },
  };
}
