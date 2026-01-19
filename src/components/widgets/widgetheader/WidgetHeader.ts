export interface WidgetHeaderProps {
  title?: string;
  subtitle?: string;
  subtitleItems?: { title: string; color?: string }[];
  icon?: string;
  iconWrapperClass?: string;
  growthLabel?: string;
  growth?: boolean;
  editModeActive?: boolean;
  showRemoveBtn?: boolean;
}

export interface WidgetHeaderEmits {
  "remove-click": [];
}
