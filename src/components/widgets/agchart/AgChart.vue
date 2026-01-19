<template>
  <ag-charts ref="chartRef" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { AgCharts } from "ag-charts-vue3";
import { createChartTheme } from "@/utils/chartTheme";
import { useTheme } from "@/composables/theme";
import type { AgChartProps } from "./AgChart";
import type { AgChartOptions } from "ag-charts-enterprise";

// Get themeKey to trigger re-render on theme change
const { themeKey } = useTheme();

const props = withDefaults(defineProps<AgChartProps>(), {
  minHeight: 32,
  minWidth: 64,
  series: () => [],
});

const horizontal = computed(
  () =>
    props.series?.some((item) => "direction" in item && item.direction == "horizontal") ?? false,
);

// AG Charts v13 uses object format for axes with keys: x, y, ySecondary, etc.
const axes = computed(() => {
  // Pie and donut charts don't have axes
  if (props.type === "pie" || props.type === "donut") {
    return undefined;
  }

  // For bar charts (including horizontal)
  if (props.type === "bar" || props.type === "horizontalBar") {
    return {
      x: {
        type: "category",
        position: horizontal.value ? "left" : "bottom",
        title: {
          enabled: props.xTitle != undefined,
          text: props.xTitle,
        },
        ...(props.axes?.x ?? {}),
      },
      y: {
        type: "number",
        position: horizontal.value ? "bottom" : "left",
        title: {
          enabled: props.yTitle != undefined,
          text: props.yTitle,
        },
        ...(props.axes?.y ?? {}),
      },
    };
  }

  // For line charts and other cartesian charts
  if (props.type === "line") {
    return {
      x: {
        type: "category",
        position: "bottom",
        title: {
          enabled: props.xTitle != undefined,
          text: props.xTitle,
        },
        ...(props.axes?.x ?? {}),
      },
      y: {
        type: "number",
        position: "left",
        title: {
          enabled: props.yTitle != undefined,
          text: props.yTitle,
        },
        ...(props.axes?.y ?? {}),
      },
    };
  }

  // Fallback: use props.axes directly if it's already in object format
  if (props.axes && typeof props.axes === "object" && !Array.isArray(props.axes)) {
    // If it has x/y keys, use as-is but ensure type is set
    if ("x" in props.axes || "y" in props.axes) {
      return {
        x: {
          type: "category",
          position: "bottom",
          ...(props.axes?.x ?? {}),
        },
        y: {
          type: "number",
          position: "left",
          ...(props.axes?.y ?? {}),
        },
      };
    }
  }

  return undefined;
});

// Use computed for reactivity - themeKey triggers re-evaluation on theme change
const chartOptions = computed<AgChartOptions>(() => {
  // Access themeKey to create dependency for reactivity
  void themeKey.value;

  return {
    theme: createChartTheme(false),
    minHeight: props.minHeight,
    minWidth: props.minWidth,
    data: props.data,
    tooltip: { mode: "shared" },
    series: props.series,
    axes: axes.value,
    ...(props.options ?? {}),
  } as AgChartOptions;
});

// Chart ref for accessing the chart instance
const chartRef = ref<InstanceType<typeof AgCharts> | null>(null);

/**
 * Download the chart as an image
 * @param fileName - The filename without extension
 * @param fileFormat - The image format ('image/png' or 'image/jpeg')
 */
async function downloadChart(
  fileName: string = "chart",
  fileFormat: "image/png" | "image/jpeg" = "image/png",
) {
  const chart = chartRef.value?.chart;
  if (!chart) return;

  const extension = fileFormat === "image/png" ? "png" : "jpg";
  await chart.download({ fileName: `${fileName}.${extension}`, fileFormat });
}

defineExpose({
  downloadChart,
});
</script>
