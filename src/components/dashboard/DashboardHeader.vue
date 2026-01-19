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
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";

defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>
