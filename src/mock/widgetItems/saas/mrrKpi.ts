import type { DashboardWidget, InitParams, KpiWidgetData } from "@/models/dashboardWidget";
import { mockDataCallback } from "../../mockData";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

export function getMrrKpiWidget(i: number): DashboardWidget<KpiWidgetData> {
  return {
    layout: {
      x: 0,
      y: 0,
      w: 4,
      h: 3,
      i: i,
      minH: 3,
      maxH: 3,
      minW: 2,
      maxW: 6,
      isResizable: true,
      responsive: {
        expandWidthBelow: "sm",
      },
    },
    breakpointOverrides: { md: { w: 2 } },
    type: "kpi",
    displayName: t("widgets.titles.mrr"),
    initialize: async ({ period }: InitParams<KpiWidgetData>) => {
      const hasCompare = !!period.compareDateFrom;
      return mockDataCallback({
        header: {
          title: "$125,400",
          subtitle: t("widgets.titles.mrr"),
          icon: "pi pi-dollar",
          growthLabel: "+8.2%",
          growth: true,
        },
        data: {
          items: [
            {
              leadingLabel: t("widgets.labels.newMrr"),
              label: "$12,500",
              compareLabel: hasCompare ? "$10,800" : undefined,
              growth: true,
              growthLabel: "+15%",
              size: "small",
            },
            {
              leadingLabel: t("widgets.labels.churnedMrr"),
              label: "$4,200",
              compareLabel: hasCompare ? "$4,500" : undefined,
              growth: true, // Lower churn is good
              growthLabel: "-7%",
              size: "small",
            },
          ],
        },
      });
    },
  };
}
