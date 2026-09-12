import type { Microseconds } from "./types";

export const SECOND = 1_000_000;

export function parseClock(value: string): Microseconds | null {
  const normalized = value.trim().replace(",", ".");
  const match = normalized.match(/^(?:(\d+):)?(\d{1,2}):(\d{2})(?:\.(\d{1,6}))?$/);
  if (!match) return null;
  const [, hours = "0", minutes, seconds, fraction = ""] = match;
  if (+minutes > 59 || +seconds > 59) return null;
  return (+hours * 3600 + +minutes * 60 + +seconds) * SECOND + +(fraction.padEnd(6, "0"));
}

export function formatClock(us: Microseconds, separator: "." | "," = "."): string {
  const safe = Math.max(0, Math.round(us));
  const totalSeconds = Math.floor(safe / SECOND);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((safe % SECOND) / 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}${separator}${String(milliseconds).padStart(3, "0")}`;
}

export function secondsToUs(seconds: number): Microseconds { return Math.round(seconds * SECOND); }
export function usToSeconds(us: Microseconds): number { return us / SECOND; }
