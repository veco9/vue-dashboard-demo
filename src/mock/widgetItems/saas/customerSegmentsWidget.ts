import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import type { AgChartProps } from "@/components/widgets/agchart/AgChart";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import i18n from "@/plugins/i18n";
import type { AgDonutSeriesOptions } from "ag-charts-enterprise";

const t = i18n.global.t;

function getDonutData() {
  return [
    { segment: t("widgets.categories.smb"), count: 450, revenue: 45000 },
    { segment: t("widgets.categories.midMarket"), count: 120, revenue: 96000 },
    { segment: t("widgets.categories.enterprise"), count: 30, revenue: 150000 },
  ];
}

function getDonutSeries(): AgDonutSeriesOptions[] {
  return [
    {
      type: "donut" as const,
      angleKey: "count",
      calloutLabelKey: "segment",
      sectorLabelKey: "count",
      innerRadiusRatio: 0.7,
      calloutLabel: {
        enabled: false,
      },
      innerLabels: [
        {
          text: "600",
          fontWeight: "bold" as const,
          fontSize: 24,
        },
        {
          text: t("widgets.labels.customers"),
          fontSize: 12,
          spacing: 4,
        },
      ],
    },
  ];
}

export function getCustomerSegmentsWidget(i: number): DashboardWidget<AgChartProps> {
  return {
    layout: {
      x: 0,
      y: 0,
      w: 2,
      h: 8,
      i: i,
      minW: 2,
      minH: 6,
      maxH: 10,
      maxW: 8,
      responsive: {
        expandWidthBelow: "sm",
      },
    },
    type: "donut",
    displayName: t("widgets.titles.customerSegments"),
    initialize: async ({ period }: InitParams<AgChartProps>) => {
      const data = await mockDataCallback(getDonutData());

      return {
        header: {
          title: t("widgets.titles.customerSegments"),
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
