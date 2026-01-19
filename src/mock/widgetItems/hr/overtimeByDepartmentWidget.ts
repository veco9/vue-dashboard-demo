import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getPieChartData() {
  return [
    { asset: "Engineering", amount: 60432 },
    { asset: "Product", amount: 20432 },
    { asset: "Sales", amount: 20123 },
    { asset: "Operations", amount: 15634 },
    { asset: "IT", amount: 52543 },
    { asset: "Design", amount: 33234 },
    // { asset: "Marketing", amount: 10234 },
  ];
}

function getPieSeries() {
  return [
    {
      type: "pie" as const,
      angleKey: "amount",
      calloutLabelKey: "asset",
      sectorLabelKey: "amount",
    },
  ];
}

export function getOvertimeByDepartmentWidget(i: number): DashboardWidget {
  return {
    layout: { x: 4, y: 3, w: 1, h: 8, i: i, minW: 1, minH: 6, maxH: 8, maxW: 2 },
    type: "pie",
    displayName: t("widgets.titles.overtimeByDepartment"),
    initialize: async ({ period }: InitParams) => {
      const data = await mockDataCallback(getPieChartData());

      return {
        header: {
          title: t("widgets.titles.overtimeByDepartment"),
          subtitleItems: createPeriodSubtitleItems({
            dateFrom: period.dateFrom,
            dateTo: period.dateTo,
          }),
        },
        data: {
          type: "pie",
          data: data,
          series: getPieSeries(),
          options: {
            padding: {
              left: 0,
              right: 0,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      };
    },
  };
}
