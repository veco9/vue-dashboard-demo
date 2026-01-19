/**
 * Color logic for bar chart series.
 */
import type { SeriesContext } from "./barChartTypes";
import {
  formatCompareKey,
  pickCompareStackColor,
  pickSeriesColor,
  pickSplitStackColor,
  toSafeKey,
} from "./chartHelpers";

/**
 * Returns a static fill color when possible.
 */
export function getStaticFill(ctx: SeriesContext): string | undefined {
  const { config, isLast, forCompare, hasCompare, allLabels, colorIndex, categoryIndexMap, label } =
    ctx;

  if (config?.stackBars && config?.splitStacks) {
    return pickSplitStackColor(isLast, forCompare);
  }

  if (config?.colorByCategory) {
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

export function createItemStyler(ctx: SeriesContext) {
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

export function sumStackValues(
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
