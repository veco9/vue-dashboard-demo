import type { LayoutItem as GridLayoutItem } from "grid-layout-plus";

export type Breakpoint = "xxs" | "xs" | "sm" | "md" | "lg";

/**
 * Responsive layout rules applied when fitting to smaller breakpoints.
 * These are applied after explicit breakpointOverrides but before auto-fitting.
 */
export interface ResponsiveLayoutRules {
  /** Expand width to maxW when below this breakpoint */
  expandWidthBelow?: Breakpoint;
  /** Expand height to maxH when below this breakpoint */
  expandHeightBelow?: Breakpoint;
}

export interface LayoutItem extends GridLayoutItem {
  preventResizeH?: boolean;
  preventResizeW?: boolean;
  /** Responsive rules for automatic resizing on smaller breakpoints */
  responsive?: ResponsiveLayoutRules;
}

export interface DashboardLayoutConfig {
  columnCount?: number;
  cols?: Record<Breakpoint, number>;
  breakpoints?: Record<Breakpoint, number>;
  rowHeight?: number;
  margin?: [number, number];
  /** The breakpoint for which the initial widget layout was designed */
  designBreakpoint?: Breakpoint;
}
