import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { buildLineChartData, type LineDataPoint } from "@/utils/lineChartTransform";
import { mockDataCallback } from "../../../mockData";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getLineChartData(): LineDataPoint[] {
  return [
    { label: "Active", xLabel: "2025-01-01", value: 13 },
    { label: "Graduated", xLabel: "2025-01-01", value: 12 },
    { label: "Pending", xLabel: "2025-01-01", value: 7 },
    { label: "Active", xLabel: "2025-02-01", value: 2 },
    { label: "Graduated", xLabel: "2025-02-01", value: 7 },
    { label: "Pending", xLabel: "2025-02-01", value: 5 },
    { label: "Active", xLabel: "2025-03-01", value: 5 },
    { label: "Graduated", xLabel: "2025-03-01", value: 1 },
    { label: "Pending", xLabel: "2025-03-01", value: 2 },
    { label: "Active", xLabel: "2025-04-01", value: 21 },
    { label: "Graduated", xLabel: "2025-04-01", value: 3 },
    { label: "Pending", xLabel: "2025-04-01", value: 10 },
    { label: "Active", xLabel: "2025-05-01", value: 6 },
    { label: "Graduated", xLabel: "2025-05-01", value: 10 },
    { label: "Pending", xLabel: "2025-05-01", value: 1 },
  ];
}

export function getTotalStudentsPaletteWidget(i: number): DashboardWidget {
  return {
    layout: {
      i: i,
      h: 6,
      w: 2,
      x: -1,
      y: -1,
      isResizable: false,
    },
    type: "line",
    displayName: t("widgets.titles.studentOverview"),
    initialize: async ({ period }: InitParams) => {
      const rawData = await mockDataCallback(getLineChartData());

      const { chartData, series } = buildLineChartData({
        data: rawData,
        compareActive: !!period.compareDateFrom,
        customOptions: {
          tooltipMode: "single",
        },
      });

      return {
        header: {
          title: t("widgets.titles.studentOverview"),
          subtitleItems: createPeriodSubtitleItems(period),
        },
        data: {
          type: "line",
          data: chartData,
          series: series,
        },
      };
    },
  };
}
