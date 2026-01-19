import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import type { AgChartProps } from "@/components/widgets/agchart/AgChart";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import i18n from "@/plugins/i18n";
import type { AgDonutSeriesOptions } from "ag-charts-enterprise";
import { useTheme } from "@/composables/theme";

const t = i18n.global.t;

function getDonutData() {
  return [
    { reason: t("widgets.categories.price"), count: 35, countCompare: 42 },
    { reason: t("widgets.categories.missingFeatures"), count: 28, countCompare: 22 },
    { reason: t("widgets.categories.poorSupport"), count: 18, countCompare: 24 },
    { reason: t("widgets.categories.competitor"), count: 19, countCompare: 12 },
  ];
}

function getDonutSeries(compareActive: boolean): AgDonutSeriesOptions[] {
  if (!compareActive) {
    // Single ring when no comparison
    return [
      {
        type: "donut",
        angleKey: "count",
        calloutLabelKey: "reason",
        sectorLabelKey: "count",
        innerRadiusRatio: 0.7,
        calloutLabel: { enabled: false },
        innerLabels: [
          { text: "100", fontWeight: "bold", fontSize: 24 },
          { text: t("widgets.labels.churned"), fontSize: 12, spacing: 4 },
        ],
      },
    ];
  }

  // Nested rings: outer = current, inner = previous (lighter colors)
  const { chartPalette } = useTheme();

  return [
    {
      type: "donut",
      title: { text: t("widgets.labels.current"), showInLegend: true },
      angleKey: "count",
      calloutLabelKey: "reason",
      outerRadiusRatio: 1.0,
      innerRadiusRatio: 0.7,
      calloutLabel: { enabled: false },
      innerLabels: [
        // { text: "100 vs 100", fontWeight: "bold", fontSize: 18 },
        // { text: t("widgets.labels.churned"), fontSize: 11, spacing: 4 },
      ],
    },
    {
      type: "donut",
      title: { text: t("widgets.labels.previous"), showInLegend: true },
      angleKey: "countCompare",
      calloutLabelKey: "reason",
      outerRadiusRatio: 0.6,
      innerRadiusRatio: 0.3,
      calloutLabel: { enabled: false },
      showInLegend: false,
      fills: chartPalette.value.light,
    },
  ];
}

export function getChurnByReasonWidget(i: number): DashboardWidget<AgChartProps> {
  return {
    layout: {
      x: 8,
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
    breakpointOverrides: { md: { w: 3 }, sm: { w: 4 }, xs: { w: 3 } },
    type: "donut",
    displayName: t("widgets.titles.churnByReason"),
    initialize: async ({ period }: InitParams<AgChartProps>) => {
      const data = await mockDataCallback(getDonutData());
      const compareActive = !!period.compareDateFrom;

      return {
        header: {
          title: t("widgets.titles.churnByReason"),
          subtitleItems: createPeriodSubtitleItems(period),
        },
        data: {
          type: "donut",
          data: data,
          series: getDonutSeries(compareActive),
          options: {
            tooltip: { enabled: true },
            legend: { position: "bottom" },
          },
        },
      };
    },
  };
}
