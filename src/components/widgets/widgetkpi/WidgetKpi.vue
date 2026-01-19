<template>
  <WidgetWrapper
    :loading="loading"
    :has-data="!!widgetData?.items?.length"
    :error-msgs="errorMsgs"
    :widget-name="widgetName"
    :widget-header="widgetHeader"
    :edit-mode-active="editModeActive"
    :footer-msg="footerMsg"
    :footer-icon="footerIcon"
    container-class="widget-kpi"
    @remove-click="emit('remove-click')"
    @retry-click="emit('retry-click')"
  >
    <!-- Custom start slot when no title - display KPI content in header area -->
    <template #start v-if="widgetHeader && !widgetHeader.title">
      <template v-for="(itemList, idx) in computedItems" :key="idx">
        <transition name="fade-in-up">
          <div
            v-show="!loading && widgetData"
            class="widget-kpi-content"
            :class="{ 'widget-kpi-content--grid': widgetData?.columns }"
            :style="
              widgetData?.columns
                ? { gridTemplateColumns: `repeat(${widgetData.columns}, minmax(0, 1fr))` }
                : undefined
            "
          >
            <KpiCard v-for="(item, kpiIdx) in itemList" :key="kpiIdx" v-bind="item" />
          </div>
        </transition>
      </template>
    </template>

    <!-- Main content: KPI cards (when header has title) -->
    <template v-if="widgetHeader?.title">
      <template v-for="(itemList, idx) in computedItems" :key="idx">
        <PDivider v-if="idx != 0" class="!my-2" />
        <transition name="fade-in-up">
          <div
            v-show="!loading && widgetData"
            class="widget-kpi-content"
            :class="{ 'widget-kpi-content--grid': widgetData?.columns }"
            :style="
              widgetData?.columns
                ? { gridTemplateColumns: `repeat(${widgetData.columns}, minmax(0, 1fr))` }
                : undefined
            "
          >
            <KpiCard
              v-for="(item, kpiIdx) in itemList"
              :key="kpiIdx"
              v-bind="item"
              :class="{ 'flex-[1_1_0] min-w-0': widgetData?.centered && !widgetData?.columns }"
            />
          </div>
        </transition>
      </template>
    </template>
  </WidgetWrapper>
</template>

<script setup lang="ts">
import PDivider from "primevue/divider";
import KpiCard from "../kpicard/KpiCard.vue";
import WidgetWrapper from "../widgetwrapper/WidgetWrapper.vue";
import { computed } from "vue";
import { getColorFromPalette } from "@/composables/theme";
import type { KpiCardProps } from "../kpicard/KpiCard";
import type { WidgetKpiProps } from "./WidgetKpi";

const props = withDefaults(defineProps<WidgetKpiProps>(), {
  footerIcon: "pi pi-info-circle",
});

import type { WidgetKpiEmits } from "./WidgetKpi";

const emit = defineEmits<WidgetKpiEmits>();

const computedItems = computed<KpiCardProps[][]>(() => {
  const items =
    props.widgetData?.items?.map((item, idx) => ({
      ...item,
      iconWrapperColor: "icon" in item && item.icon ? getColorFromPalette(idx) : undefined,
    })) ?? [];

  const result: KpiCardProps[][] = [];
  let currentChunk: KpiCardProps[] = [];

  for (const item of items) {
    if ("separator" in item && item.separator) {
      if (currentChunk.length > 0) {
        result.push(currentChunk);
        currentChunk = [];
      }
    } else {
      currentChunk.push(item as KpiCardProps);
    }
  }

  if (currentChunk.length > 0) {
    result.push(currentChunk);
  }

  return result;
});
</script>
