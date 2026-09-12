import { createCue, type EditorProject } from "../editor-core/types";
import { formatClock, parseClock } from "../editor-core/time";
import { projectFromCues, type ParseResult, type ParseWarning } from "./common";

export function parseSrt(input: string, fileName = "subtitles.srt"): ParseResult {
  const normalized = input.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const blocks = normalized.split(/\n{2,}/); const warnings: ParseWarning[] = []; const cues = [];
  let sourceLine = 1;
  for (const block of blocks) {
    const lines = block.split("\n");
    if (!lines.some(line => line.trim())) { sourceLine += lines.length + 1; continue; }
    const timingIndex = lines.findIndex(line => line.includes("-->"));
    if (timingIndex < 0) { warnings.push({ line: sourceLine, message: "Skipped block without a timing line" }); sourceLine += lines.length + 1; continue; }
    const [startRaw, endRaw] = lines[timingIndex].split("-->").map(value => value.trim().split(/\s+/)[0]);
    const startUs = parseClock(startRaw); const endUs = parseClock(endRaw);
    if (startUs === null || endUs === null || endUs <= startUs) {
      warnings.push({ line: sourceLine + timingIndex, message: "Skipped invalid time range" }); sourceLine += lines.length + 1; continue;
    }
    cues.push(createCue(startUs, endUs, lines.slice(timingIndex + 1).join("\n").replace(/\n+$/, "")));
    sourceLine += lines.length + 1;
  }
  return { project: projectFromCues(cues, fileName, "srt"), warnings };
}

export function serializeSrt(project: EditorProject, selectedIds?: Set<string>): string {
  const cues = project.tracks[0].cues.filter(cue => !selectedIds || selectedIds.has(cue.id));
  return cues.map((cue, index) => `${index + 1}\n${formatClock(cue.startUs, ",")} --> ${formatClock(cue.endUs, ",")}\n${cue.text}`).join("\n\n") + (cues.length ? "\n" : "");
}
