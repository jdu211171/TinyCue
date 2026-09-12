import type { EditorProject } from "../editor-core/types";
import { parseSrt, serializeSrt } from "./srt";
import { parseVtt, serializeVtt } from "./vtt";

export type SubtitleFormat = "srt" | "vtt";

export function detectFormat(fileName: string, input: string): SubtitleFormat {
  if (/\.vtt$/i.test(fileName) || /^\uFEFF?WEBVTT/m.test(input)) return "vtt";
  return "srt";
}

export function parseSubtitles(input: string, fileName: string) {
  const format = detectFormat(fileName, input);
  return format === "vtt" ? parseVtt(input, fileName) : parseSrt(input, fileName);
}

export function serializeSubtitles(project: EditorProject, format: SubtitleFormat, selectedIds?: Set<string>) {
  return format === "vtt" ? serializeVtt(project, selectedIds) : serializeSrt(project, selectedIds);
}
