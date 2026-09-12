import { describe, expect, it } from "vitest";
import { parsePlainText, serializePlainText } from "./plainText";
import { parseSrt, serializeSrt } from "./srt";
import { parseVtt, serializeVtt } from "./vtt";

describe("subtitle formats", () => {
  it("round-trips SRT text and timing", () => {
    const source = "1\n00:00:01,250 --> 00:00:03,500\nHello\nworld\n";
    const result = parseSrt(source, "sample.srt");
    expect(result.warnings).toEqual([]); expect(result.project.tracks[0].cues[0]).toMatchObject({ startUs: 1_250_000, endUs: 3_500_000, text: "Hello\nworld" });
    expect(serializeSrt(result.project)).toBe(source);
  });
  it("round-trips WebVTT cues", () => {
    const source = "WEBVTT\n\n00:01.000 --> 00:03.000\nHello\n";
    const project = parseVtt(source, "sample.vtt").project;
    expect(serializeVtt(project)).toBe("WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nHello\n");
  });
  it("reports malformed blocks while retaining valid cues", () => {
    const result = parseSrt("broken\n\n1\n00:00:01,000 --> 00:00:02,000\nValid\n");
    expect(result.project.tracks[0].cues).toHaveLength(1); expect(result.warnings).toHaveLength(1);
  });
  it("imports and exports multiline plain-text cues", () => {
    const source = "First cue\nwith two lines\n\nSecond cue\n";
    const project = parsePlainText(source, "sample.txt").project;
    expect(project.sourceFormat).toBe("txt");
    expect(project.tracks[0].cues.map(cue => cue.text)).toEqual(["First cue\nwith two lines", "Second cue"]);
    expect(serializePlainText(project)).toBe(source);
  });
  it("exports only selected cues with explicit numbering and CRLF endings", () => {
    const project = parseSrt("1\n00:00:01,000 --> 00:00:02,000\nFirst\n\n2\n00:00:03,000 --> 00:00:04,000\nSecond\n").project;
    const secondCue = project.tracks[0].cues[1];
    expect(serializeSrt(project, { selectedIds: new Set([secondCue.id]), startNumber: 42, lineEnding: "crlf" })).toBe(
      "42\r\n00:00:03,000 --> 00:00:04,000\r\nSecond\r\n",
    );
  });
});
