import type { WidgetHeaderProps } from "../widgetheader/WidgetHeader";

export interface WidgetWrapperProps {
  loading?: boolean;
  hasData?: boolean;
  errorMsgs?: string | null;
  widgetName: string;
  widgetHeader?: WidgetHeaderProps;
  editModeActive: boolean;
  footerMsg?: string;
  footerIcon?: string;
  containerClass?: string;
}

export interface WidgetWrapperEmits {
  "remove-click": [];
  "retry-click": [];
}
