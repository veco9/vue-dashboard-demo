import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import type { AgChartProps } from "@/components/widgets/agchart/AgChart";
import { buildLineChartData, type LineDataPoint } from "@/utils/lineChartTransform";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems, formatCurrency } from "@/utils/formatters";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getLineChartData(): LineDataPoint[] {
  return [
    // New MRR (from new customers)
    { label: t("widgets.labels.newMrr"), xLabel: "Jan", value: 8500, valueCompare: 7200 },
    { label: t("widgets.labels.newMrr"), xLabel: "Feb", value: 9200, valueCompare: 7800 },
    { label: t("widgets.labels.newMrr"), xLabel: "Mar", value: 8800, valueCompare: 8100 },
    { label: t("widgets.labels.newMrr"), xLabel: "Apr", value: 10500, valueCompare: 8400 },
    { label: t("widgets.labels.newMrr"), xLabel: "May", value: 11200, valueCompare: 8900 },
    { label: t("widgets.labels.newMrr"), xLabel: "Jun", value: 10800, valueCompare: 9200 },
    { label: t("widgets.labels.newMrr"), xLabel: "Jul", value: 11500, valueCompare: 9800 },
    { label: t("widgets.labels.newMrr"), xLabel: "Aug", value: 12100, valueCompare: 10200 },
    { label: t("widgets.labels.newMrr"), xLabel: "Sep", value: 11800, valueCompare: 10500 },
    { label: t("widgets.labels.newMrr"), xLabel: "Oct", value: 12400, valueCompare: 10800 },
    { label: t("widgets.labels.newMrr"), xLabel: "Nov", value: 12800, valueCompare: 11200 },
    { label: t("widgets.labels.newMrr"), xLabel: "Dec", value: 12500, valueCompare: 11500 },
    // Expansion MRR (from upgrades)
    { label: t("widgets.labels.expansion"), xLabel: "Jan", value: 3200, valueCompare: 2400 },
    { label: t("widgets.labels.expansion"), xLabel: "Feb", value: 3800, valueCompare: 2800 },
    { label: t("widgets.labels.expansion"), xLabel: "Mar", value: 4100, valueCompare: 3100 },
    { label: t("widgets.labels.expansion"), xLabel: "Apr", value: 4500, valueCompare: 3400 },
    { label: t("widgets.labels.expansion"), xLabel: "May", value: 4800, valueCompare: 3600 },
    { label: t("widgets.labels.expansion"), xLabel: "Jun", value: 5200, valueCompare: 3900 },
    { label: t("widgets.labels.expansion"), xLabel: "Jul", value: 5500, valueCompare: 4200 },
    { label: t("widgets.labels.expansion"), xLabel: "Aug", value: 5800, valueCompare: 4500 },
    { label: t("widgets.labels.expansion"), xLabel: "Sep", value: 6100, valueCompare: 4800 },
    { label: t("widgets.labels.expansion"), xLabel: "Oct", value: 6400, valueCompare: 5100 },
    { label: t("widgets.labels.expansion"), xLabel: "Nov", value: 6200, valueCompare: 5400 },
    { label: t("widgets.labels.expansion"), xLabel: "Dec", value: 6500, valueCompare: 5600 },
    // Churned MRR (lost revenue)
    { label: t("widgets.labels.churned"), xLabel: "Jan", value: 2100, valueCompare: 1800 },
    { label: t("widgets.labels.churned"), xLabel: "Feb", value: 2400, valueCompare: 2000 },
    { label: t("widgets.labels.churned"), xLabel: "Mar", value: 2200, valueCompare: 2100 },
    { label: t("widgets.labels.churned"), xLabel: "Apr", value: 2800, valueCompare: 2300 },
    { label: t("widgets.labels.churned"), xLabel: "May", value: 3100, valueCompare: 2500 },
    { label: t("widgets.labels.churned"), xLabel: "Jun", value: 2900, valueCompare: 2600 },
    { label: t("widgets.labels.churned"), xLabel: "Jul", value: 3200, valueCompare: 2800 },
    { label: t("widgets.labels.churned"), xLabel: "Aug", value: 3500, valueCompare: 3000 },
    { label: t("widgets.labels.churned"), xLabel: "Sep", value: 3300, valueCompare: 3100 },
    { label: t("widgets.labels.churned"), xLabel: "Oct", value: 3600, valueCompare: 3200 },
    { label: t("widgets.labels.churned"), xLabel: "Nov", value: 3800, valueCompare: 3400 },
    { label: t("widgets.labels.churned"), xLabel: "Dec", value: 4200, valueCompare: 3500 },
  ];
}

export function getMrrTrendWidget(i: number): DashboardWidget<AgChartProps> {
  return {
    layout: {
      x: 4,
      y: 6,
      w: 4,
      h: 8,
      i: i,
      minW: 4,
      maxW: 12,
      minH: 6,
      maxH: 12,
      responsive: { expandWidthBelow: "md" },
    },
    type: "line",
    displayName: t("widgets.titles.mrrTrend"),
    initialize: async ({ period }: InitParams<AgChartProps>) => {
      const rawData = await mockDataCallback(getLineChartData());

      const { chartData, series } = buildLineChartData({
        data: rawData,
        compareActive: !!period.compareDateFrom,
        customOptions: {
          yValueLabel: t("widgets.axes.revenueUsd"),
          tooltipMode: "single",
          useCustomTooltip: false,
        },
      });

      return {
        header: {
          title: t("widgets.titles.mrrTrend"),
          subtitleItems: createPeriodSubtitleItems(period),
        },
        data: {
          type: "line",
          data: chartData,
          series: series,
          xTitle: t("widgets.axes.month"),
          axes: {
            y: {
              max: 15000,
              interval: { step: 3000 },
              label: {
                formatter: ({ value }: { value: number }) =>
                  formatCurrency(value, { compact: true }),
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
