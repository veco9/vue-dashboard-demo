import type { DashboardWidget, InitParams, KpiWidgetData } from "@/models/dashboardWidget";
import { mockDataCallback } from "../../mockData";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

export function getNrrKpiWidget(i: number): DashboardWidget<KpiWidgetData> {
  return {
    layout: {
      x: 9,
      y: 0,
      w: 2,
      h: 3,
      i: i,
      minW: 2,
      maxW: 4,
      minH: 3,
      maxH: 3,
      responsive: { expandWidthBelow: "xs" },
    },
    breakpointOverrides: {
      xs: { w: 3 },
    },
    type: "kpi",
    displayName: t("widgets.titles.nrr"),
    initialize: async ({ period }: InitParams<KpiWidgetData>) => {
      const hasCompare = !!period.compareDateFrom;
      return mockDataCallback({
        header: {
          title: "112%",
          subtitle: t("widgets.titles.nrr"),
          icon: "pi pi-chart-line",
          growthLabel: "+4%",
          growth: true,
        },
        data: {
          items: [
            {
              leadingLabel: t("widgets.labels.expansionRevenue"),
              label: "$18,000",
              compareLabel: hasCompare ? "$14,500" : undefined,
              growth: true,
              growthLabel: "+24%",
              size: "small",
            },
            // {
            //   leadingLabel: t("widgets.labels.contraction"),
            //   label: "$3,200",
            //   compareLabel: hasCompare ? "$2,800" : undefined,
            //   growth: false,
            //   growthLabel: "+14%",
            //   size: "small",
            // },
          ],
        },
      });
    },
  };
}
