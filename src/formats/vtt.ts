import { createCue, type EditorProject } from "../editor-core/types";
import { formatClock, parseClock } from "../editor-core/time";
import { projectFromCues, type ParseResult, type ParseWarning } from "./common";

export function parseVtt(input: string, fileName = "subtitles.vtt"): ParseResult {
  const normalized = input.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const content = normalized.replace(/^WEBVTT[^\n]*\n+/, ""); const blocks = content.split(/\n{2,}/);
  const warnings: ParseWarning[] = []; const cues = []; let sourceLine = 2;
  for (const block of blocks) {
    const lines = block.split("\n"); const timingIndex = lines.findIndex(line => line.includes("-->"));
    if (timingIndex < 0) { sourceLine += lines.length + 1; continue; }
    const [startRaw, endPart] = lines[timingIndex].split("-->").map(value => value.trim());
    const endRaw = endPart.split(/\s+/)[0];
    const parseVttClock = (value: string) => parseClock(value.split(":").length === 2 ? `00:${value}` : value);
    const startUs = parseVttClock(startRaw); const endUs = parseVttClock(endRaw);
    if (startUs === null || endUs === null || endUs <= startUs) { warnings.push({ line: sourceLine + timingIndex, message: "Skipped invalid cue timing" }); sourceLine += lines.length + 1; continue; }
    cues.push(createCue(startUs, endUs, lines.slice(timingIndex + 1).join("\n").replace(/\n+$/, ""))); sourceLine += lines.length + 1;
  }
  return { project: projectFromCues(cues, fileName, "vtt"), warnings };
}

export function serializeVtt(project: EditorProject, selectedIds?: Set<string>): string {
  const cues = project.tracks[0].cues.filter(cue => !selectedIds || selectedIds.has(cue.id));
  return "WEBVTT\n\n" + cues.map(cue => `${formatClock(cue.startUs)} --> ${formatClock(cue.endUs)}\n${cue.text}`).join("\n\n") + (cues.length ? "\n" : "");
}
