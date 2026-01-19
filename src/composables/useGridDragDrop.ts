import { ref, type Ref, useTemplateRef } from "vue";
import { useMouse } from "@vueuse/core";
import type { GridLayout } from "grid-layout-plus";
import type { LayoutItem } from "@/models/layoutItem";

/** Internal grid-layout-plus GridItem shape (not part of public API) */
interface GridItemInternal {
  wrapper: HTMLElement;
  state: { top: number; left: number };
  calcXY: (top: number, left: number) => { x: number; y: number };
}

/** Internal grid-layout-plus GridLayout shape */
interface GridLayoutInternal {
  state?: { width?: number };
}

interface DropZoneState {
  targetId: string | number;
  pendingItem: LayoutItem;
  active: boolean;
  aborted: boolean;
}

const emptyLayoutItem: LayoutItem = { x: -1, y: -1, w: 1, h: 1, i: "" };

// Module-level state for drag ghost element
let sourceElement: HTMLElement | null = null;
let ghostElement: HTMLElement | null = null;

/**
 * Composable for grid drag and drop operations.
 */
export function useGridDragDrop(
  layout: Ref<LayoutItem[]>,
  cellHeight: number,
  columnCount: Ref<number>,
  gridGap: number[] = [0, 0],
) {
  const gridRef = useTemplateRef<InstanceType<typeof GridLayout>>("gridLayoutEl");
  const containerRef = useTemplateRef<HTMLElement>("wrapper");

  const dropState = ref<DropZoneState>({
    targetId: "dropId",
    pendingItem: { ...emptyLayoutItem },
    active: false,
    aborted: false,
  });

  const { x: pointerX, y: pointerY } = useMouse();

  function clearDropState() {
    dropState.value = {
      targetId: "dropId",
      pendingItem: { ...emptyLayoutItem },
      active: false,
      aborted: false,
    };
  }

  function getDropTargetInfo(): {
    index?: number;
    item?: unknown;
    isInsideGrid?: boolean;
  } {
    const bounds = containerRef.value?.getBoundingClientRect();
    if (!bounds || !gridRef.value) return {};

    const isInsideGrid =
      pointerX.value > bounds.left &&
      pointerX.value < bounds.right &&
      pointerY.value > bounds.top &&
      pointerY.value < bounds.bottom;

    if (isInsideGrid && !layout.value.find((item) => item.i === dropState.value.targetId)) {
      layout.value.push({
        x: (layout.value.length * 2) % columnCount.value,
        y: layout.value.length + columnCount.value,
        w: dropState.value.pendingItem.w,
        h: dropState.value.pendingItem.h,
        i: dropState.value.targetId,
      });
    }

    const index = layout.value.findIndex((item) => item.i === dropState.value.targetId);

    if (index !== -1) {
      const item = gridRef.value.getItem(dropState.value.targetId);
      if (!item) return {};
      return { index, item, isInsideGrid };
    }

    return {};
  }

  function handleDragOver(e: DragEvent): void {
    e.preventDefault();

    const bounds = containerRef.value?.getBoundingClientRect();
    if (!bounds || !gridRef.value) return;

    const isInsideGrid =
      pointerX.value > bounds.left &&
      pointerX.value < bounds.right &&
      pointerY.value > bounds.top &&
      pointerY.value < bounds.bottom;

    if (!e.dataTransfer) return;

    if (isInsideGrid) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.dropEffect = "move";
    } else {
      e.dataTransfer.effectAllowed = "none";
      e.dataTransfer.dropEffect = "none";
    }
  }

  function handleDrag(e: DragEvent, itemOverrides: Partial<LayoutItem> = {}): void {
    dropState.value.pendingItem = { ...emptyLayoutItem, ...itemOverrides };
    dropState.value.targetId = dropState.value.pendingItem.i ?? "dropId";

    const bounds = containerRef.value?.getBoundingClientRect();
    if (!bounds || !gridRef.value) return;

    const { index, item, isInsideGrid } = getDropTargetInfo();
    if (!item || index == null) return;

    const gridItem = item as GridItemInternal;

    try {
      gridItem.wrapper.style.display = "none";
    } catch {
      // Ignore errors
    }

    Object.assign(gridItem.state, {
      top: pointerY.value - bounds.top,
      left: pointerX.value - bounds.left,
    });

    const gridPos = gridItem.calcXY(pointerY.value - bounds.top, pointerX.value - bounds.left);

    if (isInsideGrid) {
      gridRef.value.dragEvent(
        "dragstart",
        dropState.value.targetId,
        gridPos.x,
        gridPos.y,
        dropState.value.pendingItem.h,
        dropState.value.pendingItem.w,
      );
      dropState.value.pendingItem.i = dropState.value.pendingItem.i ?? generateNextId();
      dropState.value.pendingItem.x = layout.value[index].x;
      dropState.value.pendingItem.y = layout.value[index].y;
    } else {
      gridRef.value.dragEvent(
        "dragend",
        dropState.value.targetId,
        gridPos.x,
        gridPos.y,
        dropState.value.pendingItem.h,
        dropState.value.pendingItem.w,
      );
      layout.value = layout.value.filter((item) => item.i !== dropState.value.targetId);
    }
  }

  function computeColumnWidth(containerWidth: number, gap: number): number {
    return (containerWidth - gap * (columnCount.value + 1)) / columnCount.value;
  }

  function computeItemWidth(colWidth: number, gap: number): number {
    return Math.round(
      colWidth * dropState.value.pendingItem.w +
        Math.max(0, dropState.value.pendingItem.w - 1) * gap,
    );
  }

  function handleDragStart(e: DragEvent, itemOverrides: Partial<LayoutItem> = {}): void {
    dropState.value.pendingItem = { ...dropState.value.pendingItem, ...itemOverrides };

    sourceElement = e.target as HTMLElement;
    ghostElement = sourceElement.cloneNode(true) as HTMLElement;

    const itemHeight =
      dropState.value.pendingItem.h * cellHeight +
      (dropState.value.pendingItem.h - 1) * gridGap[0] +
      "px";

    const inner = ghostElement.getElementsByClassName(
      "dashboard-palette-item-inner",
    )[0] as HTMLElement;
    if (inner) {
      inner.style.minHeight = itemHeight;
      inner.style.maxHeight = itemHeight;
      inner.style.transform = "translate(0, 0)";
      inner.style.visibility = "hidden";
    }

    const colWidth = computeColumnWidth(
      (gridRef.value as unknown as GridLayoutInternal)?.state?.width ?? 800,
      gridGap[0],
    );
    const itemWidth = computeItemWidth(colWidth, gridGap[0]);

    ghostElement.style.position = "absolute";
    ghostElement.style.top = "-1000px";
    ghostElement.style.minWidth = itemWidth + "px";
    ghostElement.style.maxWidth = itemWidth + "px";
    ghostElement.style.minHeight = itemHeight;
    ghostElement.style.maxHeight = itemHeight;
    ghostElement.style.backgroundColor = "transparent";
    ghostElement.style.overflow = "hidden";
    ghostElement.style.boxShadow = "none";
    ghostElement.style.transform = "unset";
    ghostElement.classList.add("dragging");

    document.body.appendChild(ghostElement);
    e.dataTransfer?.setDragImage(ghostElement, e.offsetX, e.offsetY);
    setTimeout(() => ghostElement?.remove(), 0);

    sourceElement.style.transform = "unset";

    dropState.value.active = true;
  }

  function handleDragEnd(): LayoutItem | undefined {
    if (sourceElement) {
      sourceElement.style.transform = "";
      sourceElement = null;
    }

    const bounds = containerRef.value?.getBoundingClientRect();
    if (!bounds || !gridRef.value) {
      clearDropState();
      return;
    }

    if (dropState.value.aborted) {
      clearDropState();
      return;
    }

    const isInsideGrid =
      pointerX.value > bounds.left &&
      pointerX.value < bounds.right &&
      pointerY.value > bounds.top &&
      pointerY.value < bounds.bottom;

    if (isInsideGrid) {
      gridRef.value.dragEvent(
        "dragend",
        dropState.value.targetId,
        dropState.value.pendingItem.x,
        dropState.value.pendingItem.y,
        dropState.value.pendingItem.h,
        dropState.value.pendingItem.w,
      );
      layout.value = layout.value.filter((item) => item.i !== dropState.value.targetId);
    } else {
      clearDropState();
      return;
    }

    layout.value.push(dropState.value.pendingItem);

    gridRef.value.dragEvent(
      "dragend",
      dropState.value.pendingItem.i,
      dropState.value.pendingItem.x,
      dropState.value.pendingItem.y,
      dropState.value.pendingItem.h,
      dropState.value.pendingItem.w,
    );

    const item = gridRef.value.getItem(dropState.value.targetId);
    if (!item) {
      clearDropState();
      return;
    }

    try {
      (item as GridItemInternal).wrapper.style.display = "";
    } catch {
      // Ignore errors
    }

    const resultItem = dropState.value.pendingItem;
    clearDropState();
    return resultItem;
  }

  function generateNextId(): number {
    const numericIds = layout.value
      .filter((item) => isFinite(Number(item.i)))
      .map((item) => Number(item.i));
    return numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
  }

  function handleItemMove(_i: string | number, _newX: number, _newY: number): void {
    // Simplified move event - just log for now
    // Full swap logic can be added if needed
  }

  return {
    containerRef,
    gridRef,
    handleDrag,
    handleDragOver,
    handleDragEnd,
    handleDragStart,
    handleItemMove,
  };
}
