import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { createPeriodSubtitleItems, formatAmount, formatCurrency } from "@/utils/formatters";
import { mockDataCallback } from "../../mockData";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

export function getOvertimeKpiWidget(i: number): DashboardWidget {
  return {
    layout: { x: 4, y: 0, w: 2, h: 3, i: i, minH: 3, maxH: 3, minW: 2, isResizable: false },
    type: "kpi",
    displayName: t("widgets.titles.overtime"),
    initialize: async ({ period }: InitParams) => mockDataCallback({
      header: {
        title: t("widgets.titles.overtime"),
        subtitleItems: createPeriodSubtitleItems(period),
      },
      data: {
        items: [
          {
            leadingLabel: "Hours",
            label: formatAmount(7000, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }),
            ...(period.compareDateFrom && {
              compareLabel: formatAmount(6000, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }),
            }),
            growth: false,
            growthLabel: "10%",
            size: "medium",
          },
          {
            leadingLabel: "Cost",
            label: formatCurrency(135000),
            ...(period.compareDateFrom && {
              compareLabel: formatCurrency(145000),
            }),
            growth: false,
            growthLabel: "7%",
            growthCustomIcon: "pi pi-arrow-down",
            size: "medium",
            icon: "pi pi-file",
          },
        ],
      },
    }),
  };
}
