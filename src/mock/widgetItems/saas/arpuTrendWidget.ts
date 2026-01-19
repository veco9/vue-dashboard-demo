import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import type { AgChartProps } from "@/components/widgets/agchart/AgChart";
import { buildLineChartData, type LineDataPoint } from "@/utils/lineChartTransform";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems, formatCurrency } from "@/utils/formatters";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getArpuData(): LineDataPoint[] {
  return [
    { label: t("widgets.labels.arpu"), xLabel: "Jan", value: 85, valueCompare: 72 },
    { label: t("widgets.labels.arpu"), xLabel: "Feb", value: 88, valueCompare: 74 },
    { label: t("widgets.labels.arpu"), xLabel: "Mar", value: 92, valueCompare: 78 },
    { label: t("widgets.labels.arpu"), xLabel: "Apr", value: 89, valueCompare: 80 },
    { label: t("widgets.labels.arpu"), xLabel: "May", value: 95, valueCompare: 82 },
    { label: t("widgets.labels.arpu"), xLabel: "Jun", value: 98, valueCompare: 85 },
    { label: t("widgets.labels.arpu"), xLabel: "Jul", value: 102, valueCompare: 88 },
    { label: t("widgets.labels.arpu"), xLabel: "Aug", value: 105, valueCompare: 90 },
    { label: t("widgets.labels.arpu"), xLabel: "Sep", value: 108, valueCompare: 92 },
    { label: t("widgets.labels.arpu"), xLabel: "Oct", value: 112, valueCompare: 95 },
    { label: t("widgets.labels.arpu"), xLabel: "Nov", value: 115, valueCompare: 98 },
    { label: t("widgets.labels.arpu"), xLabel: "Dec", value: 118, valueCompare: 100 },
  ];
}

export function getArpuTrendWidget(i: number): DashboardWidget<AgChartProps> {
  return {
    layout: { x: 0, y: 0, w: 4, h: 8, i: i, minW: 4, minH: 6, maxH: 10 },
    type: "line",
    displayName: t("widgets.titles.arpuTrend"),
    initialize: async ({ period }: InitParams<AgChartProps>) => {
      const rawData = await mockDataCallback(getArpuData());

      const { chartData, series } = buildLineChartData({
        data: rawData,
        compareActive: !!period.compareDateFrom,
        customOptions: {
          yValueLabel: t("widgets.axes.arpuUsd"),
          tooltipMode: "single",
          useCustomTooltip: false,
        },
      });

      return {
        header: {
          title: t("widgets.titles.arpuTrend"),
          subtitleItems: createPeriodSubtitleItems(period),
        },
        data: {
          type: "line",
          data: chartData,
          series: series,
          xTitle: t("widgets.axes.month"),
          axes: {
            y: {
              max: 150,
              interval: { step: 30 },
              label: {
                formatter: ({ value }: { value: number }) =>
                  formatCurrency(value, { maximumFractionDigits: 0 }),
              },
            },
          },
          options: {
            padding: { left: 0, bottom: 0 },
            legend: { position: "bottom" },
          },
        },
      };
    },
  };
}
