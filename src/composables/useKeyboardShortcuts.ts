import { onKeyStroke } from "@vueuse/core";

export interface KeyboardShortcutHandlers {
  onToggleEdit: () => void;
  onRefresh: () => void;
  onExitEdit: () => void;
}

function isTyping(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

/**
 * Composable for handling dashboard keyboard shortcuts.
 * - E: Toggle edit mode
 * - R: Refresh dashboard
 * - Escape: Exit edit mode
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  onKeyStroke("e", (e) => {
    if (!isTyping(e)) handlers.onToggleEdit();
  });

  onKeyStroke("r", (e) => {
    if (!isTyping(e)) handlers.onRefresh();
  });

  onKeyStroke("Escape", (e) => {
    if (!isTyping(e)) handlers.onExitEdit();
  });
}
