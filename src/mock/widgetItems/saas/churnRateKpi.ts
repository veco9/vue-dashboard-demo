import type { DashboardWidget, InitParams, KpiWidgetData } from "@/models/dashboardWidget";
import { mockDataCallback } from "../../mockData";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

export function getChurnRateKpiWidget(i: number): DashboardWidget<KpiWidgetData> {
  return {
    layout: {
      x: 6,
      y: 0,
      w: 4,
      h: 3,
      i: i,
      minW: 2,
      maxW: 6,
      minH: 3,
      maxH: 3,
      responsive: {
        expandWidthBelow: "sm",
      },
    },
    type: "kpi",
    displayName: t("widgets.titles.churnRate"),
    initialize: async ({ period }: InitParams<KpiWidgetData>) => {
      const hasCompare = !!period.compareDateFrom;
      return mockDataCallback({
        header: {
          title: "2.4%",
          subtitle: t("widgets.titles.churnRate"),
          icon: "pi pi-users",
          growthLabel: "-0.3%",
          growth: true, // Improvement (lower churn is good)
        },
        data: {
          items: [
            {
              leadingLabel: t("widgets.labels.churnedCustomers"),
              label: "28",
              compareLabel: hasCompare ? "32" : undefined,
              growth: true,
              growthLabel: "-12%",
              size: "small",
            },
            {
              leadingLabel: t("widgets.labels.atRisk"),
              label: "15",
              compareLabel: hasCompare ? "10" : undefined,
              growth: false,
              growthLabel: "+50%",
              size: "small",
            },
          ],
        },
      });
    },
  };
}
