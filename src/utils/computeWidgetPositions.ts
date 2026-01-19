/**
 * Widget grid placement utilities.
 */
import type { DashboardWidget, DashboardWidgetPartial } from "@/models/dashboardWidget";

export interface GridPlacementConfig {
  columns: number;
  startIndex?: number;
}

/**
 * Find the best position for a widget in the grid.
 * Returns the column (x) and row (y) where the widget should be placed.
 */
function findSlot(columnTops: number[], width: number): { x: number; y: number } {
  const cols = columnTops.length;
  const w = Math.min(width, cols);

  let bestX = 0;
  let bestY = Infinity;

  for (let x = 0; x <= cols - w; x++) {
    // Get the highest point in this span
    let y = 0;
    for (let i = x; i < x + w; i++) {
      if (columnTops[i] > y) y = columnTops[i];
    }
    if (y < bestY) {
      bestY = y;
      bestX = x;
    }
  }

  return { x: bestX, y: bestY };
}

/**
 * Place widgets on a grid, calculating x/y positions.
 */
export function computeWidgetPositions(
  widgets: DashboardWidgetPartial[],
  config: GridPlacementConfig,
): DashboardWidget[] {
  const cols = config.columns;
  const columnTops = new Array(cols).fill(0);

  return widgets.map((widget) => {
    const w = Math.min(widget.layout.w ?? 1, widget.layout.maxW ?? Infinity);
    const h = Math.min(widget.layout.h ?? 1, widget.layout.maxH ?? Infinity);

    const pos = findSlot(columnTops, w);

    // Mark columns as occupied
    for (let i = pos.x; i < pos.x + w; i++) {
      columnTops[i] = pos.y + h;
    }

    return {
      ...widget,
      layout: { ...widget.layout, x: pos.x, y: pos.y },
    } as DashboardWidget;
  });
}
