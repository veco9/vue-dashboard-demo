import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import { mockDataCallback } from "../../mockData";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

export function getEmployeeTurnoverKpiWidget(i: number): DashboardWidget {
  return {
    layout: { x: 0, y: 0, w: 2, h: 3, i: i, minH: 3, maxH: 3, minW: 2, isResizable: false },
    type: "kpi",
    displayName: t("widgets.titles.employeeTurnover"),
    initialize: async ({ period }: InitParams) => mockDataCallback({
      header: {
        title: t("widgets.titles.employeeTurnover"),
        subtitleItems: createPeriodSubtitleItems(period),
        growthLabel: "+7.5 FTE",
        growth: true,
      },
      data: {
        items: [
          {
            leadingLabel: "New Employees",
            label: 10,
            ...(period.compareDateFrom && { compareLabel: 5 }),
          },
          {
            leadingLabel: "Terminations",
            label: 10,
            ...(period.compareDateFrom && { compareLabel: 5 }),
          },
        ],
      },
    }),
  };
}
