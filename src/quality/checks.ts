import type { EditorProject, SubtitleCue } from "../editor-core/types";

export interface QualityIssue {
  id: string;
  cueId: string;
  severity: "warning" | "error";
  rule: string;
  message: string;
}

const plainLength = (text: string) => text.replace(/<[^>]+>/g, "").length;

export function cueCps(cue: SubtitleCue): number {
  return plainLength(cue.text) / Math.max(0.001, (cue.endUs - cue.startUs) / 1_000_000);
}

export function validateProject(project: EditorProject): QualityIssue[] {
  const issues: QualityIssue[] = []; const cues = project.tracks[0].cues;
  cues.forEach((cue, index) => {
    const duration = (cue.endUs - cue.startUs) / 1_000_000; const lines = cue.text.split("\n"); const cps = cueCps(cue);
    if (!cue.text.trim()) issues.push({ id: `empty-${cue.id}`, cueId: cue.id, severity: "error", rule: "Empty cue", message: "Cue has no text" });
    if (duration < 1) issues.push({ id: `short-${cue.id}`, cueId: cue.id, severity: "warning", rule: "Short duration", message: `${duration.toFixed(2)}s is below 1.00s` });
    if (duration > 7) issues.push({ id: `long-${cue.id}`, cueId: cue.id, severity: "warning", rule: "Long duration", message: `${duration.toFixed(2)}s exceeds 7.00s` });
    if (cps > 20) issues.push({ id: `cps-${cue.id}`, cueId: cue.id, severity: "warning", rule: "Reading speed", message: `${cps.toFixed(1)} CPS exceeds 20` });
    if (lines.length > 2) issues.push({ id: `lines-${cue.id}`, cueId: cue.id, severity: "warning", rule: "Line count", message: `${lines.length} lines exceeds 2` });
    if (Math.max(...lines.map(line => plainLength(line))) > 42) issues.push({ id: `length-${cue.id}`, cueId: cue.id, severity: "warning", rule: "Line length", message: "A line exceeds 42 characters" });
    const next = cues[index + 1];
    if (next && cue.endUs > next.startUs) issues.push({ id: `overlap-${cue.id}`, cueId: cue.id, severity: "error", rule: "Overlap", message: `Overlaps the next cue by ${((cue.endUs - next.startUs) / 1000).toFixed(0)} ms` });
    else if (next && next.startUs - cue.endUs < 80_000) issues.push({ id: `gap-${cue.id}`, cueId: cue.id, severity: "warning", rule: "Small gap", message: "Gap to next cue is below 80 ms" });
  });
  return issues;
}
