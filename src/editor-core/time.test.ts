import { describe, expect, it } from "vitest";
import { formatClock, parseClock } from "./time";

describe("timecode", () => {
  it("parses and formats millisecond timecodes", () => {
    expect(parseClock("01:02:03,456")).toBe(3_723_456_000);
    expect(formatClock(3_723_456_000, ",")).toBe("01:02:03,456");
  });
  it("rejects invalid fields", () => expect(parseClock("00:72:00.000")).toBeNull());
});
