import type { WidgetPeriod } from "@/models/dashboardWidget";

export interface DashboardToolbarProps {
  hidePeriod?: boolean;
  hideEdit?: boolean;
  editModeActive?: boolean;
  period: WidgetPeriod;
}

export interface DashboardToolbarEmits {
  "update:editModeActive": [value: boolean];
  "update:period": [period: WidgetPeriod];
  refresh: [];
  reset: [];
  "simulate-error": [];
  "simulate-loading": [];
}
