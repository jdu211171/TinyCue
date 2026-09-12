import { createCue, type EditorProject } from "../editor-core/types";
import { applyLineEnding, projectFromCues, type ParseResult, type SerializeOptions } from "./common";

const CUE_DURATION_US = 2_000_000;
const CUE_GAP_US = 80_000;

export function parsePlainText(input: string, fileName = "subtitles.txt"): ParseResult {
  const normalized = input.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const blocks = normalized.split(/\n{2,}/).map(block => block.replace(/^\n+|\n+$/g, "")).filter(Boolean);
  const cues = blocks.map((text, index) => {
    const startUs = index * (CUE_DURATION_US + CUE_GAP_US);
    return createCue(startUs, startUs + CUE_DURATION_US, text);
  });
  return { project: projectFromCues(cues, fileName, "txt"), warnings: [] };
}

export function serializePlainText(project: EditorProject, options: SerializeOptions = {}): string {
  const cues = project.tracks[0].cues.filter(cue => !options.selectedIds || options.selectedIds.has(cue.id));
  const output = cues.map(cue => cue.text).join("\n\n") + (cues.length ? "\n" : "");
  return applyLineEnding(output, options.lineEnding);
}
