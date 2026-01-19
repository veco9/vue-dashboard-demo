import { ref, type Ref } from "vue";
import type { LayoutItem } from "@/models/layoutItem";
import type {
  DashboardWidget,
  KpiWidgetData,
  WidgetPeriod,
  WidgetState,
} from "@/models/dashboardWidget";
import type { AgChartProps } from "@/components/widgets/agchart/AgChart";
import type { WidgetHeaderProps } from "@/components/widgets/widgetheader/WidgetHeader";

/** Runtime state for a single widget */
interface WidgetRuntime {
  loading: boolean;
  header?: WidgetHeaderProps;
  data?: AgChartProps | KpiWidgetData;
  error?: string | null;
  footer?: string;
}

/**
 * Composable for managing dashboard widgets.
 * Handles widget loading states, data fetching, and widget operations.
 */
export function useWidgetManager({
  gridLayout,
  widgetItems,
  paletteWidgets,
  globalPeriod,
}: {
  gridLayout: Ref<LayoutItem[]>;
  widgetItems: Ref<DashboardWidget[]>;
  paletteWidgets: Ref<DashboardWidget[]>;
  globalPeriod: Ref<WidgetPeriod>;
}) {
  // Runtime state map: widgetId -> WidgetRuntime
  const runtimeState = ref<Map<string | number, WidgetRuntime>>(new Map());
  const widgetParamsMap = ref<Map<string | number, Record<string, unknown>>>(new Map());

  function getRuntime(widgetId: string | number): WidgetRuntime {
    if (!runtimeState.value.has(widgetId)) {
      runtimeState.value.set(widgetId, { loading: true });
    }
    return runtimeState.value.get(widgetId)!;
  }

  function updateRuntime(widgetId: string | number, update: Partial<WidgetRuntime>) {
    const current = getRuntime(widgetId);
    runtimeState.value.set(widgetId, { ...current, ...update });
    // Trigger reactivity
    runtimeState.value = new Map(runtimeState.value);
  }

  function isWidgetLoading(layout: LayoutItem): boolean {
    return getRuntime(layout.i).loading;
  }

  function getWidgetHeader(widgetId: string | number): WidgetHeaderProps | undefined {
    return getRuntime(widgetId).header;
  }

  function getWidgetData(widgetId: string | number): AgChartProps | KpiWidgetData | undefined {
    return getRuntime(widgetId).data;
  }

  function getWidgetError(widgetId: string | number): string | null | undefined {
    return getRuntime(widgetId).error;
  }

  function getWidgetFooter(widgetId: string | number): string | undefined {
    return getRuntime(widgetId).footer;
  }

  function getWidgetByI(i: string | number): DashboardWidget | undefined {
    return widgetItems.value?.find((item) => item.layout.i === i);
  }

  function getWidgetParams(widgetId: string | number): Record<string, unknown> | undefined {
    return widgetParamsMap.value.get(widgetId);
  }

  function setWidgetParam(widgetId: string | number, valueObj: Record<string, unknown>): void {
    const existing = getWidgetParams(widgetId) ?? {};
    widgetParamsMap.value.set(widgetId, { ...existing, ...valueObj });
    widgetParamsMap.value = new Map(widgetParamsMap.value);
  }

  /**
   * Remove widgets that are not in the new layout
   */
  async function removeExcessWidgets(newGridLayout: LayoutItem[]): Promise<void> {
    const newIds = newGridLayout.map((i) => i.i);
    const excessIds = gridLayout.value
      .filter((item) => !newIds.includes(item.i))
      .map((item) => item.i);

    const excessWidgets = widgetItems.value.filter((w) => excessIds.includes(w.layout.i));

    // Cleanup runtime state
    excessWidgets.forEach((w) => runtimeState.value.delete(w.layout.i));

    widgetItems.value = widgetItems.value.filter((w) => !excessIds.includes(w.layout.i));
    paletteWidgets.value.push(...excessWidgets);
  }

  /**
   * Add widgets from palette to dashboard
   */
  async function addAdditionalWidgets(newGridLayout: LayoutItem[]): Promise<void> {
    const currentIds = gridLayout.value.map((i) => i.i);
    const additionalIds = newGridLayout
      .filter((item) => !currentIds.includes(item.i))
      .map((item) => item.i);

    const additionalWidgets = paletteWidgets.value.filter((w) =>
      additionalIds.includes(w.layout.i),
    );

    paletteWidgets.value = paletteWidgets.value.filter((w) => !additionalIds.includes(w.layout.i));
    widgetItems.value.push(...additionalWidgets);
  }

  /**
   * Initialize a widget with data
   */
  async function initializeWidget(widget: DashboardWidget): Promise<void> {
    const widgetId = widget.layout.i;
    updateRuntime(widgetId, { loading: true, error: null });

    try {
      const params = getWidgetParams(widgetId);
      const period = globalPeriod.value;

      // Create callbacks for interactive widgets
      const callbacks = {
        updateData: (newData: Record<string, unknown>) => {
          const current = getRuntime(widgetId).data;
          if (current) {
            updateRuntime(widgetId, { data: { ...current, ...newData } as AgChartProps | KpiWidgetData });
          }
        },
      };

      const result: WidgetState = await widget.initialize({
        period,
        params,
        callbacks,
      });

      updateRuntime(widgetId, {
        loading: false,
        header: result.header,
        data: result.data,
        footer: result.footer,
        error: null,
      });
    } catch (error) {
      updateRuntime(widgetId, {
        loading: false,
        header: undefined,
        data: undefined,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Setup all widgets in parallel
   */
  async function initializeWidgets(): Promise<void> {
    await Promise.allSettled(widgetItems.value.map((widget) => initializeWidget(widget)));
  }

  /**
   * Set error state on a widget (for demo purposes)
   */
  function setWidgetError(widgetId: string | number, error: string | null): void {
    updateRuntime(widgetId, { error, loading: false });
  }

  /**
   * Set loading state on a widget (for demo purposes)
   */
  function setWidgetLoading(widgetId: string | number, loading: boolean): void {
    updateRuntime(widgetId, { loading });
  }

  return {
    // Widget operations
    removeExcessWidgets,
    addAdditionalWidgets,
    initializeWidget,
    initializeWidgets,
    getWidgetByI,
    // Runtime state accessors
    isWidgetLoading,
    getWidgetHeader,
    getWidgetData,
    getWidgetError,
    getWidgetFooter,
    // Params
    getWidgetParams,
    setWidgetParam,
    // Demo
    setWidgetError,
    setWidgetLoading,
  };
}
