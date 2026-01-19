import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { type BarDataPoint, buildBarChartData } from "@/utils/barChartTransform";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems, formatAmount, formatCurrency } from "@/utils/formatters";
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

export function getEmployeesByDepartmentWidget(i: number): DashboardWidget {
  return {
    layout: {
      x: 0,
      y: 3,
      w: 2,
      h: 8,
      i: i,
      minW: 2,
      maxW: 2,
      minH: 8,
      maxH: 10,
    },
    type: "bar",
    displayName: t("widgets.titles.employeesByDepartment"),
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
          title: t("widgets.titles.employeesByDepartment"),
          subtitleItems: createPeriodSubtitleItems(period),
        },
        data: {
          type: "bar",
          data: chartData,
          series: series,
          axes: {
            y: {
              label: { enabled: false },
              nice: false,
              line: { enabled: false },
              gridLine: { enabled: false },
            },
            x: {
              line: { enabled: false },
              gridLine: { enabled: false },
            },
          },
          options: {
            padding: { top: 20 },
            legend: { enabled: false },
          },
          prependKpis: {
            topDivider: true,
            centered: true,
            items: [
              {
                leadingLabel: "Existing",
                label: formatCurrency(352.32),
                size: "medium",
              },
              {
                leadingLabel: "New",
                label: formatCurrency(52352.32),
                size: "medium",
              },
            ],
          },
        },
      };
    },
  };
}
