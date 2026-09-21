import { describe, expect, it } from "vitest";
import { shouldDeleteSelectedCues } from "./keyboard";

describe("cue deletion shortcuts", () => {
  it("accepts Backspace and the configured delete shortcut for selected cues", () => {
    expect(shouldDeleteSelectedCues("Backspace", "Delete", false, 1)).toBe(true);
    expect(shouldDeleteSelectedCues("Delete", "Delete", false, 2)).toBe(true);
  });

  it("does not delete cues while editing or when selection is empty", () => {
    expect(shouldDeleteSelectedCues("Backspace", "Delete", true, 1)).toBe(false);
    expect(shouldDeleteSelectedCues("Delete", "Delete", true, 1)).toBe(false);
    expect(shouldDeleteSelectedCues("Backspace", "Delete", false, 0)).toBe(false);
  });
});
