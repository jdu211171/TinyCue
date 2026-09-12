export type Microseconds = number;

export interface SubtitleCue {
  id: string;
  startUs: Microseconds;
  endUs: Microseconds;
  text: string;
  styleId: string | null;
  speaker: string | null;
  notes: string;
  locked: boolean;
  status: "draft" | "review" | "approved";
}

export interface SubtitleTrack {
  id: string;
  name: string;
  language: string | null;
  kind: "original" | "translation" | "captions";
  cues: SubtitleCue[];
}

export interface EditorProject {
  id: string;
  schemaVersion: 1;
  title: string;
  sourceFileName: string | null;
  sourceFormat: "srt" | "vtt" | null;
  mediaName: string | null;
  tracks: SubtitleTrack[];
  createdAt: number;
  updatedAt: number;
}

export interface EditorSnapshot {
  project: EditorProject;
  selectedIds: string[];
  activeCueId: string | null;
  revision: number;
  undoDepth: number;
  redoDepth: number;
  dirty: boolean;
}

export type EditorCommand =
  | { type: "replace-project"; project: EditorProject }
  | { type: "update-project"; patch: Partial<Pick<EditorProject, "title" | "mediaName" | "sourceFileName" | "sourceFormat">> }
  | { type: "add-cue"; cue: SubtitleCue }
  | { type: "update-cue"; id: string; patch: Partial<Omit<SubtitleCue, "id">>; label?: string }
  | { type: "delete-cues"; ids: string[] }
  | { type: "move-cues"; ids: string[]; deltaUs: number }
  | { type: "split-cue"; id: string; atUs: number; textOffset?: number }
  | { type: "merge-cues"; ids: string[] }
  | { type: "shift-all"; deltaUs: number };

export function newId(prefix = "cue"): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createCue(startUs: number, endUs: number, text = ""): SubtitleCue {
  return {
    id: newId(), startUs: Math.max(0, Math.round(startUs)), endUs: Math.max(Math.round(startUs) + 1, Math.round(endUs)),
    text, styleId: null, speaker: null, notes: "", locked: false, status: "draft",
  };
}

export function createProject(title = "Untitled project"): EditorProject {
  const now = Date.now();
  return {
    id: newId("project"), schemaVersion: 1, title, sourceFileName: null, sourceFormat: null, mediaName: null,
    tracks: [{ id: newId("track"), name: "Subtitles", language: null, kind: "captions", cues: [] }],
    createdAt: now, updatedAt: now,
  };
}
