export interface MoveSnapResult {
  startUs: number;
  endUs: number;
  edge: "start" | "end";
}

export function snapMoveToCaret(startUs: number, endUs: number, caretUs: number, toleranceUs: number): MoveSnapResult | null {
  const startDistance = Math.abs(startUs - caretUs), endDistance = Math.abs(endUs - caretUs);
  if (Math.min(startDistance, endDistance) > toleranceUs) return null;
  if (startDistance <= endDistance) return { startUs: caretUs, endUs: caretUs + (endUs - startUs), edge: "start" };
  return { startUs: caretUs - (endUs - startUs), endUs: caretUs, edge: "end" };
}
