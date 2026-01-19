import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import type { AgChartProps } from "@/components/widgets/agchart/AgChart";
import { type BarDataPoint, buildBarChartData } from "@/utils/barChartTransform";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems, formatCurrency } from "@/utils/formatters";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getBarChartData(): BarDataPoint[] {
  return [
    {
      xLabel: t("widgets.categories.northAmerica"),
      values: [{ valueLabel: t("widgets.labels.revenue"), value: 52000, valueCompare: 45000 }],
    },
    {
      xLabel: t("widgets.categories.emea"),
      values: [{ valueLabel: t("widgets.labels.revenue"), value: 38000, valueCompare: 32000 }],
    },
    {
      xLabel: t("widgets.categories.apac"),
      values: [{ valueLabel: t("widgets.labels.revenue"), value: 28000, valueCompare: 22000 }],
    },
    {
      xLabel: t("widgets.categories.latam"),
      values: [{ valueLabel: t("widgets.labels.revenue"), value: 7400, valueCompare: 6000 }],
    },
  ];
}

export function getRevenueByRegionWidget(i: number): DashboardWidget<AgChartProps> {
  return {
    layout: {
      x: 8,
      y: 14,
      w: 4,
      h: 8,
      i: i,
      minW: 4,
      minH: 6,
      maxH: 12,
      responsive: {
        expandWidthBelow: "md",
      },
    },
    type: "bar",
    displayName: t("widgets.titles.revenueByRegion"),
    initialize: async ({ period }: InitParams<AgChartProps>) => {
      const rawData = await mockDataCallback(getBarChartData());

      const { chartData, series } = buildBarChartData({
        data: rawData,
        compareActive: !!period.compareDateFrom,
        customOptions: {
          showValueLabels: true,
          colorByCategory: true,
          valueFormatter: (value) => formatCurrency(value, { compact: true }),
        },
      });

      return {
        header: {
          title: t("widgets.titles.revenueByRegion"),
          subtitleItems: createPeriodSubtitleItems(period),
        },
        data: {
          type: "bar",
          data: chartData,
          series: series,
          axes: {
            y: {
              max: 60000,
              interval: { step: 15000 },
              label: {
                formatter: ({ value }: { value: number }) =>
                  formatCurrency(value, { compact: true }),
              },
            },
          },
          options: {
            padding: { top: 20, left: 0 },
            legend: { enabled: false },
          },
          prependKpis: {
            topDivider: true,
            centered: true,
            items: [
              { leadingLabel: t("widgets.categories.na"), label: "420", size: "small" },
              { leadingLabel: t("widgets.categories.emea"), label: "285", size: "small" },
              { leadingLabel: t("widgets.categories.apac"), label: "180", size: "small" },
              { leadingLabel: t("widgets.categories.latam"), label: "30", size: "small" },
            ],
          },
        },
      };
    },
  };
}
