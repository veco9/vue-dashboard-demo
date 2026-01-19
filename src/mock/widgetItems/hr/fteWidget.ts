import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getDonutData() {
  return [
    { asset: "Engineering", amount: 100432 },
    { asset: "Sales", amount: 20123 },
  ];
}

function getDonutSeries() {
  return [
    {
      type: "donut" as const,
      angleKey: "amount",
      calloutLabelKey: "asset",
      sectorLabelKey: "amount",
      innerRadiusRatio: 0.7,
      calloutLabel: {
        enabled: false,
      },
      innerLabels: [
        {
          text: "80%",
          fontWeight: "bold" as const,
          fontSize: 36,
        },
        {
          text: "160 FTE",
          fontSize: 20,
          spacing: 8,
        },
      ],
    },
  ];
}

export function getFteWidget(i: number): DashboardWidget {
  return {
    layout: { x: 5, y: 3, w: 1, h: 8, i: i, minW: 1, minH: 6, maxH: 8, maxW: 2 },
    type: "donut",
    displayName: t("widgets.titles.fte"),
    initialize: async ({ period }: InitParams) => {
      const data = await mockDataCallback(getDonutData());

      return {
        header: {
          title: t("widgets.titles.fte"),
          subtitleItems: createPeriodSubtitleItems({
            dateFrom: period.dateFrom,
            dateTo: period.dateTo,
          }),
        },
        data: {
          type: "donut",
          data: data,
          series: getDonutSeries(),
          options: {
            tooltip: { enabled: true },
          },
        },
      };
    },
  };
}
