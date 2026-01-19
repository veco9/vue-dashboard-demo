<template>
  <div class="relative w-14 h-14 rounded-full donut">
    <svg :width="size" :height="size" viewBox="0 0 100 100" class="block">
      <!-- Background circle -->
      <circle cx="50" cy="50" r="40" fill="none" :stroke="surfaceColor" :stroke-width="thickness" />

      <!-- Segments -->
      <template v-for="segment in segments" :key="segment.color">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          :stroke="segment.color"
          :stroke-width="thickness"
          stroke-linecap="butt"
          :stroke-dasharray="`${segment.arcLength} ${circumference - segment.arcLength}`"
          :stroke-dashoffset="segment.offset"
          transform="rotate(-90 50 50)"
        />
      </template>

      <!-- Inner circle to create donut hole -->
      <circle cx="50" cy="50" :r="40 - thickness / 2" :fill="surfaceColor" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getColorFromPalette, getLightColorFromPalette, useTheme } from "@/composables/theme";

import type { DonutChartProps } from "./DonutChart";

const props = withDefaults(defineProps<DonutChartProps>(), {
  size: 58,
  colorIdxOffset: 0,
});

const { isDark, getCurrentSurface } = useTheme();

// Get surface color from theme (for donut hole and background)
const surfaceColor = computed(() => {
  const surface = getCurrentSurface();
  if (!surface) return isDark.value ? "#0f172a" : "#ffffff";
  return isDark.value ? surface.palette["800"] : surface.palette["0"];
});

const gap = 4;
const thickness = 20;
const radius = computed(() => {
  return 50 - thickness / 2;
});
const circumference = computed(() => 2 * Math.PI * radius.value);

const getColor = (index: number) => {
  const idx = props.colorIdxOffset + index;
  return idx % 2 === 0 ? getColorFromPalette(idx / 2) : getLightColorFromPalette((idx - 1) / 2);
};

const segments = computed(() => {
  const validValues = props.values
    .map((value, idx) => ({ value, idx }))
    .filter((item): item is { value: number; idx: number } => item.value != null);

  if (validValues.length === 0) {
    return [];
  }

  const total = validValues.reduce((sum, item) => sum + item.value, 0);
  const gapLength = (gap / 360) * circumference.value;
  const totalGapLength = gapLength * validValues.length;
  const usableCircumference = circumference.value - totalGapLength;

  let cumulativeLength = 0;

  return validValues.map((item) => {
    const arcLength = (item.value / total) * usableCircumference;
    const offset = circumference.value - cumulativeLength - gapLength / 2;
    cumulativeLength += arcLength + gapLength;

    return {
      color: getColor(item.idx),
      arcLength,
      offset,
    };
  });
});
</script>
