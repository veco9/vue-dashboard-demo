import type { DashboardWidget, InitParams, KpiWidgetData } from "@/models/dashboardWidget";
import { mockDataCallback } from "../../mockData";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

export function getArrKpiWidget(i: number): DashboardWidget<KpiWidgetData> {
  return {
    layout: {
      x: 3,
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
    displayName: t("widgets.titles.arr"),
    initialize: async ({ period }: InitParams<KpiWidgetData>) => {
      const hasCompare = !!period.compareDateFrom;
      return mockDataCallback({
        header: {
          title: "$1.5M",
          subtitle: t("widgets.titles.arr"),
          icon: "pi pi-chart-line",
          growthLabel: "+12%",
          growth: true,
        },
        data: {
          items: [
            {
              leadingLabel: t("widgets.labels.expansion"),
              label: "$180,000",
              compareLabel: hasCompare ? "$147,500" : undefined,
              growth: true,
              growthLabel: "+22%",
              size: "small",
            },
            {
              leadingLabel: t("widgets.labels.contraction"),
              label: "$45,000",
              compareLabel: hasCompare ? "$49,000" : undefined,
              growth: false,
              growthLabel: "-8%",
              size: "small",
            },
            {
              leadingLabel: t("widgets.labels.newArr"),
              label: "$210,000",
              compareLabel: hasCompare ? "$175,000" : undefined,
              growth: true,
              growthLabel: "+20%",
              size: "small",
            },
          ],
        },
      });
    },
  };
}
