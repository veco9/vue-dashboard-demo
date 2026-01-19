<template>
  <WidgetWrapper
    :loading="loading"
    :has-data="!!widgetData"
    :error-msgs="errorMsgs"
    :widget-name="widgetName"
    :widget-header="widgetHeader"
    :edit-mode-active="editModeActive"
    :footer-msg="footerMsg"
    :footer-icon="footerIcon"
    @remove-click="emit('remove-click')"
    @retry-click="emit('retry-click')"
  >
    <template #end>
      <PButton
        icon="pi pi-download"
        severity="secondary"
        size="small"
        text
        :aria-label="$t('aria.downloadChart')"
        @click="handleDownload"
      />
    </template>
    <!-- Before content: prepend KPIs if configured -->
    <template #before-content v-if="widgetData?.prependKpis">
      <PDivider v-if="widgetData?.prependKpis?.topDivider" class="!my-0" />
      <div v-else></div>

      <div
        v-if="!loading && widgetData?.prependKpis"
        class="widget-chart-content min-h-fit h-auto"
      >
        <div class="widget-kpi-content">
          <KpiCard
            v-for="(item, idx) in widgetData?.prependKpis?.items"
            :key="idx"
            :icon-wrapper-color="getColorFromPalette(idx)"
            :class="{ 'flex-[1_1_0] min-w-0': widgetData?.prependKpis?.centered }"
            v-bind="item"
          />
        </div>
      </div>

      <PDivider v-if="widgetData?.prependKpis?.items" class="!my-0" />
    </template>

    <!-- Main content: the chart -->
    <div class="widget-chart-content">
      <AgChart ref="chartRef" v-bind="widgetData!" />
    </div>
  </WidgetWrapper>
</template>

<script setup lang="ts">
import { ref } from "vue";
import PButton from "primevue/button";
import PDivider from "primevue/divider";
import AgChart from "../agchart/AgChart.vue";
import KpiCard from "../kpicard/KpiCard.vue";
import WidgetWrapper from "../widgetwrapper/WidgetWrapper.vue";
import { getColorFromPalette } from "@/composables/theme";
import type { WidgetChartProps } from "./WidgetChart";

const props = withDefaults(defineProps<WidgetChartProps>(), {
  footerIcon: "pi pi-info-circle",
});

import type { WidgetChartEmits } from "./WidgetChart";

const emit = defineEmits<WidgetChartEmits>();

// Chart ref for export functionality
const chartRef = ref<InstanceType<typeof AgChart> | null>(null);

function handleDownload() {
  const fileName = props.widgetHeader?.title?.toLowerCase().replace(/\s+/g, "-") ?? "chart";
  chartRef.value?.downloadChart(fileName);
}
</script>
