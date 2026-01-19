<template>
  <div
    class="kpicard"
    :class="{ 'kpicard-small': size == 'small', 'kpicard-medium': size == 'medium' }"
  >
    <div class="kpicard-body">
      <slot name="icon">
        <div
          v-if="icon && size != 'small' && size != 'medium'"
          class="kpicard-iconwrapper"
          :class="iconWrapperClass"
          :style="{
            'background-color': icon ? (iconWrapperColor ?? getColorFromPalette(0)) : undefined,
          }"
        >
          <i class="kpicard-icon" :class="icon" aria-hidden="true" />
        </div>
        <DonutChart
          v-else-if="donut"
          :values="donut.values"
          :color-idx-offset="donut.colorIdxOffset"
        />
      </slot>

      <div class="kpicard-content" :class="{ 'kpicard-donut': donut }" :title="leadingLabel">
        <slot name="leadingLabel">
          <div class="kpicard-leadinglabel-wrapper">
            <span class="kpicard-leadinglabel">{{ leadingLabel }}</span>
            <div v-if="growth != undefined" class="kpicard-growth-wrapper">
              <i
                aria-hidden="true"
                :class="
                  growth
                    ? [
                        growthCustomIcon ?? 'pi pi-arrow-up',
                        'text-emerald-600 dark:text-emerald-400',
                      ]
                    : [growthCustomIcon ?? 'pi pi-arrow-down', 'text-rose-600']
                "
              />
              <span
                class="kpicard-growthlabel"
                :class="growth ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'"
                >{{ growthLabel }}</span
              >
            </div>
          </div>
        </slot>

        <div class="kpicard-label-wrapper">
          <slot name="label">
            <span class="kpicard-label">{{ label }}</span>
          </slot>
          <slot name="subLabel">
            <span v-if="subLabel" class="kpicard-sublabel">&nbsp;/&nbsp;{{ subLabel }} </span>
            <template v-else-if="compareLabel">
              <div class="kpicard-comparelabel-divider" />
              <span class="kpicard-comparelabel">{{ compareLabel }}</span>
            </template>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DonutChart from "../donutchart/DonutChart.vue";
import { useSlots } from "vue";
import { getColorFromPalette } from "@/composables/theme";
import type { KpiCardProps } from "./KpiCard";

withDefaults(defineProps<KpiCardProps>(), {
  growth: undefined,
  size: "large",
});

useSlots();
</script>
