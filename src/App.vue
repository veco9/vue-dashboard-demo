<template>
  <a href="#main-content" class="skip-link">{{ $t('aria.skipToContent') }}</a>
  <AppSidebar :items="sidebarItems" v-model:active-id="activeSidebarItem" />
  <div class="app-main">
    <DashboardView
      :title="$t('dashboardTitle')"
      :initial-widgets="initialWidgets"
      :initial-palette-widgets="initialPaletteWidgets"
      :column-count="columnCount"
      @refresh="onRefresh"
      @widget-added="onWidgetAdded"
      @widget-removed="onWidgetRemoved"
    />
    <PToast position="top-center" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import PToast from "primevue/toast";
import { DashboardView } from "@/components/dashboard";
import { AppSidebar } from "@/components/sidebar";
import type { SidebarItem } from "@/components/sidebar";
import { getMockPaletteWidgets, getMockWidgets } from "@/mock/mockWidgets";
import type { DashboardWidget } from "@/models/dashboardWidget";

const { t } = useI18n();

const columnCount = 12;
const initialWidgets = ref(getMockWidgets(columnCount));
const initialPaletteWidgets = ref(getMockPaletteWidgets(columnCount));

const activeSidebarItem = ref("home");
const sidebarItems: SidebarItem[] = [
  { id: "home", icon: "pi-home", label: t("sidebar.home"), group: "top" },
  { id: "settings", icon: "pi-cog", label: t("sidebar.settings"), group: "bottom" },
];

function onRefresh() {
  // Hook for refresh event handling
}

function onWidgetAdded(_widget: DashboardWidget) {
  // Hook for widget-added event handling
}

function onWidgetRemoved(_widget: DashboardWidget) {
  // Hook for widget-removed event handling
}
</script>
