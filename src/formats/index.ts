import type { EditorProject } from "../editor-core/types";
import type { SerializeOptions } from "./common";
import { parsePlainText, serializePlainText } from "./plainText";
import { parseSrt, serializeSrt } from "./srt";
import { parseVtt, serializeVtt } from "./vtt";

export type SubtitleFormat = "srt" | "vtt" | "txt";

export function detectFormat(fileName: string, input: string): SubtitleFormat {
  if (/\.vtt$/i.test(fileName) || /^\uFEFF?WEBVTT/m.test(input)) return "vtt";
  if (/\.txt$/i.test(fileName)) return "txt";
  return "srt";
}

export function parseSubtitles(input: string, fileName: string) {
  const format = detectFormat(fileName, input);
  if (format === "vtt") return parseVtt(input, fileName);
  if (format === "txt") return parsePlainText(input, fileName);
  return parseSrt(input, fileName);
}

export function serializeSubtitles(project: EditorProject, format: SubtitleFormat, options: SerializeOptions = {}) {
  if (format === "vtt") return serializeVtt(project, options);
  if (format === "txt") return serializePlainText(project, options);
  return serializeSrt(project, options);
}

export type { SerializeOptions } from "./common";
