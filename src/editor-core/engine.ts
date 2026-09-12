import { createCue, createProject, newId, type EditorCommand, type EditorProject, type EditorSnapshot, type SubtitleCue } from "./types";

type Listener = () => void;
interface HistoryEntry { project: EditorProject; selectedIds: string[]; activeCueId: string | null; }

const cloneProject = (project: EditorProject): EditorProject => structuredClone(project);
const byTime = (a: SubtitleCue, b: SubtitleCue) => a.startUs - b.startUs || a.endUs - b.endUs || a.id.localeCompare(b.id);

export class EditorEngine {
  private listeners = new Set<Listener>();
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private snapshot: EditorSnapshot;

  constructor(project = createProject()) {
    this.snapshot = { project, selectedIds: [], activeCueId: null, revision: 0, undoDepth: 0, redoDepth: 0, dirty: false };
  }

  subscribe = (listener: Listener) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  getSnapshot = () => this.snapshot;
  private emit() { for (const listener of this.listeners) listener(); }
  private historyEntry(): HistoryEntry {
    return { project: cloneProject(this.snapshot.project), selectedIds: [...this.snapshot.selectedIds], activeCueId: this.snapshot.activeCueId };
  }
  private publish(project: EditorProject, selectedIds = this.snapshot.selectedIds, activeCueId = this.snapshot.activeCueId, dirty = true) {
    project.updatedAt = Date.now();
    this.snapshot = { project, selectedIds, activeCueId, revision: this.snapshot.revision + 1, undoDepth: this.undoStack.length, redoDepth: this.redoStack.length, dirty };
    this.emit();
  }
  private cues(project = this.snapshot.project) { return project.tracks[0].cues; }
  private mutate(command: EditorCommand): { project: EditorProject; selectedIds?: string[]; activeCueId?: string | null } {
    const project = cloneProject(command.type === "replace-project" ? command.project : this.snapshot.project);
    const cues = this.cues(project);
    switch (command.type) {
      case "replace-project": return { project, selectedIds: [], activeCueId: null };
      case "update-project": Object.assign(project, command.patch); return { project };
      case "add-cue": {
        cues.push(structuredClone(command.cue)); cues.sort(byTime);
        return { project, selectedIds: [command.cue.id], activeCueId: command.cue.id };
      }
      case "update-cue": {
        const cue = cues.find(item => item.id === command.id);
        if (cue && !cue.locked) Object.assign(cue, command.patch);
        if (cue) { cue.startUs = Math.max(0, Math.round(cue.startUs)); cue.endUs = Math.max(cue.startUs + 1, Math.round(cue.endUs)); }
        cues.sort(byTime); return { project };
      }
      case "delete-cues": {
        const ids = new Set(command.ids); project.tracks[0].cues = cues.filter(cue => !ids.has(cue.id) || cue.locked);
        const next = project.tracks[0].cues.find(cue => cue.startUs >= (cues.find(cue => ids.has(cue.id))?.startUs ?? 0)) ?? project.tracks[0].cues.at(-1);
        return { project, selectedIds: next ? [next.id] : [], activeCueId: next?.id ?? null };
      }
      case "move-cues": {
        const ids = new Set(command.ids); const targets = cues.filter(cue => ids.has(cue.id) && !cue.locked);
        const minStart = Math.min(...targets.map(cue => cue.startUs)); const delta = Math.max(command.deltaUs, -minStart);
        targets.forEach(cue => { cue.startUs += delta; cue.endUs += delta; }); cues.sort(byTime); return { project };
      }
      case "shift-all": {
        const minStart = cues.length ? Math.min(...cues.map(cue => cue.startUs)) : 0; const delta = Math.max(command.deltaUs, -minStart);
        cues.filter(cue => !cue.locked).forEach(cue => { cue.startUs += delta; cue.endUs += delta; }); return { project };
      }
      case "split-cue": {
        const index = cues.findIndex(cue => cue.id === command.id); const cue = cues[index];
        if (!cue || cue.locked || command.atUs <= cue.startUs || command.atUs >= cue.endUs) return { project };
        const offset = command.textOffset ?? Math.floor(cue.text.length / 2);
        const boundary = cue.text.lastIndexOf(" ", Math.max(0, offset)) > 0 ? cue.text.lastIndexOf(" ", offset) : offset;
        const second = { ...cue, id: newId(), startUs: command.atUs, text: cue.text.slice(boundary).trimStart() };
        cue.endUs = command.atUs; cue.text = cue.text.slice(0, boundary).trimEnd(); cues.splice(index + 1, 0, second);
        return { project, selectedIds: [second.id], activeCueId: second.id };
      }
      case "merge-cues": {
        const ids = new Set(command.ids); const selected = cues.filter(cue => ids.has(cue.id)).sort(byTime);
        if (selected.length < 2 || selected.some(cue => cue.locked)) return { project };
        const merged = { ...selected[0], startUs: selected[0].startUs, endUs: Math.max(...selected.map(cue => cue.endUs)), text: selected.map(cue => cue.text).join("\n") };
        project.tracks[0].cues = cues.filter(cue => !ids.has(cue.id)); project.tracks[0].cues.push(merged); project.tracks[0].cues.sort(byTime);
        return { project, selectedIds: [merged.id], activeCueId: merged.id };
      }
    }
  }

  dispatch(command: EditorCommand) {
    this.undoStack.push(this.historyEntry()); if (this.undoStack.length > 500) this.undoStack.shift(); this.redoStack = [];
    const result = this.mutate(command);
    this.publish(result.project, result.selectedIds, result.activeCueId);
  }
  select(ids: string[], activeCueId = ids.at(-1) ?? null) {
    this.snapshot = { ...this.snapshot, selectedIds: [...new Set(ids)], activeCueId };
    this.emit();
  }
  toggleSelection(id: string) {
    const ids = this.snapshot.selectedIds.includes(id) ? this.snapshot.selectedIds.filter(item => item !== id) : [...this.snapshot.selectedIds, id];
    this.select(ids, id);
  }
  undo() {
    const previous = this.undoStack.pop(); if (!previous) return;
    this.redoStack.push(this.historyEntry()); this.publish(previous.project, previous.selectedIds, previous.activeCueId);
  }
  redo() {
    const next = this.redoStack.pop(); if (!next) return;
    this.undoStack.push(this.historyEntry()); this.publish(next.project, next.selectedIds, next.activeCueId);
  }
  markSaved(revision = this.snapshot.revision) {
    if (this.snapshot.revision !== revision) return;
    this.snapshot = { ...this.snapshot, dirty: false }; this.emit();
  }
  createAt(timeUs: number, durationUs = 2_000_000) { this.dispatch({ type: "add-cue", cue: createCue(timeUs, timeUs + durationUs) }); }
}
