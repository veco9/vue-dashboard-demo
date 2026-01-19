import type {
  AgBarSeriesTooltipRendererParams,
  AgChartLabelFormatterParams,
  AgChartTheme,
  AgPieSeriesTooltipRendererParams,
  DatumDefault,
} from "ag-charts-types";
import { useTheme } from "@/composables/theme";
import { formatAmount } from "@/utils/formatters";
import colors from "tailwindcss/colors";

/**
 * Tooltip renderer for bar charts - returns AgTooltipRendererResult format
 */
function barChartTooltipRenderer(params: AgBarSeriesTooltipRendererParams) {
  const { datum, yKey, yName } = params;
  return {
    data: [
      {
        label: yName || yKey,
        value: formatAmount(datum[yKey]),
      },
    ],
    symbol: {
      marker: {
        shape: "circle" as const,
      },
    },
  };
}

/**
 * Tooltip renderer for pie/donut charts - returns AgTooltipRendererResult format
 */
function pieTooltipRenderer(params: AgPieSeriesTooltipRendererParams<DatumDefault>) {
  const { datum, angleKey, calloutLabelKey, angleName } = params;
  return {
    data: [
      {
        label: calloutLabelKey ? datum[calloutLabelKey] : undefined,
        value: formatAmount(datum[angleKey]),
      },
    ],
    title: angleName ? datum[angleName] : undefined,
    symbol: {
      marker: {
        shape: "circle" as const,
      },
    },
  };
}

/**
 * Sector label formatter for pie/donut charts
 */
function sectorLabelFormatter(params: AgChartLabelFormatterParams<DatumDefault>): string {
  return formatAmount(params.value, {
    notation: "compact",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}

/**
 * Create AG Charts theme
 * @param integrated - Whether the chart is integrated (more padding)
 */
export function createChartTheme(integrated = false): AgChartTheme {
  // Get palette and dark mode state from theme
  const theme = useTheme();
  const palette = theme.chartPalette.value.all;
  const isDark = theme.isDark.value;
  const surfaceColor =
    theme.getCurrentSurface()?.palette ?? (colors.slate as Record<string, string>);

  // Dark mode colors
  const textColor = isDark ? surfaceColor[100] : surfaceColor[900];
  const subtitleColor = isDark ? surfaceColor[400] : surfaceColor[600];
  const axisColor = isDark ? surfaceColor[400] : surfaceColor[900];
  const axisLabelColor = isDark ? surfaceColor[300] : surfaceColor[600];
  const gridLineColor = isDark ? surfaceColor[700] : surfaceColor[200];
  const crosshairColor = isDark ? surfaceColor[100] : surfaceColor[900];
  const strokeColor = isDark ? surfaceColor[800] : colors.white;

  return {
    baseTheme: isDark ? "ag-material-dark" : "ag-material",
    palette: {
      fills: palette,
      strokes: [strokeColor],
    },
    overrides: {
      common: {
        background: {
          visible: false,
        },
        title: {
          fontSize: 20,
          color: textColor,
        },
        subtitle: {
          color: subtitleColor,
        },
        animation: { enabled: true },
        padding: integrated ? { bottom: 20, top: 20, left: 20, right: 20 } : { bottom: 0, top: 8 },
        legend: {
          position: "bottom",
          spacing: 16,
          item: {
            marker: {
              shape: "circle",
              size: 10,
            },
            label: {
              color: textColor,
            },
          },
        },
        overlays: {
          noData: {
            renderer: () =>
              `<div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px;">
                <span style="color: ${axisColor}; font-size: 14px;">No data available</span>
              </div>`,
          },
          noVisibleSeries: {
            renderer: () =>
              `<div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px;">
                <span style="color: ${axisColor}; font-size: 14px;">No visible series</span>
              </div>`,
          },
        },
        axes: {
          category: {
            title: {
              color: axisColor,
              spacing: 12,
            },
            label: {
              minSpacing: 6,
              color: axisLabelColor,
            },
            line: { enabled: true },
            gridLine: { enabled: false },
          },
          number: {
            title: {
              color: axisColor,
            },
            label: {
              color: axisLabelColor,
              formatter: ({ value }: { value: number }) => formatAmount(value),
            },
            crosshair: {
              stroke: crosshairColor,
              lineDash: [2, 1],
            },
            line: {
              stroke: axisColor,
              enabled: false,
            },
            gridLine: {
              enabled: true,
              style: [
                {
                  stroke: gridLineColor,
                  lineDash: [5, 5],
                },
              ],
            },
          },
        },
      },
      bar: {
        series: {
          label: {
            fontSize: 12,
            fontWeight: 500,
            color: textColor,
            formatter: (params: AgChartLabelFormatterParams<DatumDefault>) =>
              formatAmount(params.value, {
                notation: "compact",
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              }),
          },
          strokeWidth: 1,
          tooltip: { renderer: barChartTooltipRenderer },
          cornerRadius: 6,
        },
        axes: {
          number: {
            crosshair: {
              label: {
                renderer: ({ value }: { value: number }) => formatAmount(value),
              },
            },
          },
          category: {
            label: { autoRotate: false },
            groupPaddingInner: 0.01,
            paddingInner: 0.3,
          },
        },
      },
      line: {
        series: {
          label: {
            fontSize: 12,
            fontWeight: 500,
            color: textColor,
            formatter: (params: AgChartLabelFormatterParams<DatumDefault>) =>
              formatAmount(params.value, {
                notation: "compact",
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              }),
          },
          strokeWidth: 2,
        },
        axes: {
          number: {
            crosshair: {
              label: {
                renderer: ({ value }: { value: number }) => formatAmount(value),
              },
            },
          },
        },
      },
      donut: {
        series: {
          strokes: [strokeColor],
          strokeWidth: 1,
          sectorLabel: {
            enabled: false,
            fontWeight: 600,
            formatter: sectorLabelFormatter,
          },
          tooltip: { renderer: pieTooltipRenderer },
        },
      },
      pie: {
        legend: {
          position: "left",
        },
        series: {
          strokes: [strokeColor],
          strokeWidth: 1,
          sectorLabel: {
            enabled: true,
            fontWeight: 600,
            positionOffset: 8,
            color: isDark ? surfaceColor[900] : surfaceColor[100],
            formatter: sectorLabelFormatter,
          },
          calloutLabel: {
            enabled: false,
            offset: 1,
            color: axisColor,
            minAngle: 30,
          },
          tooltip: { renderer: pieTooltipRenderer },
        },
      },
    },
  };
}

/**
 * Default chart theme instance
 */
export const chartTheme = createChartTheme();
