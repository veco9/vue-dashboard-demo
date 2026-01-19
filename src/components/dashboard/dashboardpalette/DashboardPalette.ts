import type { DashboardWidget } from "@/models/dashboardWidget";

export interface DashboardPaletteProps {
  paletteWidgets: DashboardWidget[];
  breakpoint?: string;
}

export interface DashboardPaletteEmits {
  "widget-dragstart": [event: DragEvent, widget: DashboardWidget];
  "widget-drag": [event: DragEvent, widget: DashboardWidget];
  "widget-dragend": [event: DragEvent, widget: DashboardWidget];
  "widget-click": [widget: DashboardWidget];
}

export interface DashboardPaletteExpose {
  onItemRemoved: (item: DashboardWidget, index: number) => void;
}
