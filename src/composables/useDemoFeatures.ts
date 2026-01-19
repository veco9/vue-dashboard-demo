import type { Ref } from "vue";
import type { DashboardWidget } from "@/models/dashboardWidget";
import type { LayoutItem } from "@/models/layoutItem";

export interface DemoFeaturesOptions {
  widgetItems: Ref<DashboardWidget[]>;
  getWidgetError: (layoutId: string | number) => string | null | undefined;
  setWidgetError: (layoutId: string | number, error: string | null) => void;
  isWidgetLoading: (layout: LayoutItem) => boolean;
  setWidgetLoading: (layoutId: string | number, loading: boolean) => void;
}

/**
 * Composable for demo features like simulating error and loading states.
 * Useful for showcasing widget states in portfolio demos.
 */
export function useDemoFeatures(options: DemoFeaturesOptions) {
  const { widgetItems, getWidgetError, setWidgetError, isWidgetLoading, setWidgetLoading } =
    options;

  /**
   * Simulates an error on a random widget.
   * Clears any existing error first (only 1 widget in error at a time).
   */
  function simulateError() {
    // Clear any existing error first
    const erroredWidget = widgetItems.value.find((w) => getWidgetError(w.layout.i));
    if (erroredWidget) {
      setWidgetError(erroredWidget.layout.i, null);
    }

    // Pick from widgets other than the one that just had an error, and exclude loading widgets
    const candidates = widgetItems.value.filter(
      (w) =>
        w.layout.i !== erroredWidget?.layout.i &&
        !isWidgetLoading(w.layout),
    );

    if (candidates.length === 0) return;

    // Set error on random widget
    const randomIndex = Math.floor(Math.random() * candidates.length);
    setWidgetError(candidates[randomIndex].layout.i, "Simulated error for demo purposes");
  }

  /**
   * Simulates loading state on a random widget.
   * Clears any existing loading first (only 1 widget loading at a time).
   */
  function simulateLoading() {
    // Clear any existing loading state first
    const loadingWidget = widgetItems.value.find((w) => isWidgetLoading(w.layout));
    if (loadingWidget) {
      setWidgetLoading(loadingWidget.layout.i, false);
    }

    // Pick from widgets other than the one that was just loading, and exclude errored widgets
    const candidates = widgetItems.value.filter(
      (w) =>
        w.layout.i !== loadingWidget?.layout.i &&
        !getWidgetError(w.layout.i),
    );

    if (candidates.length === 0) return;

    // Set loading on random widget
    const randomIndex = Math.floor(Math.random() * candidates.length);
    setWidgetLoading(candidates[randomIndex].layout.i, true);
  }

  return {
    simulateError,
    simulateLoading,
  };
}
