import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import { mockDataCallback } from "../../../mockData";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

export function getStudentTurnoverKpiWidget(i: number): DashboardWidget {
  return {
    layout: { x: -1, y: -1, w: 2, h: 3, i: i, isResizable: false },
    type: "kpi",
    displayName: t("widgets.titles.studentTurnover"),
    initialize: async ({ period }: InitParams) => mockDataCallback({
      header: {
        title: t("widgets.titles.studentTurnover"),
        subtitleItems: createPeriodSubtitleItems(period),
        growthLabel: "-3%",
        growth: false,
      },
      data: {
        items: [
          {
            leadingLabel: "Graduated",
            label: 45,
            ...(period.compareDateFrom && { compareLabel: 38 }),
          },
          {
            leadingLabel: "Withdrawn",
            label: 12,
            ...(period.compareDateFrom && { compareLabel: 15 }),
          },
        ],
      },
    }),
  };
}
