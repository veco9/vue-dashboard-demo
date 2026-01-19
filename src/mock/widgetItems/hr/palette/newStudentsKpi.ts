import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import { mockDataCallback } from "../../../mockData";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

export function getNewStudentsKpiWidget(i: number): DashboardWidget {
  return {
    layout: { x: -1, y: -1, w: 2, h: 3, i: i, isResizable: false },
    type: "kpi",
    displayName: t("widgets.titles.newStudents"),
    initialize: async ({ period }: InitParams) => mockDataCallback({
      header: {
        title: t("widgets.titles.newStudents"),
        subtitleItems: createPeriodSubtitleItems(period),
        growthLabel: "+15%",
        growth: true,
      },
      data: {
        items: [
          {
            leadingLabel: "Enrolled",
            label: 125,
            ...(period.compareDateFrom && { compareLabel: 108 }),
          },
          {
            leadingLabel: "Pending",
            label: 34,
            ...(period.compareDateFrom && { compareLabel: 42 }),
          },
        ],
      },
    }),
  };
}
