import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import { mockDataCallback } from "../../../mockData";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getDonutData() {
  return [
    { asset: "Full-time", amount: 65 },
    { asset: "Part-time", amount: 25 },
    { asset: "Contract", amount: 10 },
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
          text: "65%",
          fontWeight: "bold" as const,
          fontSize: 24,
        },
        {
          text: "Full-time",
          fontSize: 14,
          spacing: 4,
        },
      ],
    },
  ];
}

export function getNewContractorsDonutWidget(i: number): DashboardWidget {
  return {
    layout: { x: -1, y: -1, w: 1, h: 6, i: i, minW: 1, minH: 6, maxH: 8, maxW: 2 },
    type: "donut",
    displayName: t("widgets.titles.contractorTypes"),
    initialize: async ({ period }: InitParams) => {
      const data = await mockDataCallback(getDonutData());

      return {
        header: {
          title: t("widgets.titles.contractorTypes"),
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
            legend: { position: "bottom" },
          },
        },
      };
    },
  };
}
