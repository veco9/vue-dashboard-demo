import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { type BarDataPoint, buildBarChartData } from "@/utils/barChartTransform";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems, formatCurrency } from "@/utils/formatters";
import type { AgAxisLabelFormatterParams } from "ag-charts-enterprise";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getSalariesData(): BarDataPoint[] {
  return [
    {
      xLabel: "MANAGEMENT",
      values: [
        { valueLabel: "Gross (Total)", value: 627978.21, valueCompare: 598432.15 },
        { valueLabel: "Gross Amount", value: 720870.74, valueCompare: 685210.42 },
        { valueLabel: "Net Amount", value: 421391.26, valueCompare: 401254.18 },
      ],
    },
    {
      xLabel: "SALES",
      values: [
        { valueLabel: "Gross (Total)", value: 392222.5, valueCompare: 425680.32 },
        { valueLabel: "Gross Amount", value: 488631.44, valueCompare: 512456.78 },
        { valueLabel: "Net Amount", value: 296581.0, valueCompare: 308742.55 },
      ],
    },
    {
      xLabel: "IT",
      values: [
        { valueLabel: "Gross (Total)", value: 556437.4, valueCompare: 498765.23 },
        { valueLabel: "Gross Amount", value: 699582.19, valueCompare: 642318.94 },
        { valueLabel: "Net Amount", value: 435698.36, valueCompare: 398542.17 },
      ],
    },
  ];
}

export function getSalaresByDepartmentWidget(i: number): DashboardWidget {
  return {
    layout: { x: 0, y: 9, w: 2, h: 10, i: i, minW: 2, minH: 8, maxH: 14 },
    type: "bar",
    displayName: t("widgets.titles.salariesByDepartment"),
    initialize: async ({ period }: InitParams) => {
      const rawData = await mockDataCallback(getSalariesData());

      const { chartData, series } = buildBarChartData({
        data: rawData,
        compareActive: !!period.compareDateFrom,
        customOptions: {
          tooltipMode: "shared",
          tooltipValueFormatter: formatCurrency,
          floatingCategoryLabels: true,
        },
        seriesOptions: {
          direction: "horizontal",
          label: { enabled: false },
          tooltip: { range: 20 },
        },
      });

      return {
        header: {
          title: t("widgets.titles.salariesByDepartment"),
          subtitleItems: createPeriodSubtitleItems(period),
        },
        data: {
          type: "bar",
          data: chartData,
          series: series,
          axes: {
            y: {
              label: {
                formatter: (params: AgAxisLabelFormatterParams) => formatCurrency(params.value),
              },
              gridLine: {
                enabled: true,
                style: [{ lineDash: [0, 0] }],
              },
              crosshair: { enabled: false },
            },
            x: {
              label: { enabled: false },
              line: { enabled: false },
              gridLine: { enabled: false },
              crosshair: { enabled: false },
            },
          },
          options: {
            padding: {
              top: 4,
              left: 10,
              right: 32,
            },
            legend: { enabled: true },
          },
        },
      };
    },
  };
}
