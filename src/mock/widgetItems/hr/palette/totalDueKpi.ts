import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import { mockDataCallback } from "../../../mockData";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

export function getTotalDueKpiWidget(i: number): DashboardWidget {
  return {
    layout: { x: -1, y: -1, w: 2, h: 3, i: i, isResizable: false },
    type: "kpi",
    displayName: t("widgets.titles.totalDue"),
    initialize: async ({ period }: InitParams) => mockDataCallback({
      header: {
        title: t("widgets.titles.totalDue"),
        subtitleItems: createPeriodSubtitleItems(period),
      },
      data: {
        items: [
          {
            leadingLabel: "Overdue",
            label: 45,
            ...(period.compareDateFrom && { compareLabel: 32 }),
          },
          {
            leadingLabel: "Due Today",
            label: 12,
            ...(period.compareDateFrom && { compareLabel: 8 }),
          },
        ],
      },
    }),
  };
}
