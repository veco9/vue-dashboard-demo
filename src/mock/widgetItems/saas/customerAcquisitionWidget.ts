import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import type { AgChartProps } from "@/components/widgets/agchart/AgChart";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getPieData() {
  return [
    { channel: t("widgets.categories.organicSearch"), customers: 450 },
    { channel: t("widgets.categories.paidAds"), customers: 280 },
    { channel: t("widgets.categories.referral"), customers: 180 },
    { channel: t("widgets.categories.direct"), customers: 90 },
  ];
}

function getPieSeries() {
  return [
    {
      type: "pie" as const,
      angleKey: "customers",
      calloutLabelKey: "channel",
      sectorLabelKey: "customers",
      calloutLabel: {
        enabled: false,
      },
    },
  ];
}

export function getCustomerAcquisitionWidget(i: number): DashboardWidget<AgChartProps> {
  return {
    layout: {
      x: 10,
      y: 6,
      w: 2,
      h: 8,
      i: i,
      minW: 2,
      maxW: 8,
      minH: 6,
      maxH: 10,
      responsive: { expandWidthBelow: "xs" },
    },
    breakpointOverrides: { md: { w: 3 }, sm: { w: 5 }, xs: { w: 3 } },
    type: "pie",
    displayName: t("widgets.titles.customerAcquisition"),
    initialize: async ({ period }: InitParams<AgChartProps>) => {
      const data = await mockDataCallback(getPieData());

      return {
        header: {
          title: t("widgets.titles.customerAcquisition"),
          subtitleItems: createPeriodSubtitleItems({
            dateFrom: period.dateFrom,
            dateTo: period.dateTo,
          }),
        },
        data: {
          type: "pie",
          data: data,
          series: getPieSeries(),
          options: {
            tooltip: { enabled: true },
            legend: { position: "bottom" },
          },
        },
      };
    },
  };
}
