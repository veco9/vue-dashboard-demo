<template>
  <aside class="app-sidebar">
    <template v-for="(group, idx) in groupedItems" :key="idx">
      <hr v-if="idx > 0" class="app-sidebar-hr" />
      <div class="app-sidebar-group">
        <button
          v-for="item in group"
          :key="item.id"
          class="app-sidebar-icon group"
          :class="{ 'app-sidebar-icon--active': item.id === activeId }"
          :disabled="item.group === 'bottom'"
          :aria-label="item.label"
          @click="emit('update:activeId', item.id)"
        >
          <i :class="['pi', item.icon]" aria-hidden="true" />
          <span class="app-sidebar-tooltip group-hover:scale-100">
            {{ item.label }}
          </span>
        </button>
      </div>
    </template>

    <div class="app-sidebar-bottom">
      <button class="app-sidebar-avatar group" :aria-label="$t('sidebar.profile')">
        <span class="app-sidebar-avatar-initials">JD</span>
        <span class="app-sidebar-avatar-status" />
        <span class="app-sidebar-tooltip group-hover:scale-100">
          {{ $t("sidebar.profile") }}
        </span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { AppSidebarEmits, AppSidebarProps, SidebarItem } from "./AppSidebar";

const props = defineProps<AppSidebarProps>();
const emit = defineEmits<AppSidebarEmits>();

const groupedItems = computed(() => {
  const groups: SidebarItem[][] = [];
  const order: Array<"top" | "middle" | "bottom"> = ["top", "middle", "bottom"];
  for (const g of order) {
    const items = props.items.filter((i) => (i.group ?? "top") === g);
    if (items.length) groups.push(items);
  }
  return groups;
});
</script>
