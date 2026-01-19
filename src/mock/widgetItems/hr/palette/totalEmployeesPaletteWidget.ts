import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { type LineDataPoint, buildLineChartData } from "@/utils/lineChartTransform";
import { mockDataCallback } from "../../../mockData";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getLineChartData(): LineDataPoint[] {
  return [
    { label: "Headcount", xLabel: "2025-01-01", value: 245 },
    { label: "FTE", xLabel: "2025-01-01", value: 230 },
    { label: "Headcount", xLabel: "2025-02-01", value: 252 },
    { label: "FTE", xLabel: "2025-02-01", value: 238 },
    { label: "Headcount", xLabel: "2025-03-01", value: 260 },
    { label: "FTE", xLabel: "2025-03-01", value: 245 },
    { label: "Headcount", xLabel: "2025-04-01", value: 268 },
    { label: "FTE", xLabel: "2025-04-01", value: 255 },
    { label: "Headcount", xLabel: "2025-05-01", value: 275 },
    { label: "FTE", xLabel: "2025-05-01", value: 260 },
  ];
}

export function getTotalEmployeesPaletteWidget(i: number): DashboardWidget {
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
    displayName: t("widgets.titles.employeeOverview"),
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
          title: t("widgets.titles.employeeOverview"),
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
