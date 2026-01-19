export interface SidebarItem {
  id: string;
  icon: string;
  label: string;
  group?: "top" | "middle" | "bottom";
}

export interface AppSidebarProps {
  items: SidebarItem[];
  activeId?: string;
}

export interface AppSidebarEmits {
  "update:activeId": [id: string];
}
