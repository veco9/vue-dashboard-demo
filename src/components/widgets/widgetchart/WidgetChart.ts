import type { AgChartProps } from "../agchart/AgChart";
import type { WidgetHeaderProps } from "../widgetheader/WidgetHeader";

export interface WidgetChartProps {
  widgetName: string;
  widgetHeader?: WidgetHeaderProps;
  widgetData?: AgChartProps;
  loading?: boolean;
  errorMsgs?: string | null;
  editModeActive: boolean;
  footerMsg?: string;
  footerIcon?: string;
}

export interface WidgetChartEmits {
  "remove-click": [];
  "retry-click": [];
}
