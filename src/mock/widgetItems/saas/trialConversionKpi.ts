import type { DashboardWidget, InitParams, KpiWidgetData } from "@/models/dashboardWidget";
import { mockDataCallback } from "../../mockData";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

export function getTrialConversionKpiWidget(i: number): DashboardWidget<KpiWidgetData> {
  return {
    layout: {
      x: 4,
      y: 3,
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
    displayName: t("widgets.titles.trialConversion"),
    initialize: async ({ period }: InitParams<KpiWidgetData>) => {
      const hasCompare = !!period.compareDateFrom;
      return mockDataCallback({
        header: {
          title: "18.5%",
          subtitle: t("widgets.titles.trialConversion"),
          icon: "pi pi-percentage",
          growthLabel: "+2.1%",
          growth: true,
        },
        data: {
          items: [
            {
              leadingLabel: t("widgets.labels.activeTrials"),
              label: "342",
              compareLabel: hasCompare ? "314" : undefined,
              growth: true,
              growthLabel: "+9%",
              size: "small",
            },
            {
              leadingLabel: t("widgets.labels.convertedThisMonth"),
              label: "63",
              compareLabel: hasCompare ? "51" : undefined,
              growth: true,
              growthLabel: "+24%",
              size: "small",
            },
            {
              leadingLabel: t("widgets.labels.expiredTrials"),
              label: "28",
              compareLabel: hasCompare ? "35" : undefined,
              growth: true,
              growthLabel: "-20%",
              size: "small",
            },
          ],
        },
      });
    },
  };
}
