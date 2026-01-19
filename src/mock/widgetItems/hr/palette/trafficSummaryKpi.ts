import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { createPeriodSubtitleItems, formatCurrency } from "@/utils/formatters";
import { mockDataCallback } from "../../../mockData";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

export function getTrafficSummaryKpiWidget(i: number): DashboardWidget {
  return {
    layout: { x: -1, y: -1, w: 2, h: 3, i: i, isResizable: false },
    type: "kpi",
    displayName: t("widgets.titles.trafficSummary"),
    initialize: async ({ period }: InitParams) => mockDataCallback({
      header: {
        title: t("widgets.titles.trafficSummary"),
        subtitleItems: createPeriodSubtitleItems(period),
        growthLabel: "+12%",
        growth: true,
      },
      data: {
        items: [
          {
            leadingLabel: "Total Visits",
            label: "125,430",
            ...(period.compareDateFrom && { compareLabel: "112,150" }),
          },
          {
            leadingLabel: "Revenue",
            label: formatCurrency(542000),
            ...(period.compareDateFrom && { compareLabel: formatCurrency(485000) }),
          },
        ],
      },
    }),
  };
}
