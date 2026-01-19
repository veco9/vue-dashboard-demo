<template>
  <div class="dashboard-palette">
    <div class="dashboard-palette-items">
      <PCarousel
        ref="carouselRef"
        class="dashboard-palette-carousel"
        @update:page="palettePage = $event"
        :prev-button-props="{ size: 'small', text: true, unstyled: true }"
        :next-button-props="{ size: 'small', text: true, unstyled: true }"
        :value="computedPaletteWidgets"
        :num-visible="numVisible"
        :num-scroll="numVisible"
        :show-indicators="false"
      >
        <template #previcon>
          <i class="pi pi-chevron-left" />
        </template>
        <template #nexticon>
          <i class="pi pi-chevron-right" />
        </template>
        <template #item="{ data: widget }">
          <div
            v-if="widget.type"
            class="dashboard-palette-item"
            role="button"
            tabindex="0"
            :aria-label="widget.displayName"
            draggable="true"
            @dragstart="onDragStart($event, widget)"
            @drag="onDrag($event, widget)"
            @dragend="onDragEnd($event, widget)"
            @click="onClick(widget)"
            @keydown.enter="onClick(widget)"
            @keydown.space.prevent="onClick(widget)"
          >
            <div class="dashboard-palette-item-inner">
              <div
                class="dashboard-palette-item-icon-wrapper"
                :style="{ backgroundColor: getIconColor(widget.type) }"
              >
                <i
                  :class="getWidgetIcon(widget.type)"
                  class="dashboard-palette-item-icon"
                  aria-hidden="true"
                ></i>
              </div>
              <span class="dashboard-palette-item-label">{{ widget.displayName }}</span>
            </div>
            <WidgetPlaceholder
              class="dashboard-palette-item-loader"
              state="placeholder"
              :widget-name="widget.displayName"
              edit-mode-active
            />
          </div>
          <div v-else class="dashboard-palette-item dashboard-palette-item-placeholder" />
        </template>
        <template #empty>
          <div class="dashboard-palette-items-emptystate">
            <span class="dashboard-palette-items-emptystate-label">{{
              t("palette.emptyState")
            }}</span>
          </div>
        </template>
      </PCarousel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import PCarousel from "primevue/carousel";
import type { DashboardWidget, WidgetType } from "@/models/dashboardWidget";
import { getColorFromPalette } from "@/composables/theme";
import { WidgetPlaceholder } from "@/components/widgets";
import type { DashboardPaletteEmits, DashboardPaletteProps } from "./DashboardPalette";

const props = defineProps<DashboardPaletteProps>();

const emit = defineEmits<DashboardPaletteEmits>();

const { t } = useI18n();
const carouselRef = useTemplateRef<InstanceType<typeof PCarousel> | null>("carouselRef");
const palettePage = ref(0);

const responsiveOptions = [
  { code: "lg", numVisible: 6 },
  { code: "md", numVisible: 4 },
  { code: "sm", numVisible: 3 },
  { code: "xs", numVisible: 2 },
  { code: "xxs", numVisible: 1 },
];

const numVisible = computed(() => {
  const option = responsiveOptions.find((opt) => opt.code === props.breakpoint);
  return option?.numVisible ?? 4;
});

watch(
  () => props.breakpoint,
   
  // @ts-expect-error createStyle is an internal PrimeVue Carousel method not exposed in types
  () => nextTick(() => carouselRef.value?.createStyle?.()),
);

const computedPaletteWidgets = computed(() => {
  if (props.paletteWidgets.length === 0) return [];

  const remainder = props.paletteWidgets.length % numVisible.value;
  if (remainder === 0) return props.paletteWidgets;

  const totalToFill = numVisible.value - remainder;
  const placeholders = Array.from({ length: totalToFill }, () => ({ placeholder: true }));

  return [...props.paletteWidgets, ...placeholders];
});

function getIconColor(_type: WidgetType): string {
  return getColorFromPalette(0);
}

function getWidgetIcon(type: WidgetType): string {
  switch (type) {
    case "kpi":
      return "pi pi-hashtag";
    case "line":
      return "pi pi-chart-line";
    case "pie":
      return "pi pi-chart-pie";
    case "donut":
      return "pi pi-circle";
    case "bar":
    case "horizontalBar":
    default:
      return "pi pi-chart-bar";
  }
}

function onDragStart(event: DragEvent, widget: DashboardWidget) {
  emit("widget-dragstart", event, widget);
}

function onDrag(event: DragEvent, widget: DashboardWidget) {
  emit("widget-drag", event, widget);
}

function onDragEnd(event: DragEvent, widget: DashboardWidget) {
  emit("widget-dragend", event, widget);
}

function onClick(widget: DashboardWidget) {
  emit("widget-click", widget);
}

function onItemRemoved(_item: DashboardWidget, index: number) {
  if (palettePage.value > 0 && index % numVisible.value === 0) {
    // @ts-expect-error step is an internal PrimeVue Carousel method not exposed in types
    carouselRef.value?.step?.(1, palettePage.value - 1);
  }
}

defineExpose({
  onItemRemoved,
});
</script>
