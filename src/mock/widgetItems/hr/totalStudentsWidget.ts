import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { type BarDataPoint, buildBarChartData } from "@/utils/barChartTransform";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems, formatAmount } from "@/utils/formatters";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getBarChartData(): BarDataPoint[] {
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

export function getTotalStudentsWidget(i: number): DashboardWidget {
  return {
    layout: {
      x: 2,
      y: 3,
      w: 2,
      h: 8,
      i: i,
      minW: 2,
      minH: 6,
      maxH: 10,
    },
    type: "bar",
    displayName: t("widgets.titles.totalStudents"),
    initialize: async ({ period }: InitParams) => {
      const rawData = await mockDataCallback(getBarChartData());

      const { chartData, series } = buildBarChartData({
        data: rawData,
        compareActive: !!period.compareDateFrom,
        customOptions: {
          stackBars: true,
          splitStacks: true,
          showValueLabels: true,
          valueFormatter: (value) => formatAmount(value, { maximumFractionDigits: 0 }),
        },
      });

      return {
        header: {
          title: t("widgets.titles.totalStudents"),
          subtitleItems: createPeriodSubtitleItems(period),
        },
        data: {
          type: "bar",
          data: chartData,
          series: series,
          axes: {
            y: {
              nice: false,
              label: { enabled: false },
              gridLine: { enabled: false },
            },
            x: {
              line: { enabled: true },
            },
          },
          options: {
            padding: { top: 20 },
            legend: { enabled: false },
          },
          prependKpis: {
            items: [
              {
                leadingLabel: "160 FTE",
                label: "80%",
                donut: {
                  values: [160, 40],
                },
              },
              {
                leadingLabel: "136 FTE",
                label: "43%",
                donut: {
                  values: [136, 60],
                  colorIdxOffset: 2,
                },
              },
            ],
          },
        },
      };
    },
  };
}
