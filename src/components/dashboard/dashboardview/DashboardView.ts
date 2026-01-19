import type { DashboardWidget } from "@/models/dashboardWidget";
import type { Breakpoint } from "@/models/layoutItem";

export interface DashboardViewProps {
  title: string;
  subtitle?: string;
  initialWidgets: DashboardWidget[];
  initialPaletteWidgets: DashboardWidget[];
  hidePeriod?: boolean;
  hideEdit?: boolean;
  columnCount?: number;
  /** Column count per breakpoint. If not provided, derived from columnCount. */
  cols?: Record<Breakpoint, number>;
  /** The breakpoint for which the initial widget layout was designed */
  designBreakpoint?: Breakpoint;
}

export interface DashboardViewEmits {
  refresh: [];
  reset: [];
  "widget-added": [widget: DashboardWidget];
  "widget-removed": [widget: DashboardWidget];
}

export interface DashboardViewExpose {
  initializeWidgets: () => Promise<void>;
  initializeWidget: (widget: DashboardWidget) => Promise<void>;
}
