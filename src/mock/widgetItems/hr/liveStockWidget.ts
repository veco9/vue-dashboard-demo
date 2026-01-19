import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";
import type { AgChartProps } from "@/components/widgets/agchart/AgChart";
import { type BarDataPoint, buildBarChartData } from "@/utils/barChartTransform";
import { mockDataCallback } from "../../mockData";
import i18n from "@/plugins/i18n";

const t = i18n.global.t;

// Type for our custom data
interface LiveStockCustomData {
  intervalId: ReturnType<typeof setInterval>;
}

// Type guard for custom data
function hasIntervalId(data: unknown): data is LiveStockCustomData {
  return data !== null && typeof data === "object" && "intervalId" in data;
}

// Stock symbols and their base prices
const STOCKS = [
  { symbol: "AAPL", name: "Apple", basePrice: 285 },
  { symbol: "GOOGL", name: "Google", basePrice: 142 },
  { symbol: "MSFT", name: "Microsoft", basePrice: 378 },
  { symbol: "AMZN", name: "Amazon", basePrice: 178 },
  { symbol: "NVDA", name: "NVIDIA", basePrice: 475 },
];

// Generate random price change (-5% to +5%)
function randomPriceChange(basePrice: number): number {
  const change = (Math.random() - 0.5) * 0.1 * basePrice;
  return Math.round((basePrice + change) * 100) / 100;
}

// Generate current stock data
function generateStockData(): BarDataPoint[] {
  return STOCKS.map((stock) => ({
    xLabel: stock.name,
    values: [
      {
        valueLabel: "Price",
        value: randomPriceChange(stock.basePrice),
      },
    ],
  }));
}

// Transform data for the chart
function transformStockData(data: BarDataPoint[]) {
  return buildBarChartData({
    data,
    compareActive: false,
    customOptions: {
      colorByCategory: true,
      showValueLabels: false,
      valueFormatter: (value) => `$${value}`,
    },
  });
}

export function getLiveStockWidget(i: number): DashboardWidget {
  // Create widget object - we'll reference this in the closure
  const widget: DashboardWidget = {
    layout: {
      x: 0,
      y: 0,
      w: 2,
      h: 8,
      i: i,
      minW: 2,
      maxW: 4,
      minH: 6,
      maxH: 12,
    },
    type: "bar",
    displayName: t("widgets.titles.liveStockPrices"),
    custom: null as LiveStockCustomData | null,
    initialize: async ({ period: _period, params: _params, callbacks }: InitParams<AgChartProps>) => {
      // Clear any existing interval (e.g., from previous setup)
      if (hasIntervalId(widget.custom)) {
        clearInterval(widget.custom.intervalId);
      }

      // Generate initial data with simulated API delay
      const initialData = await mockDataCallback(generateStockData());
      const { chartData, series } = transformStockData(initialData);

      // Set up interval for real-time updates (every 1.5 seconds)
      const intervalId = setInterval(() => {
        // Use the callback to update data reactively
        if (callbacks?.updateData) {
          const newData = generateStockData();
          const { chartData: newChartData, series: newSeries } = transformStockData(newData);

          // Update via callback - this ensures Vue reactivity works
          callbacks.updateData({
            data: newChartData,
            series: newSeries,
          });
        }
      }, 500);

      // Store interval ID for cleanup
      widget.custom = { intervalId };

      return {
        header: {
          title: t("widgets.titles.liveStockPrices"),
          subtitle: t("widgets.subtitles.updatesAutomatically"),
        },
        data: {
          type: "bar",
          data: chartData,
          series: series,
          options: {
            legend: { enabled: false },
            padding: { top: 20 },
          },
          axes: {
            y: {
              label: {
                formatter: ({ value }: { value: number }) => `$${value}`,
              },
            },
          },
        },
      };
    },
  };

  return widget;
}

/**
 * Call this to clean up the widget's interval when removing from dashboard.
 * Should be called when widget is moved back to palette or removed.
 */
export function cleanupLiveStockWidget(widget: DashboardWidget): void {
  if (hasIntervalId(widget.custom)) {
    clearInterval(widget.custom.intervalId);
    widget.custom = null;
  }
}
