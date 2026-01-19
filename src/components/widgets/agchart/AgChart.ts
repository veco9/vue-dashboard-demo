import type { AgCartesianAxesOptions, AgChartOptions, SeriesOptionsTypes } from "ag-charts-types";
import type { KpiCardProps } from "../kpicard/KpiCard";

export interface AgChartProps {
  type: string;
  minHeight?: number;
  minWidth?: number;
  xTitle?: string;
  yTitle?: string;
  series?: SeriesOptionsTypes[];
  options?: Partial<AgChartOptions>;
  axes?: AgCartesianAxesOptions;
  data?: Record<string, unknown>[];
  prependKpis?: { topDivider?: boolean; centered?: boolean; items: KpiCardProps[] };
}
