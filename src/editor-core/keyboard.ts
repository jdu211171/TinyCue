export function shouldDeleteSelectedCues(shortcut: string, configuredShortcut: string, editing: boolean, selectionCount: number): boolean {
  if (editing || selectionCount === 0) return false;
  return shortcut === configuredShortcut || shortcut === "Backspace";
}

export function shouldTogglePlaybackWhileEditing(code: string, ctrlKey: boolean, metaKey: boolean, altKey: boolean): boolean {
  return code === "Space" && ctrlKey && !metaKey && !altKey;
}
