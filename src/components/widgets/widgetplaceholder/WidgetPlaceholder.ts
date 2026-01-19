export type WidgetPlaceholderState = "loading" | "error" | "placeholder";

export interface WidgetPlaceholderProps {
  state?: WidgetPlaceholderState;
  editModeActive: boolean;
  widgetName: string;
  errorMsgs?: string;
  showRemoveBtn?: boolean;
}

export interface WidgetPlaceholderEmits {
  "remove-click": [];
  "retry-click": [];
}
