import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import type { AgChartProps } from "@/components/widgets/agchart/AgChart";
import { buildLineChartData, type LineDataPoint } from "@/utils/lineChartTransform";
import { mockDataCallback } from "../../mockData";
import { createPeriodSubtitleItems } from "@/utils/formatters";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

function getLineChartData(): LineDataPoint[] {
  // 30 days of signup data
  return [
    { label: t("widgets.labels.signups"), xLabel: "Dec 1", value: 42, valueCompare: 35 },
    { label: t("widgets.labels.signups"), xLabel: "Dec 5", value: 38, valueCompare: 32 },
    { label: t("widgets.labels.signups"), xLabel: "Dec 10", value: 55, valueCompare: 45 },
    { label: t("widgets.labels.signups"), xLabel: "Dec 15", value: 48, valueCompare: 40 },
    { label: t("widgets.labels.signups"), xLabel: "Dec 20", value: 62, valueCompare: 52 },
    { label: t("widgets.labels.signups"), xLabel: "Dec 25", value: 35, valueCompare: 28 },
    { label: t("widgets.labels.signups"), xLabel: "Dec 30", value: 58, valueCompare: 48 },
  ];
}

export function getSignupTrendWidget(i: number): DashboardWidget<AgChartProps> {
  return {
    layout: {
      x: 4,
      y: 14,
      w: 4,
      h: 8,
      i: i,
      minW: 4,
      minH: 6,
      maxH: 14,
      responsive: {
        expandWidthBelow: "sm",
      },
    },
    breakpointOverrides: { md: { w: 6, h: 12 }, sm: { w: 5, h: 9 } },
    type: "line",
    displayName: t("widgets.titles.signupTrend"),
    initialize: async ({ period }: InitParams<AgChartProps>) => {
      const rawData = await mockDataCallback(getLineChartData());

      const { chartData, series } = buildLineChartData({
        data: rawData,
        compareActive: !!period.compareDateFrom,
        customOptions: {
          yValueLabel: t("widgets.labels.signups"),
          tooltipMode: "single",
          useCustomTooltip: false,
        },
      });

      return {
        header: {
          title: t("widgets.titles.signupTrend"),
          subtitleItems: createPeriodSubtitleItems(period),
        },
        data: {
          type: "line",
          data: chartData,
          series: series,
          xTitle: t("widgets.axes.date"),
          axes: {
            y: {
              max: 80,
              interval: { step: 20 },
              label: {
                formatter: ({ value }: { value: number }) => String(Math.round(value)),
              },
            },
          },
          options: {
            padding: { left: 0, bottom: 0 },
            legend: { enabled: false },
          },
        },
      };
    },
  };
}
