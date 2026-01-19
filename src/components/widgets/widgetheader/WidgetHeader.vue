<template>
  <div class="widget-header">
    <div class="widget-header-start">
      <slot name="start">
        <template v-if="title">
          <KpiCard
            v-if="icon"
            :label="title"
            :leading-label="subtitle"
            :icon="icon"
            :icon-wrapper-class="iconWrapperClass"
            :icon-wrapper-color="icon ? getColorFromPalette(0) : undefined"
          />
          <template v-else>
            <slot name="title">
              <div class="widget-header-title-wrapper" :title="title">
                <h2 class="widget-header-titlelabel">{{ title }}</h2>
                <span
                  v-if="growth !== undefined"
                  class="widget-header-title-growthlabel"
                  :class="growth ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'"
                  >{{ growthLabel }}</span
                >
              </div>
            </slot>
            <slot name="subtitle">
              <div
                v-if="subtitleItems && subtitleItems.length > 0"
                class="widget-header-subtitle-wrapper"
              >
                <template v-for="(subtitleItem, idx) in subtitleItems" :key="idx">
                  <div class="widget-header-subtitleitem-wrapper">
                    <div
                      v-if="subtitleItem.color"
                      class="widget-header-subtitleitem-indicator"
                      :style="{ 'background-color': subtitleItem.color }"
                    />
                    <span class="widget-header-subtitleitem-label">{{ subtitleItem.title }}</span>
                  </div>
                  <div v-if="idx != subtitleItems.length - 1" class="widget-header-divider" />
                </template>
              </div>
              <span v-else-if="subtitle" class="widget-header-subtitleitem-label">{{
                subtitle
              }}</span>
            </slot>
          </template>
        </template>
      </slot>
    </div>

    <div class="widget-header-end">
      <slot name="end" />
      <PButton
        v-if="editModeActive || showRemoveBtn"
        icon="pi pi-trash"
        severity="secondary"
        size="small"
        text
        :aria-label="$t('aria.removeWidget')"
        @click="emit('remove-click')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import PButton from "primevue/button";
import KpiCard from "../kpicard/KpiCard.vue";
import { getColorFromPalette } from "@/composables/theme";
import type { WidgetHeaderProps, WidgetHeaderEmits } from "./WidgetHeader";

defineProps<WidgetHeaderProps>();
const emit = defineEmits<WidgetHeaderEmits>();
</script>
