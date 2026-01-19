import type { DonutChartProps } from "../donutchart/DonutChart";

export interface KpiCardProps {
  icon?: string;
  iconWrapperColor?: string;
  iconWrapperClass?: string;
  leadingLabel?: string;
  label: string | number;
  subLabel?: string | number;
  compareLabel?: string | number;
  growth?: boolean;
  growthLabel?: string;
  growthCustomIcon?: string;
  size?: "small" | "medium" | "large" | undefined;
  donut?: DonutChartProps;
}
