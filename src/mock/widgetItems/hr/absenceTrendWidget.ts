import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { type LineDataPoint, buildLineChartData } from "@/utils/lineChartTransform";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems, dayjsFormatDate } from "@/utils/formatters";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getLineChartData(): LineDataPoint[] {
  return [
    // January
    { label: "Vacation", xLabel: "2025-01-01", value: 13 },
    { label: "Sick Leave", xLabel: "2025-01-01", value: 12 },
    { label: "Personal Leave", xLabel: "2025-01-01", value: 7 },
    // February
    { label: "Vacation", xLabel: "2025-02-01", value: 2 },
    { label: "Sick Leave", xLabel: "2025-02-01", value: 7 },
    { label: "Personal Leave", xLabel: "2025-02-01", value: 5 },
    // March
    { label: "Vacation", xLabel: "2025-03-01", value: 5 },
    { label: "Sick Leave", xLabel: "2025-03-01", value: 1 },
    { label: "Personal Leave", xLabel: "2025-03-01", value: 2 },
    // April
    { label: "Vacation", xLabel: "2025-04-01", value: 21 },
    { label: "Sick Leave", xLabel: "2025-04-01", value: 3 },
    { label: "Personal Leave", xLabel: "2025-04-01", value: 10 },
    // May
    { label: "Vacation", xLabel: "2025-05-01", value: 6 },
    { label: "Sick Leave", xLabel: "2025-05-01", value: 10 },
    { label: "Personal Leave", xLabel: "2025-05-01", value: 1 },
  ];
}

export function getAbsenceTrendWidget(i: number): DashboardWidget {
  return {
    layout: { x: 2, y: 11, w: 2, h: 10, i: i, minW: 2, minH: 8, maxH: 12 },
    type: "line",
    displayName: t("widgets.titles.absenceTrend"),
    initialize: async ({ period }: InitParams) => {
      const rawData = await mockDataCallback(getLineChartData());

      const { chartData, series } = buildLineChartData({
        data: rawData,
        compareActive: !!period.compareDateFrom,
        customOptions: {
          yValueLabel: "Number of Days",
          tooltipMode: "single",
          useCustomTooltip: false,
          categoryTooltipFormatter: (value) => dayjsFormatDate(value, "MMMM YYYY"),
        },
      });

      return {
        header: {
          title: t("widgets.titles.absenceTrend"),
          subtitleItems: createPeriodSubtitleItems(period),
        },
        data: {
          type: "line",
          data: chartData,
          series: series,
          xTitle: "Month",
          yTitle: "Number of Days",
          axes: {
            y: {
              max: 25,
              interval: { step: 5 },
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
