import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { type BarDataPoint, buildBarChartData } from "@/utils/barChartTransform";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getHorizontalBarData(): BarDataPoint[] {
  return [
    {
      xLabel: "Engineering",
      values: [
        { valueLabel: "Women", value: 60, valueCompare: 23 },
        { valueLabel: "Men", value: 48, valueCompare: 26 },
      ],
    },
    {
      xLabel: "Sales",
      values: [
        { valueLabel: "Women", value: 45, valueCompare: 23 },
        { valueLabel: "Men", value: 40, valueCompare: 26 },
      ],
    },
    {
      xLabel: "Operations",
      values: [
        { valueLabel: "Women", value: 23, valueCompare: 45 },
        { valueLabel: "Men", value: 26, valueCompare: 40 },
      ],
    },
    {
      xLabel: "Product",
      values: [
        { valueLabel: "Women", value: 38, valueCompare: 60 },
        { valueLabel: "Men", value: 34, valueCompare: 48 },
      ],
    },
    {
      xLabel: "Design",
      values: [
        { valueLabel: "Women", value: 34, valueCompare: 38 },
        { valueLabel: "Men", value: 44, valueCompare: 34 },
      ],
    },
  ];
}

export function getTotalEmployeesWidget(i: number): DashboardWidget {
  return {
    layout: { x: 0, y: 9, w: 2, h: 10, i: i, minW: 2, minH: 8, maxH: 12 },
    type: "bar",
    displayName: t("widgets.titles.totalEmployees"),
    initialize: async ({ period }: InitParams) => {
      const rawData = await mockDataCallback(getHorizontalBarData());

      const { chartData, series } = buildBarChartData({
        data: rawData,
        compareActive: !!period.compareDateFrom,
        customOptions: {
          stackBars: true,
          splitStacks: true,
          showValueLabels: false,
        },
        seriesOptions: {
          direction: "horizontal",
        },
      });

      return {
        header: {
          title: t("widgets.titles.totalEmployees"),
          subtitleItems: createPeriodSubtitleItems(period),
        },
        data: {
          type: "bar",
          data: chartData,
          series: series,
          axes: {
            y: {
              line: { enabled: false },
              gridLine: { enabled: false },
            },
            x: {
              crosshair: { enabled: false },
              line: { enabled: false },
              gridLine: { enabled: false },
            },
          },
          options: {
            legend: { enabled: false },
          },
        },
      };
    },
  };
}
