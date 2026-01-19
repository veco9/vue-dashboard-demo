import type { Breakpoint, LayoutItem } from "@/models/layoutItem";

const STORAGE_KEY = "dashboard-layout-v2";

interface PersistedLayout {
  /** Layouts for each breakpoint (user's actual sizing per breakpoint) */
  breakpointLayouts: Record<string, LayoutItem[]>;
  /** The breakpoint for which the layout was originally designed */
  designBreakpoint: Breakpoint;
  dashboardWidgetIds: (string | number)[];
  paletteWidgetIds: (string | number)[];
}

/**
 * Serialize a layout item for storage, preserving all relevant properties.
 */
function serializeLayoutItem(item: LayoutItem): LayoutItem {
  return {
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: item.minW,
    maxW: item.maxW,
    minH: item.minH,
    maxH: item.maxH,
    isResizable: item.isResizable,
    preventResizeH: item.preventResizeH,
    preventResizeW: item.preventResizeW,
    responsive: item.responsive,
  };
}

export function useLayoutPersistence() {
  function saveLayout(
    breakpointLayouts: Record<string, LayoutItem[]>,
    designBreakpoint: Breakpoint,
    dashboardWidgetIds: (string | number)[],
    paletteWidgetIds: (string | number)[],
  ): void {
    // Serialize all breakpoint layouts
    const serializedLayouts: Record<string, LayoutItem[]> = {};
    for (const [bp, layout] of Object.entries(breakpointLayouts)) {
      serializedLayouts[bp] = layout.map(serializeLayoutItem);
    }

    const data: PersistedLayout = {
      breakpointLayouts: serializedLayouts,
      designBreakpoint,
      dashboardWidgetIds: [...dashboardWidgetIds],
      paletteWidgetIds: [...paletteWidgetIds],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadLayout(): PersistedLayout | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      const data = JSON.parse(stored);
      // Handle v1 format (single gridLayout) by returning null to trigger fresh load
      if (data.gridLayout && !data.breakpointLayouts) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return data as PersistedLayout;
    } catch {
      return null;
    }
  }

  function clearLayout(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  function hasStoredLayout(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  return {
    saveLayout,
    loadLayout,
    clearLayout,
    hasStoredLayout,
  };
}
