<template>
  <div class="dashboard-wrapper" :class="{ 'edit-mode': editModeActive }">
    <DashboardHeader :title="title" :subtitle="subtitle" />

    <DashboardToolbar
      v-model:edit-mode-active="editModeActive"
      v-model:period="globalPeriod"
      :hide-period="hidePeriod"
      :hide-edit="hideEdit"
      @refresh="onRefresh"
      @reset="onResetDashboard"
      @simulate-error="simulateError"
      @simulate-loading="simulateLoading"
    />

    <div id="main-content" class="dashboard-content" role="main" :aria-label="title" :class="{ 'edit-mode-active': editModeActive }">
      <div class="dashboard-grid-wrapper">
        <div class="dashboard-grid-wrapper-inner" ref="wrapper" @dragover="handleDragOver">
          <GridLayout
            ref="gridLayoutEl"
            v-model:layout="gridLayout"
            :col-num="defaultColumnCount"
            :cols="columnConfig"
            :breakpoints="breakpointConfig"
            :row-height="cellHeight"
            :margin="gridGap"
            :is-draggable="editModeActive"
            :is-resizable="isResizableAllowed"
            responsive
            is-bounded
            vertical-compact
            use-css-transforms
            @breakpoint-changed="handleBreakpointChange"
          >
            <GridItem
              v-for="item in gridLayout"
              :key="item.i"
              v-bind="item"
              :max-h="item.preventResizeH ? item.h : item.maxH"
              :min-h="item.preventResizeH ? item.h : item.minH"
              :max-w="item.preventResizeW ? item.w : item.maxW"
              :min-w="item.preventResizeW ? item.w : item.minW"
              :is-resizable="editModeActive ? item.isResizable : undefined"
              @move="handleItemMove"
              @moved="rebuildBreakpointLayouts()"
              @resized="rebuildBreakpointLayouts()"
              drag-allow-from=".draggable-handle"
            >
              <WidgetKpi
                v-if="getWidgetByI(item.i)?.type === 'kpi'"
                :widget-name="getWidgetByI(item.i)!.displayName"
                :widget-header="getWidgetHeader(item.i)"
                :widget-data="(getWidgetData(item.i) as WidgetKpiData | undefined)"
                :loading="isWidgetLoading(item)"
                :error-msgs="getWidgetError(item.i)"
                :footer-msg="getWidgetFooter(item.i)"
                :edit-mode-active="editModeActive"
                @remove-click="onWidgetRemove(getWidgetByI(item.i)!)"
                @retry-click="initializeWidget(getWidgetByI(item.i)!)"
              />
              <WidgetChart
                v-else-if="getWidgetByI(item.i)"
                :widget-name="getWidgetByI(item.i)!.displayName"
                :widget-header="getWidgetHeader(item.i)"
                :widget-data="(getWidgetData(item.i) as AgChartProps | undefined)"
                :loading="isWidgetLoading(item)"
                :error-msgs="getWidgetError(item.i)"
                :footer-msg="getWidgetFooter(item.i)"
                :edit-mode-active="editModeActive"
                @remove-click="onWidgetRemove(getWidgetByI(item.i)!)"
                @retry-click="initializeWidget(getWidgetByI(item.i)!)"
              />
            </GridItem>
          </GridLayout>

          <DashboardEmptyState
            v-if="gridLayout.length === 0"
            :edit-mode-active="editModeActive"
            @enter-edit-mode="editModeActive = true"
          />
        </div>
      </div>
    </div>

    <DashboardPalette
      v-if="editModeActive"
      :palette-widgets="paletteWidgets"
      :breakpoint="activeBreakpoint"
      @widget-dragstart="onDragStart"
      @widget-drag="onDrag"
      @widget-dragend="onDragEnd"
      @widget-click="onWidgetClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import dayjs from "dayjs";
import { GridItem, GridLayout } from "grid-layout-plus";
import { WidgetKpi } from "@/components/widgets";
const WidgetChart = defineAsyncComponent(() => import("@/components/widgets/widgetchart/WidgetChart.vue"));
import type { Breakpoint, LayoutItem } from "@/models/layoutItem";
import type { DashboardWidget, WidgetPeriod } from "@/models/dashboardWidget";
import type { WidgetKpiData } from "@/components/widgets/widgetkpi/WidgetKpi";
import type { AgChartProps } from "@/components/widgets/agchart/AgChart";
import { useGridDragDrop } from "@/composables/useGridDragDrop";
import { useGridLayout } from "@/composables/useGridLayout";
import { useWidgetManager } from "@/composables/useWidgetManager";
import { useLayoutPersistence } from "@/composables/useLayoutPersistence";
import { useKeyboardShortcuts } from "@/composables/useKeyboardShortcuts";
import { useDemoFeatures } from "@/composables/useDemoFeatures";
import DashboardHeader from "../dashboardheader/DashboardHeader.vue";
import DashboardToolbar from "../dashboardtoolbar/DashboardToolbar.vue";
import DashboardPalette from "../dashboardpalette/DashboardPalette.vue";
import DashboardEmptyState from "../dashboardemptystate/DashboardEmptyState.vue";

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    initialWidgets: DashboardWidget[];
    initialPaletteWidgets: DashboardWidget[];
    hidePeriod?: boolean;
    hideEdit?: boolean;
    columnCount?: number;
    /** Column count per breakpoint. If not provided, derived from columnCount. */
    cols?: Record<Breakpoint, number>;
    /** The breakpoint for which the initial widget layout was designed */
    designBreakpoint?: Breakpoint;
  }>(),
  {
    columnCount: 12,
    designBreakpoint: "lg",
  },
);

const emit = defineEmits<{
  refresh: [];
  reset: [];
  "widget-added": [widget: DashboardWidget];
  "widget-removed": [widget: DashboardWidget];
}>();

const { t } = useI18n();
const toast = useToast();
const editModeActive = ref(false);
const cloneLayout = (l: LayoutItem): LayoutItem => ({
  ...l,
  responsive: l.responsive ? { ...l.responsive } : undefined,
});
const cloneWidgets = (widgets: DashboardWidget[]) =>
  widgets.map((w) => ({ ...w, layout: cloneLayout(w.layout) }));
const widgetItems = ref<DashboardWidget[]>(cloneWidgets(props.initialWidgets));
const paletteWidgets = ref<DashboardWidget[]>(cloneWidgets(props.initialPaletteWidgets));
const gridLayout = ref<LayoutItem[]>(widgetItems.value.map((w) => w.layout));
const globalPeriod = ref<WidgetPeriod>({
  dateFrom: dayjs().startOf("month").toDate(),
  dateTo: dayjs().toDate(),
});

const {
  columnConfig,
  breakpointConfig,
  breakpointLayouts,
  cellHeight,
  defaultColumnCount,
  gridGap,
  activeBreakpoint,
  activeColumnCount,
  isMobileBreakpoint,
  handleBreakpointChange,
  rebuildBreakpointLayouts,
  reinitializeLayouts,
  restoreBreakpointLayouts,
} = useGridLayout(gridLayout, widgetItems, {
  columnCount: props.columnCount,
  cols: props.cols,
  designBreakpoint: props.designBreakpoint,
});

// Disable resize on mobile breakpoints (xs, xxs)
const isResizableAllowed = computed(() => editModeActive.value && !isMobileBreakpoint.value);

const {
  initializeWidget,
  initializeWidgets,
  isWidgetLoading,
  getWidgetByI,
  getWidgetHeader,
  getWidgetData,
  getWidgetError,
  getWidgetFooter,
  removeExcessWidgets,
  setWidgetError,
  setWidgetLoading,
} = useWidgetManager({
  gridLayout,
  widgetItems,
  paletteWidgets,
  globalPeriod,
});

const { handleDrag, handleDragOver, handleDragEnd, handleDragStart, handleItemMove } =
  useGridDragDrop(gridLayout, cellHeight, activeColumnCount, gridGap);

const { saveLayout, loadLayout, clearLayout } = useLayoutPersistence();

const { simulateError, simulateLoading } = useDemoFeatures({
  widgetItems,
  getWidgetError,
  setWidgetError,
  isWidgetLoading,
  setWidgetLoading,
});

function onRefresh() {
  emit("refresh");
  initializeWidgets();
}

function onResetDashboard() {
  // Clear persisted layout from localStorage
  clearLayout();

  // Create fresh copies of initial widgets to avoid mutating props
  widgetItems.value = cloneWidgets(props.initialWidgets);
  paletteWidgets.value = cloneWidgets(props.initialPaletteWidgets);
  gridLayout.value = widgetItems.value.map((w) => w.layout);

  // Reinitialize all breakpoint layouts from the design breakpoint
  reinitializeLayouts(props.designBreakpoint);

  // Apply the fitted layout for the current breakpoint
  gridLayout.value = breakpointLayouts.value[activeBreakpoint.value];

  initializeWidgets();
  emit("reset");
}

// Watch for period changes and reload widgets
watch(
  globalPeriod,
  () => {
    initializeWidgets();
  },
  { deep: true },
);

// Persist layout changes to localStorage
// Save all breakpoint layouts to preserve user customizations at each breakpoint
watch(
  [breakpointLayouts, widgetItems, paletteWidgets],
  () => {
    if (Object.keys(breakpointLayouts.value).length > 0) {
      saveLayout(
        breakpointLayouts.value,
        props.designBreakpoint,
        widgetItems.value.map((w) => w.layout.i),
        paletteWidgets.value.map((w) => w.layout.i),
      );
    }
  },
  { deep: true },
);

// Keyboard shortcuts
useKeyboardShortcuts({
  onToggleEdit: () => (editModeActive.value = !editModeActive.value),
  onRefresh,
  onExitEdit: () => {
    if (editModeActive.value) editModeActive.value = false;
  },
});

// Initial load - restore layout from localStorage if available
onMounted(() => {
  const stored = loadLayout();
  if (stored) {
    // Rebuild widget arrays based on stored IDs
    const allWidgets = [...props.initialWidgets, ...props.initialPaletteWidgets];

    widgetItems.value = stored.dashboardWidgetIds
      .map((id) => allWidgets.find((w) => w.layout.i === id))
      .filter((w): w is DashboardWidget => w !== undefined);

    paletteWidgets.value = stored.paletteWidgetIds
      .map((id) => allWidgets.find((w) => w.layout.i === id))
      .filter((w): w is DashboardWidget => w !== undefined);

    // Restore all breakpoint layouts directly (preserves user customizations)
    const widgetIdSet = new Set(stored.dashboardWidgetIds);
    restoreBreakpointLayouts(stored.breakpointLayouts, widgetIdSet);

    // Set gridLayout to the design breakpoint's layout for initial render
    const designLayout = breakpointLayouts.value[props.designBreakpoint];
    if (designLayout) {
      gridLayout.value = designLayout;
    }
  }

  initializeWidgets();
});

async function onWidgetRemove(widget: DashboardWidget) {
  const newGridLayout = gridLayout.value.filter((item) => item.i !== widget.layout.i);
  await removeExcessWidgets(newGridLayout);

  gridLayout.value = newGridLayout;
  rebuildBreakpointLayouts();

  emit("widget-removed", widget);
}

function onDragStart(event: DragEvent, widget: DashboardWidget) {
  handleDragStart(event, widget.layout);
}

function onDrag(event: DragEvent, widget: DashboardWidget) {
  handleDrag(event, widget.layout);
}

async function onDragEnd(event: DragEvent, widget: DashboardWidget) {
  const item = handleDragEnd();
  if (!item) return;

  // Remove from palette
  const idx = paletteWidgets.value.findIndex((w) => w.layout.i === widget.layout.i);
  if (idx !== -1) {
    paletteWidgets.value.splice(idx, 1);
  }
  // Update widget's layout
  widget.layout = item;

  // Add to dashboard
  widgetItems.value.push(widget);
  initializeWidget(widget);

  emit("widget-added", widget);
  rebuildBreakpointLayouts();
}

function onWidgetClick(widget: DashboardWidget) {
  // Only handle clicks on mobile breakpoints
  if (!isMobileBreakpoint.value) return;

  // Remove from palette
  const idx = paletteWidgets.value.findIndex((w) => w.layout.i === widget.layout.i);
  if (idx !== -1) {
    paletteWidgets.value.splice(idx, 1);
  }

  // Add widget to the end (vertical-compact will position it)
  const maxY = gridLayout.value.reduce((max, item) => Math.max(max, item.y + item.h), 0);
  widget.layout = { ...widget.layout, x: 0, y: maxY };

  // Add to dashboard
  widgetItems.value.push(widget);
  gridLayout.value.push(widget.layout);
  initializeWidget(widget);

  // Show toast notification
  toast.add({
    severity: "contrast",
    summary: widget.displayName,
    detail: t("palette.widgetAdded"),
    life: 2000,
  });

  emit("widget-added", widget);
  rebuildBreakpointLayouts();
}

defineExpose({
  initializeWidgets,
  initializeWidget,
});
</script>

<style scoped>
/* Prevent text selection during resize - must use :deep() in scoped styles */
.dashboard-grid-wrapper :deep(.vgl-layout:has(.vgl-item.vgl-item--resizing) .vgl-item) {
  -webkit-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
}

.dashboard-grid-wrapper
  :deep(.vgl-layout:has(.vgl-item.vgl-item--resizing) .vgl-item:not(.vgl-item--resizing)) {
  pointer-events: none !important;
}

.dashboard-grid-wrapper
  :deep(.vgl-layout:has(.vgl-item.vgl-item--resizing) .vgl-item:not(.vgl-item--resizing) *) {
  -webkit-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
  pointer-events: none !important;
}
</style>
