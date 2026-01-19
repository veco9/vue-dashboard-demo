import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import type { AgChartProps } from "@/components/widgets/agchart/AgChart";
import { type BarDataPoint, buildBarChartData } from "@/utils/barChartTransform";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getBarChartData(): BarDataPoint[] {
  return [
    {
      xLabel: t("widgets.categories.dashboard"),
      values: [{ valueLabel: t("widgets.labels.usage"), value: 92, valueCompare: 85 }],
    },
    {
      xLabel: t("widgets.categories.reports"),
      values: [{ valueLabel: t("widgets.labels.usage"), value: 78, valueCompare: 72 }],
    },
    {
      xLabel: t("widgets.categories.integrations"),
      values: [{ valueLabel: t("widgets.labels.usage"), value: 65, valueCompare: 58 }],
    },
    {
      xLabel: t("widgets.categories.apiAccess"),
      values: [{ valueLabel: t("widgets.labels.usage"), value: 45, valueCompare: 38 }],
    },
    {
      xLabel: t("widgets.categories.automations"),
      values: [{ valueLabel: t("widgets.labels.usage"), value: 34, valueCompare: 25 }],
    },
  ];
}

export function getFeatureAdoptionWidget(i: number): DashboardWidget<AgChartProps> {
  return {
    layout: {
      x: 0,
      y: 3,
      w: 4,
      h: 10,
      i: i,
      minW: 3,
      minH: 6,
      maxH: 12,
      responsive: {
        expandWidthBelow: "sm",
      },
    },
    breakpointOverrides: { md: { w: 6 }, sm: { w: 5, h: 9 } },
    type: "horizontalBar",
    displayName: t("widgets.titles.featureAdoption"),
    initialize: async ({ period }: InitParams<AgChartProps>) => {
      const rawData = await mockDataCallback(getBarChartData());

      const { chartData, series } = buildBarChartData({
        data: rawData,
        compareActive: !!period.compareDateFrom,
        customOptions: {
          showValueLabels: true,
          floatingCategoryLabels: true,
          valueFormatter: (value) => `${value}%`,
        },
        seriesOptions: {
          direction: "horizontal",
        },
      });

      return {
        header: {
          title: t("widgets.titles.featureAdoption"),
          subtitleItems: createPeriodSubtitleItems(period, Boolean(period.compareDateFrom)),
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
              line: { enabled: false },
              gridLine: { enabled: true },
              interval: { step: 25 },
              max: 100,
            },
          },
          options: {
            padding: { top: 10, left: 10 },
            legend: { enabled: false },
          },
        },
      };
    },
  };
}
