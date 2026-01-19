import type { DashboardWidget, InitParams, KpiWidgetData } from "@/models/dashboardWidget";
import { mockDataCallback } from "../../mockData";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

export function getActiveUsersKpiWidget(i: number): DashboardWidget<KpiWidgetData> {
  return {
    layout: {
      x: 8,
      y: 3,
      w: 2,
      h: 3,
      i: i,
      minW: 2,
      maxW: 4,
      minH: 3,
      maxH: 3,
      responsive: { expandWidthBelow: "xs" },
    },
    breakpointOverrides: { sm: { w: 3 }, xs: { w: 3 } },
    type: "kpi",
    displayName: t("widgets.titles.activeUsers"),
    initialize: async ({ period }: InitParams<KpiWidgetData>) => {
      const hasCompare = !!period.compareDateFrom;
      return mockDataCallback({
        header: {
          title: "8,450",
          subtitle: t("widgets.titles.activeUsers"),
          icon: "pi pi-users",
          growthLabel: "+15.3%",
          growth: true,
        },
        data: {
          items: [
            {
              leadingLabel: t("widgets.labels.dau"),
              label: "8,450",
              compareLabel: hasCompare ? "7,330" : undefined,
              growth: true,
              growthLabel: "+15%",
              size: "small",
            },
            {
              leadingLabel: t("widgets.labels.mau"),
              label: "24,200",
              compareLabel: hasCompare ? "20,500" : undefined,
              growth: true,
              growthLabel: "+18%",
              size: "small",
            },
          ],
        },
      });
    },
  };
}
