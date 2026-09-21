import { describe, expect, it } from "vitest";
import { summarizeAudio } from "./waveform";

describe("waveform analysis", () => {
  it("keeps signed min/max detail at a fixed temporal resolution", () => {
    const waveform = summarizeAudio([
      new Float32Array([-.5, .25, -.75, .5, -.25, 1, -.1, .1]),
    ], 8, 2);

    expect(waveform.samplesPerSecond).toBe(2);
    expect(Array.from(waveform.min)).toEqual([-.75, -.25]);
    expect(Array.from(waveform.max)).toEqual([.5, 1]);
    expect(waveform.normalization).toBeGreaterThan(0);
  });

  it("combines every audio channel", () => {
    const waveform = summarizeAudio([
      new Float32Array([-.2, .2]),
      new Float32Array([-.8, .7]),
    ], 2, 1);

    expect(waveform.min[0]).toBeCloseTo(-.8);
    expect(waveform.max[0]).toBeCloseTo(.7);
  });
});
