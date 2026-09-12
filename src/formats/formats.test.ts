import { describe, expect, it } from "vitest";
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
});
