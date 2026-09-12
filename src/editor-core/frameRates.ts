export const FRAME_RATES = [
  { id: "24000/1001", label: "23.976", numerator: 24_000, denominator: 1_001 },
  { id: "24/1", label: "24", numerator: 24, denominator: 1 },
  { id: "25/1", label: "25", numerator: 25, denominator: 1 },
  { id: "30000/1001", label: "29.97", numerator: 30_000, denominator: 1_001 },
  { id: "30/1", label: "30", numerator: 30, denominator: 1 },
  { id: "50/1", label: "50", numerator: 50, denominator: 1 },
  { id: "60000/1001", label: "59.94", numerator: 60_000, denominator: 1_001 },
  { id: "60/1", label: "60", numerator: 60, denominator: 1 },
] as const;

export type FrameRateId = (typeof FRAME_RATES)[number]["id"];

export function frameRateScale(sourceId: FrameRateId, targetId: FrameRateId) {
  const source = FRAME_RATES.find(rate => rate.id === sourceId);
  const target = FRAME_RATES.find(rate => rate.id === targetId);
  if (!source || !target) throw new Error("Unsupported frame rate");
  return {
    numerator: source.numerator * target.denominator,
    denominator: source.denominator * target.numerator,
  };
}
