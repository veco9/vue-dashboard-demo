import { computed, nextTick, ref, type Ref } from "vue";
import type { Breakpoints, Layout } from "grid-layout-plus";
import type { Breakpoint, DashboardLayoutConfig, LayoutItem } from "@/models/layoutItem";
import type { DashboardWidget } from "@/models/dashboardWidget";
import {
  deepCopyLayout,
  type FitLayoutOptions,
  fitLayoutToColumns,
  getBreakpointOrder,
} from "@/utils/layoutUtils"; // Default grid configuration

// Default grid configuration
const DEFAULT_COLUMN_COUNT = 12;
const DEFAULT_CELL_HEIGHT = 40;
const DEFAULT_GRID_GAP: [number, number] = [16, 16];
const DEFAULT_BREAKPOINTS: Breakpoints = {
  lg: 1820,
  md: 1400,
  sm: 1180,
  xs: 800,
  xxs: 5,
};

function createColumnConfig(columnCount: number): Breakpoints {
  return {
    lg: columnCount,
    md: 10,
    sm: 9,
    xs: 6,
    xxs: 3,
  };
}

/**
 * Composable for managing responsive dashboard grid layout.
 * Handles breakpoint changes and layout recalculations.
 */
export function useGridLayout(
  gridLayout: Ref<LayoutItem[]>,
  widgetsRef: Ref<DashboardWidget[]>,
  config?: DashboardLayoutConfig,
) {
  const defaultColumnCount = config?.columnCount ?? DEFAULT_COLUMN_COUNT;
  const columnConfig: Breakpoints = config?.cols ?? createColumnConfig(defaultColumnCount);
  const breakpointConfig: Breakpoints = config?.breakpoints ?? DEFAULT_BREAKPOINTS;
  const cellHeight = config?.rowHeight ?? DEFAULT_CELL_HEIGHT;
  const gridGap = config?.margin ?? DEFAULT_GRID_GAP;
  const designBreakpoint = config?.designBreakpoint ?? "lg";

  const activeBreakpoint = ref<Breakpoint>(designBreakpoint);
  const activeColumnCount = computed(() => columnConfig[activeBreakpoint.value]);
  const isMobileBreakpoint = computed(() => activeBreakpoint.value === "xs" || activeBreakpoint.value === "xxs");

  // Track if we've received the first breakpoint-changed event from GridLayout.
  // Until then, rebuildBreakpointLayouts should be a no-op to prevent corruption.
  let isBreakpointInitialized = false;

  // Store layouts per breakpoint independently to avoid losing edits when switching
  const storedLayouts = new Map<Breakpoint, Layout>();

  const breakpointOrder = getBreakpointOrder(breakpointConfig);

  /**
   * Build a map of widget ID to breakpoint overrides for quick lookup.
   */
  function getWidgetOverridesMap(): Map<number | string, DashboardWidget["breakpointOverrides"]> {
    const map = new Map<number | string, DashboardWidget["breakpointOverrides"]>();
    for (const widget of widgetsRef.value) {
      if (widget.breakpointOverrides) {
        map.set(widget.layout.i, widget.breakpointOverrides);
      }
    }
    return map;
  }

  /**
   * Get options for fitLayoutToColumns with current widget overrides.
   */
  function getFitOptions(): FitLayoutOptions {
    return {
      overridesMap: getWidgetOverridesMap(),
      breakpointOrder,
    };
  }

  /**
   * Build layouts for all breakpoints from a source layout.
   * @param sourceBreakpoint - The breakpoint the source layout is designed for
   * @param sourceLayout - Optional explicit layout data; defaults to gridLayout.value
   */
  function buildAllBreakpointLayouts(
    sourceBreakpoint: Breakpoint,
    sourceLayout?: Layout,
  ): Record<string, Layout> {
    const layouts: Record<string, Layout> = {};
    const source = sourceLayout ?? gridLayout.value;
    const fitOptions = getFitOptions();

    // Store source layout as a deep copy
    const sourceLayoutCopy = deepCopyLayout(source);
    storedLayouts.set(sourceBreakpoint, sourceLayoutCopy);
    layouts[sourceBreakpoint] = sourceLayoutCopy;

    // Fit to other breakpoints (derive from source)
    for (const bp of breakpointOrder) {
      if (bp === sourceBreakpoint) continue;

      const fitted = fitLayoutToColumns(source, columnConfig[bp], bp, fitOptions);
      storedLayouts.set(bp, fitted);
      layouts[bp] = fitted;
    }

    return layouts;
  }

  const breakpointLayouts = ref(buildAllBreakpointLayouts(activeBreakpoint.value));

  /**
   * Rebuild breakpoint layouts after a change at the current breakpoint.
   * Preserves layouts for larger breakpoints and refits smaller ones.
   */
  function rebuildBreakpointLayouts(sourceBreakpoint = activeBreakpoint.value) {
    // Skip until GridLayout reports the actual breakpoint
    if (!isBreakpointInitialized) return;

    const sourceIndex = breakpointOrder.indexOf(sourceBreakpoint);
    const sourceLayoutCopy = deepCopyLayout(gridLayout.value);
    storedLayouts.set(sourceBreakpoint, sourceLayoutCopy);

    const layouts: Record<string, Layout> = {};
    const fitOptions = getFitOptions();

    for (let i = 0; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];

      if (i < sourceIndex) {
        // Larger breakpoints: keep stored layout
        layouts[bp] =
          storedLayouts.get(bp) ??
          fitLayoutToColumns(gridLayout.value, columnConfig[bp], bp, fitOptions);
      } else if (bp === sourceBreakpoint) {
        layouts[bp] = sourceLayoutCopy;
      } else {
        // Smaller breakpoints: refit from source
        const fitted = fitLayoutToColumns(gridLayout.value, columnConfig[bp], bp, fitOptions);
        storedLayouts.set(bp, fitted);
        layouts[bp] = fitted;
      }
    }

    breakpointLayouts.value = layouts;
  }

  /**
   * Reinitialize all breakpoint layouts from the current gridLayout.
   * Use this when resetting the dashboard.
   */
  function reinitializeLayouts(sourceBreakpoint: Breakpoint) {
    storedLayouts.clear();
    breakpointLayouts.value = buildAllBreakpointLayouts(sourceBreakpoint);
  }

  /**
   * Restore breakpoint layouts directly from saved data.
   * Preserves user customizations at all breakpoints without re-fitting.
   * @param savedLayouts - Layouts for each breakpoint as saved to localStorage
   * @param widgetIds - Widget IDs to filter layouts (in case widgets were removed)
   */
  function restoreBreakpointLayouts(
    savedLayouts: Record<string, Layout>,
    widgetIds: Set<string | number>,
  ) {
    storedLayouts.clear();
    const layouts: Record<string, Layout> = {};

    for (const bp of breakpointOrder) {
      const saved = savedLayouts[bp];
      if (saved) {
        // Filter to only include widgets that still exist, and deep copy
        const filtered = saved.filter((item) => widgetIds.has(item.i)).map((item) => ({ ...item }));
        storedLayouts.set(bp, filtered);
        layouts[bp] = filtered;
      }
    }

    breakpointLayouts.value = layouts;
  }

  /**
   * Handle breakpoint change event from GridLayout.
   */
  function handleBreakpointChange(newBreakpoint: Breakpoint, _newLayout: Layout) {
    isBreakpointInitialized = true;
    activeBreakpoint.value = newBreakpoint;

    nextTick(() => {
      gridLayout.value = breakpointLayouts.value[newBreakpoint];
    });
  }

  return {
    breakpointLayouts,
    columnConfig,
    breakpointConfig,
    cellHeight,
    defaultColumnCount,
    gridGap,
    handleBreakpointChange,
    rebuildBreakpointLayouts,
    reinitializeLayouts,
    restoreBreakpointLayouts,
    activeBreakpoint,
    activeColumnCount,
    isMobileBreakpoint,
  };
}
