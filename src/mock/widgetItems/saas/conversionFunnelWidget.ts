import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import type { AgChartProps } from "@/components/widgets/agchart/AgChart";
import { type BarDataPoint, buildBarChartData } from "@/utils/barChartTransform";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems, formatAmount } from "@/utils/formatters";
import i18n from "@/plugins/i18n";
import type { AgCartesianAxesOptions } from "ag-charts-enterprise";

const t = i18n.global.t;

function getFunnelData(hasCompare: boolean): BarDataPoint[] {
  return [
    { xLabel: t("widgets.categories.visitors"), values: [{ valueLabel: t("widgets.labels.count"), value: 10000, valueCompare: hasCompare ? 8500 : undefined }] },
    { xLabel: t("widgets.labels.signups"), values: [{ valueLabel: t("widgets.labels.count"), value: 2500, valueCompare: hasCompare ? 2100 : undefined }] },
    { xLabel: t("widgets.categories.activated"), values: [{ valueLabel: t("widgets.labels.count"), value: 1200, valueCompare: hasCompare ? 950 : undefined }] },
    { xLabel: t("widgets.categories.trial"), values: [{ valueLabel: t("widgets.labels.count"), value: 800, valueCompare: hasCompare ? 620 : undefined }] },
    { xLabel: t("widgets.categories.paid"), values: [{ valueLabel: t("widgets.labels.count"), value: 342, valueCompare: hasCompare ? 280 : undefined }] },
  ];
}

export function getConversionFunnelWidget(i: number): DashboardWidget<AgChartProps> {
  return {
    layout: { x: 0, y: 0, w: 4, h: 8, i: i, minW: 2, minH: 8, maxH: 14 },
    type: "horizontalBar",
    displayName: t("widgets.titles.conversionFunnel"),
    initialize: async ({ period }: InitParams<AgChartProps>) => {
      const hasCompare = !!period.compareDateFrom;
      const rawData = await mockDataCallback(getFunnelData(hasCompare));

      const { chartData, series } = buildBarChartData({
        data: rawData,
        compareActive: hasCompare,
        seriesOptions: {
          direction: "horizontal",
        },
        customOptions: {
          floatingCategoryLabels: true,
          showValueLabels: true,
          valueFormatter: (value) => formatAmount(value, { notation: "compact" }),
        },
      });

      return {
        header: {
          title: t("widgets.titles.conversionFunnel"),
          subtitleItems: createPeriodSubtitleItems(period),
        },
        data: {
          type: "bar",
          data: chartData,
          series: series,
          axes: {
            x: {
              label: { enabled: false },
              line: { enabled: false },
            },
            y: {
              label: { enabled: false },
              gridLine: { enabled: true },
              line: { enabled: true },
            },
          } as AgCartesianAxesOptions,
          options: {
            padding: { left: 0, bottom: 0, right: 60 },
            legend: { enabled: false },
          },
        },
      };
    },
  };
}
