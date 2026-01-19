<template>
  <div class="dashboard-empty-state">
    <div class="dashboard-empty-state-inner">
      <img
        :src="emptyDashboardImage"
        :alt="t('dashboard.emptyState.title')"
        class="dashboard-empty-state-img"
      />
      <div class="dashboard-empty-state-label-wrapper">
        <span class="dashboard-empty-state-title">
          {{ t("dashboard.emptyState.title") }}
        </span>
        <span class="dashboard-empty-state-text">
          {{
            editModeActive
              ? t("dashboard.emptyState.editModeSubtitle")
              : t("dashboard.emptyState.subtitle")
          }}
        </span>
      </div>
      <PButton
        v-if="!editModeActive"
        :label="t('toolbar.editDashboard')"
        icon="pi pi-pencil"
        size="small"
        @click="emit('enter-edit-mode')"
      />
      <div v-else class="h-8 w-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PButton from "primevue/button";
import { useI18n } from "vue-i18n";
import emptyDashboardImage from "@/assets/images/emptyDashboard.svg";
import type { DashboardEmptyStateProps, DashboardEmptyStateEmits } from "./DashboardEmptyState";

defineProps<DashboardEmptyStateProps>();

const emit = defineEmits<DashboardEmptyStateEmits>();

const { t } = useI18n();
</script>
