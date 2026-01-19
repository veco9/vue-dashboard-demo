<template>
  <!-- Error state (takes priority over loading) -->
  <Transition name="widget-transition" appear>
    <WidgetPlaceholder
      v-if="errorMsgs"
      state="error"
      :widget-name="widgetName"
      :show-remove-btn="widgetHeader?.showRemoveBtn"
      :edit-mode-active="editModeActive"
      :error-msgs="errorMsgs"
      @remove-click="emit('remove-click')"
    />
  </Transition>

  <!-- Loading state -->
  <Transition name="widget-transition" appear>
    <WidgetPlaceholder
      v-if="!errorMsgs && (loading || !hasData)"
      state="loading"
      :widget-name="widgetName"
      :show-remove-btn="widgetHeader?.showRemoveBtn"
      :edit-mode-active="editModeActive"
      @remove-click="emit('remove-click')"
    />
  </Transition>

  <!-- Main widget content -->
  <div
    v-if="!loading && !errorMsgs && hasData"
    class="widget draggable-card"
    :class="[{ 'widget-edit-active': editModeActive }, containerClass]"
    :draggable="draggable"
    data-type="widget"
  >
    <div class="draggable-card-inner">
      <i ref="draghandle" v-show="editModeActive" class="pi pi-bars draggable-handle" />
      <div class="widget-inner">
        <!-- Header -->
        <WidgetHeader
          v-if="widgetHeader"
          v-bind="widgetHeader"
          :edit-mode-active="editModeActive"
          @remove-click="emit('remove-click')"
        >
          <template v-for="(_, slot) in headerSlots" #[slot]="slotProps">
            <slot :name="slot" v-bind="slotProps" />
          </template>
        </WidgetHeader>

        <!-- Before content slot -->
        <slot name="before-content" />

        <!-- Main content slot -->
        <slot />

        <!-- After content slot -->
        <slot name="after-content" />

        <!-- Footer -->
        <template v-if="$slots.footer || footerMsg">
          <PDivider class="!my-0" />
          <slot name="footer">
            <div class="widget-footer">
              <i :class="footerIcon" class="widget-footer-icon" />
              <span class="widget-footer-label">{{ footerMsg }}</span>
            </div>
          </slot>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PDivider from "primevue/divider";
import type { WidgetHeaderProps } from "./WidgetHeader.vue";
import WidgetHeader from "./WidgetHeader.vue";
import WidgetPlaceholder from "./WidgetPlaceholder.vue";
import { useDragHandle } from "@/composables/useDragHandle";
import { computed, Transition, useSlots } from "vue";

export interface WidgetWrapperProps {
  loading?: boolean;
  hasData?: boolean;
  errorMsgs?: string | null;
  widgetName: string;
  widgetHeader?: WidgetHeaderProps;
  editModeActive: boolean;
  footerMsg?: string;
  footerIcon?: string;
  containerClass?: string;
}

export interface WidgetWrapperEmits {
  "remove-click": [];
}

const props = withDefaults(defineProps<WidgetWrapperProps>(), {
  footerIcon: "pi pi-info-circle",
  hasData: false,
});

const emit = defineEmits<WidgetWrapperEmits>();

// Use the shared drag composable
const { draggable } = useDragHandle(() => props.editModeActive);

// Filter slots to pass only header-related slots to WidgetHeader
const slots = useSlots();
const headerSlots = computed(() => {
  const result: Record<string, unknown> = {};
  const headerSlotNames = ["start", "title", "subtitle", "end"];
  for (const name of headerSlotNames) {
    if (slots[name]) {
      result[name] = slots[name];
    }
  }
  return result;
});
</script>
