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
      xLabel: t("widgets.categories.starter"),
      values: [{ valueLabel: t("widgets.labels.revenue"), value: 25000, valueCompare: 22000 }],
    },
    {
      xLabel: t("widgets.categories.pro"),
      values: [{ valueLabel: t("widgets.labels.revenue"), value: 65000, valueCompare: 58000 }],
    },
    {
      xLabel: t("widgets.categories.enterprise"),
      values: [{ valueLabel: t("widgets.labels.revenue"), value: 35400, valueCompare: 30000 }],
    },
  ];
}

export function getRevenueByPlanWidget(i: number): DashboardWidget<AgChartProps> {
  return {
    layout: {
      x: 0,
      y: 13,
      w: 4,
      h: 9,
      i: i,
      minW: 4,
      minH: 6,
      maxH: 12,
      responsive: {
        expandWidthBelow: "sm",
      },
    },
    breakpointOverrides: { md: { h: 8 } },
    type: "bar",
    displayName: t("widgets.titles.revenueByPlan"),
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
          title: t("widgets.titles.revenueByPlan"),
          subtitleItems: createPeriodSubtitleItems(period),
        },
        data: {
          type: "bar",
          data: chartData,
          series: series,
          axes: {
            y: {
              max: 80000,
              interval: { step: 20000 },
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
              { leadingLabel: t("widgets.categories.starter"), label: "500", size: "small" },
              { leadingLabel: t("widgets.categories.pro"), label: "200", size: "small" },
              { leadingLabel: t("widgets.categories.enterprise"), label: "15", size: "small" },
            ],
          },
        },
      };
    },
  };
}
