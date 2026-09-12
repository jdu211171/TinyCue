import { describe, expect, it } from "vitest";
import { snapMoveToCaret } from "./snapping";

describe("caret magnet", () => {
  it("attaches the nearest start edge while preserving duration", () => {
    expect(snapMoveToCaret(1_990_000, 3_490_000, 2_000_000, 20_000)).toEqual({ startUs: 2_000_000, endUs: 3_500_000, edge: "start" });
  });
  it("attaches the nearest end edge while preserving duration", () => {
    expect(snapMoveToCaret(500_000, 2_010_000, 2_000_000, 20_000)).toEqual({ startUs: 490_000, endUs: 2_000_000, edge: "end" });
  });
  it("does not pull a distant cue", () => expect(snapMoveToCaret(0, 1_000_000, 2_000_000, 20_000)).toBeNull());
});
