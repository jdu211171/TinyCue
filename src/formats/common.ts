import { createProject, type EditorProject, type SubtitleCue } from "../editor-core/types";

export interface ParseWarning { line: number; message: string; }
export interface ParseResult { project: EditorProject; warnings: ParseWarning[]; }

export function projectFromCues(cues: SubtitleCue[], fileName: string, format: "srt" | "vtt"): EditorProject {
  const project = createProject(fileName.replace(/\.[^.]+$/, "") || "Untitled project");
  project.sourceFileName = fileName;
  project.sourceFormat = format;
  project.tracks[0].cues = cues.sort((a, b) => a.startUs - b.startUs);
  return project;
}
