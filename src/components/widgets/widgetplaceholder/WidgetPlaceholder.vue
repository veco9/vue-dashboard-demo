<template>
  <div class="widget widget-loader">
    <div class="draggable-card-inner gap-0">
      <i
        ref="draghandle"
        v-show="editModeActive"
        class="pi pi-bars draggable-handle"
        aria-hidden="true"
      />
      <div class="widget-loader-inner">
        <div class="widget-header">
          <div class="widget-header-start">
            <div class="widget-header-title-wrapper">
              <h2 class="widget-header-titlelabel">{{ widgetName }}</h2>
            </div>
          </div>

          <div class="widget-header-end">
            <PButton
              v-if="state === 'error'"
              icon="pi pi-refresh"
              severity="danger"
              size="small"
              text
              :aria-label="$t('aria.retryWidget')"
              @click="emit('retry-click')"
            />
            <PButton
              v-if="state === 'error' && errorMsgs"
              icon="pi pi-info-circle"
              severity="danger"
              size="small"
              text
              :aria-label="$t('aria.viewErrorDetails')"
              @click="popoverRef?.toggle"
            />
            <PButton
              v-if="showRemoveBtn !== undefined ? showRemoveBtn : editModeActive"
              icon="pi pi-trash"
              severity="secondary"
              size="small"
              text
              :aria-label="$t('aria.removeWidget')"
              @click="emit('remove-click')"
            />

            <PPopover ref="popover" class="max-w-[400px]">
              <div class="flex flex-col gap-1">
                <span class="widget-error-popover-title">Error</span>
                <span
                  v-if="splittedErrorMsgs.length == 1"
                  class="text-sm text-surface-900 dark:text-surface-100"
                  >{{ errorMsgs }}</span
                >
                <ul v-else class="list-disc px-6 space-y-1">
                  <li
                    v-for="(error, idx) in splittedErrorMsgs"
                    :key="idx"
                    class="text-sm text-surface-900 dark:text-surface-100"
                  >
                    {{ error }}
                  </li>
                </ul>
              </div>
            </PPopover>
          </div>
        </div>

        <!-- Loading state -->
        <div
          v-if="state === 'loading'"
          class="widget-loader-content"
          role="status"
          :aria-label="$t('loadingOoo')"
        >
          <div class="widget-spinner" :aria-label="$t('loadingOoo')" />
        </div>

        <!-- Placeholder state -->
        <div
          v-else-if="state === 'placeholder'"
          class="widget-loader-content bg-surface-100 dark:bg-surface-800"
        >
          <i
            class="pi pi-chart-bar text-4xl text-surface-900 dark:text-surface-100"
            aria-hidden="true"
          />
        </div>

        <!-- Error state -->
        <div
          v-else-if="state === 'error'"
          class="widget-loader-content flex-col gap-1 bg-rose-50 dark:bg-rose-200"
          role="alert"
        >
          <span class="widget-error-msg">{{ t("widget.errorMsg") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PButton from "primevue/button";
import PPopover from "primevue/popover";
import { useI18n } from "vue-i18n";
import { computed, useTemplateRef } from "vue";

import type { WidgetPlaceholderEmits, WidgetPlaceholderProps } from "./WidgetPlaceholder";

const props = withDefaults(defineProps<WidgetPlaceholderProps>(), {
  state: "loading",
  showRemoveBtn: undefined,
});

const emit = defineEmits<WidgetPlaceholderEmits>();

const { t } = useI18n();
const popoverRef = useTemplateRef("popover");

const splittedErrorMsgs = computed(() => {
  if (!props.errorMsgs) return [];
  return props.errorMsgs.includes("\n") ? props.errorMsgs.split("\n") : [props.errorMsgs];
});
</script>
