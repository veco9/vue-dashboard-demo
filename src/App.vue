<template>
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
</template>

<script setup lang="ts">
import { ref } from "vue";
import PToast from "primevue/toast";
import { DashboardView } from "@/components/dashboard";
import { getMockPaletteWidgets, getMockWidgets } from "@/mock/mockWidgets";
import type { DashboardWidget } from "@/models/dashboardWidget";

const columnCount = 12;
const initialWidgets = ref(getMockWidgets(columnCount));
const initialPaletteWidgets = ref(getMockPaletteWidgets(columnCount));

function onRefresh() {
  console.log("Dashboard refreshed");
}

function onWidgetAdded(widget: DashboardWidget) {
  console.log("Widget added:", widget.displayName);
}

function onWidgetRemoved(widget: DashboardWidget) {
  console.log("Widget removed:", widget.displayName);
}
</script>
