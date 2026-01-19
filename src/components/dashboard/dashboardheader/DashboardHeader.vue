<template>
  <div class="dashboard-header">
    <div class="dashboard-header-left">
      <h1 class="dashboard-header-title">{{ title }}</h1>
      <span v-if="subtitle" class="dashboard-header-subtitle">{{ subtitle }}</span>
    </div>
    <div class="dashboard-header-right">
      <ThemeSwitcher />
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeSwitcher from "@/components/themeswitcher/ThemeSwitcher.vue";
import type { DashboardHeaderProps } from "./DashboardHeader";

defineProps<DashboardHeaderProps>();
</script>
