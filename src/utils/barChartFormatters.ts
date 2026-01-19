/**
 * Label and tooltip formatters for bar chart series.
 */
import type { AgBarSeriesTooltipRendererParams } from "ag-charts-enterprise";
import type { AgChartLabelFormatterParams } from "ag-charts-types";
import type { SeriesContext } from "./barChartTypes";
import { COMPACT_FORMAT, escapeHtml } from "./chartHelpers";
import { sumStackValues } from "./barChartColors";

export function createLabelFormatter(ctx: SeriesContext) {
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

export function createTooltipRenderer(ctx: SeriesContext) {
  const { config } = ctx;

  if (!config?.colorByCategory) return undefined;

  return (params: AgBarSeriesTooltipRendererParams) => {
    const value = params.datum[params.yKey] as number;
    const formattedValue = config.valueFormatter
      ? config.valueFormatter(value, COMPACT_FORMAT)
      : value.toLocaleString();

    return `<div class="ag-charts-tooltip-content">
        <span class="ag-charts-tooltip-heading">${escapeHtml(params.datum[params.xKey])}</span>
        <span class="ag-charts-tooltip-symbol">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="5"
                  fill="${escapeHtml(params.fill)}" fill-opacity="${Number(params.fillOpacity)}"
                  stroke="${escapeHtml(params.stroke)}" stroke-opacity="${Number(params.strokeOpacity)}"
                  stroke-width="${Number(params.strokeWidth)}" />
          </svg>
        </span>
        <div class="ag-charts-tooltip-row ag-charts-tooltip-row--inline">
          <span class="ag-charts-tooltip-label">${escapeHtml(params.yName)}</span>
          <span class="ag-charts-tooltip-value">${escapeHtml(formattedValue)}</span>
        </div>
      </div>`;
  };
}
