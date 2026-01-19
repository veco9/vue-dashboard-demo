import type { Breakpoints, Layout } from "grid-layout-plus";
import type { Breakpoint, LayoutItem, ResponsiveLayoutRules } from "@/models/layoutItem";
import type { DashboardWidget } from "@/models/dashboardWidget";

/**
 * Creates a deep copy of a layout array to avoid reference issues.
 */
export function deepCopyLayout(layout: Layout): Layout {
  return layout.map((item) => ({ ...item }));
}

/**
 * Returns breakpoints ordered from largest to smallest based on pixel values.
 */
export function getBreakpointOrder(breakpointConfig: Breakpoints): Breakpoint[] {
  return (Object.entries(breakpointConfig) as [Breakpoint, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([bp]) => bp);
}

/**
 * Check if targetBp is below (smaller than) thresholdBp in the breakpoint order.
 */
export function isBreakpointBelow(
  targetBp: Breakpoint,
  thresholdBp: Breakpoint,
  breakpointOrder: Breakpoint[],
): boolean {
  return breakpointOrder.indexOf(targetBp) > breakpointOrder.indexOf(thresholdBp);
}

export interface FitLayoutOptions {
  /** Map of widget ID to breakpoint overrides */
  overridesMap?: Map<number | string, DashboardWidget["breakpointOverrides"]>;
  /** Breakpoint order from largest to smallest */
  breakpointOrder?: Breakpoint[];
}

/**
 * Reposition layout items to fit within a specific column count using bin-packing.
 * Applies breakpoint overrides and responsive rules before bin-packing.
 *
 * Resolution order:
 * 1. Explicit breakpointOverrides (from widget definition)
 * 2. Responsive expand rules (expandWidthBelow, expandHeightBelow)
 * 3. Auto-fit with bin-packing
 */
export function fitLayoutToColumns(
  layout: Layout,
  cols: number,
  targetBreakpoint: Breakpoint,
  options: FitLayoutOptions = {},
): Layout {
  const { overridesMap, breakpointOrder = [] } = options;
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
  const columnHeights: number[] = Array(cols).fill(0);
  const placedItems: Layout = [];

  for (const item of sorted) {
    let finalW = item.w;
    let finalH = item.h;

    // 1. Check for explicit breakpoint override
    const overrides = overridesMap?.get(item.i);
    if (overrides?.[targetBreakpoint]) {
      const override = overrides[targetBreakpoint];
      if (override.w !== undefined) finalW = override.w;
      if (override.h !== undefined) finalH = override.h;
    } else {
      // 2. Apply responsive expand rules (only if no explicit override)
      const layoutItem = item as LayoutItem;
      const responsive: ResponsiveLayoutRules | undefined = layoutItem.responsive;

      if (responsive && breakpointOrder.length > 0) {
        if (
          responsive.expandWidthBelow &&
          isBreakpointBelow(targetBreakpoint, responsive.expandWidthBelow, breakpointOrder)
        ) {
          finalW = item.maxW ?? cols;
        }

        if (
          responsive.expandHeightBelow &&
          isBreakpointBelow(targetBreakpoint, responsive.expandHeightBelow, breakpointOrder)
        ) {
          finalH = item.maxH ?? item.h;
        }
      }
    }

    // 3. Bin-pack: ensure width fits in columns and respect maxH
    const width = Math.min(finalW, cols);
    const height = item.maxH ? Math.min(finalH, item.maxH) : finalH;

    let bestY = Infinity;
    let bestX = -1;

    for (let x = 0; x <= cols - width; x++) {
      const yForThisX = Math.max(...columnHeights.slice(x, x + width));
      if (yForThisX < bestY) {
        bestY = yForThisX;
        bestX = x;
      }
    }

    placedItems.push({
      ...item,
      x: bestX,
      y: bestY,
      w: width,
      h: height,
    });

    for (let i = 0; i < width; i++) {
      columnHeights[bestX + i] = bestY + height;
    }
  }

  return placedItems;
}
