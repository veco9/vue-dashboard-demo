import type { KpiCardProps } from "../kpicard/KpiCard";
import type { WidgetHeaderProps } from "../widgetheader/WidgetHeader";

export interface WidgetKpiData {
  items?: (KpiCardProps & { separator?: boolean })[];
  columns?: number;
  centered?: boolean;
}

export interface WidgetKpiProps {
  widgetName: string;
  widgetHeader?: WidgetHeaderProps;
  widgetData?: WidgetKpiData;
  loading?: boolean;
  errorMsgs?: string | null;
  editModeActive: boolean;
  footerMsg?: string;
  footerIcon?: string;
}

export interface WidgetKpiEmits {
  "remove-click": [];
  "retry-click": [];
}
