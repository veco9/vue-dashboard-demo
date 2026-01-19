import { ref, useTemplateRef, watch } from "vue";
import { useMousePressed } from "@vueuse/core";

/**
 * Composable for managing drag handle state.
 * Enables dragging only when edit mode is active and the drag handle is pressed.
 */
export function useDragHandle(isEditModeActive: () => boolean) {
  const draggable = ref(false);
  const dragHandle = useTemplateRef<HTMLElement>("draghandle");
  const { pressed } = useMousePressed({ target: dragHandle });

  watch(pressed, (newV) => {
    draggable.value = isEditModeActive() && newV;
  });

  return {
    draggable,
    dragHandle,
  };
}
