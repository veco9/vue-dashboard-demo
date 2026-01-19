import type { AgChartProps } from "@/components/widgets/agchart/AgChart";
import type { WidgetHeaderProps } from "@/components/widgets/widgetheader/WidgetHeader";
import type { KpiCardProps } from "@/components/widgets/kpicard/KpiCard";
import type { Breakpoint, LayoutItem } from "@/models/layoutItem";

/**
 * Allowed widget types for dashboard widgets
 */
export type WidgetType = "pie" | "bar" | "horizontalBar" | "donut" | "kpi" | "line";

/**
 * Simple period interface for widgets.
 * Contains only the resolved dates, no UI-specific concerns.
 */
export interface WidgetPeriod {
  dateFrom: Date;
  dateTo: Date;
  compareDateFrom?: Date;
  compareDateTo?: Date;
}

export interface KpiWidgetData {
  items?: (KpiCardProps | { separator: boolean })[];
  centered?: boolean;
  columns?: number;
}

/** Callbacks provided to initialize for interactive widgets */
export interface WidgetCallbacks<D = AgChartProps | KpiWidgetData> {
  /** Resize the widget in the grid */
  resizeWidget?: (layout: LayoutItem, newH?: number, newW?: number) => void;
  /** Update widget data reactively (for real-time widgets) */
  updateData?: (newData: Partial<D>) => void;
}

/** Parameters passed to widget initialize function */
export interface InitParams<D = AgChartProps | KpiWidgetData> {
  period: WidgetPeriod;
  params?: Record<string, unknown>;
  callbacks?: WidgetCallbacks<D>;
}

/** State returned from widget initialize function */
export interface WidgetState<D = AgChartProps | KpiWidgetData> {
  header?: WidgetHeaderProps;
  data: D;
  footer?: string;
}

export interface DashboardWidget<D = AgChartProps | KpiWidgetData> {
  layout: LayoutItem;
  type: WidgetType;
  displayName: string;
  skipDateFilter?: boolean;
  initialize: (params: InitParams<D>) => Promise<WidgetState<D>>;
  /** Custom data for special widgets (e.g., interval IDs for real-time) */
  custom?: unknown;
  /**
   * Explicit layout overrides per breakpoint.
   * Takes precedence over responsive rules and auto-fitting.
   */
  breakpointOverrides?: Partial<Record<Breakpoint, Partial<LayoutItem>>>;
}

export type DashboardWidgetPartial<D = AgChartProps | KpiWidgetData> = Omit<
  DashboardWidget<D>,
  "layout"
> & {
  layout: Omit<LayoutItem, "x" | "y" | "i">;
};
