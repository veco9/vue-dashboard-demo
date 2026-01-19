import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { formatAmount, formatCurrency } from "@/utils/formatters";
import { mockDataCallback } from "../../mockData";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

export function getAnnualLeaveKpiWidget(i: number): DashboardWidget {
  return {
    layout: { x: 2, y: 0, w: 2, h: 3, i: i, minH: 3, maxH: 3, minW: 2, isResizable: false },
    type: "kpi",
    displayName: t("widgets.titles.annualLeave"),
    initialize: async ({ period: _period, params: _params }: InitParams) => mockDataCallback({
      header: {
        title: "57%",
        subtitle: t("widgets.titles.annualLeave"),
        icon: "pi pi-id-card",
      },
      data: {
        items: [
          {
            leadingLabel: "Unused Days",
            label: formatAmount(1000, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }),
            subLabel: formatAmount(4000, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }),
            growth: true,
            growthLabel: "300%",
            size: "small",
          },
          {
            leadingLabel: "Cost of Unused PTO",
            label: formatCurrency(95240, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }),
            growth: undefined,
            size: "small",
          },
        ],
      },
    }),
  };
}
