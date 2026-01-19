<template>
  <div class="theme-switcher">
    <!-- Dark mode toggle -->
    <PButton
      type="button"
      :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
      severity="secondary"
      text
      rounded
      @click="toggleDarkMode"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    />
    <!-- Color palette button -->
    <PButton
      type="button"
      icon="pi pi-palette"
      severity="secondary"
      text
      rounded
      @click="toggle"
      aria-label="Theme settings"
    />
    <PPopover ref="popoverRef">
      <div class="theme-switcher-panel">
        <div class="theme-switcher-section">
          <span class="theme-switcher-section-title">Primary Color</span>
          <div class="theme-switcher-colors">
            <button
              v-for="palette in primaryPalettes"
              :key="palette.name"
              type="button"
              class="theme-switcher-color"
              :class="{ active: currentPrimary === palette.name }"
              :style="{ backgroundColor: palette.color }"
              :title="palette.label"
              :aria-label="t('theme.selectPrimaryColor', { label: palette.label })"
              @click="setPrimary(palette.name)"
            >
              <i v-if="currentPrimary === palette.name" class="pi pi-check" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div class="theme-switcher-section">
          <span class="theme-switcher-section-title">Surface Color</span>
          <div class="theme-switcher-colors">
            <button
              v-for="palette in surfacePalettes"
              :key="palette.name"
              type="button"
              class="theme-switcher-color"
              :class="{ active: currentSurface === palette.name }"
              :style="{ backgroundColor: palette.color }"
              :title="palette.label"
              :aria-label="t('theme.selectSurfaceColor', { label: palette.label })"
              @click="setSurface(palette.name)"
            >
              <i v-if="currentSurface === palette.name" class="pi pi-check" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </PPopover>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useTheme } from "@/composables/theme";
import PButton from "primevue/button";
import PPopover from "primevue/popover";

const { t } = useI18n();
const popoverRef = ref();

const {
  currentPrimary,
  currentSurface,
  isDark,
  primaryPalettes,
  surfacePalettes,
  setPrimary,
  setSurface,
  toggleDarkMode,
} = useTheme();

function toggle(event: Event) {
  popoverRef.value.toggle(event);
}
</script>

<style>
@reference "@/assets/style.css";

.theme-switcher {
  @apply relative;
}

.theme-switcher-panel {
  @apply flex flex-col gap-4 px-1 py-2 min-w-[200px];
}

.theme-switcher-section {
  @apply flex flex-col gap-2;
}

.theme-switcher-section-title {
  @apply text-sm font-medium text-surface-700 dark:text-surface-300;
}

.theme-switcher-colors {
  @apply flex flex-wrap gap-2;
}

.theme-switcher-color {
  @apply w-7 h-7 rounded-full cursor-pointer border-2 border-transparent
    flex items-center justify-center transition-all;
}

.theme-switcher-color:hover {
  @apply scale-110;
}

.theme-switcher-color.active {
  @apply border-surface-900 ring-2 ring-offset-2 ring-surface-400;
}

.theme-switcher-color i {
  @apply text-white text-xs;
}
</style>
