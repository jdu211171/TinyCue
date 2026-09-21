import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";
import type { EditorEngine } from "../editor-core/engine";
import type { SubtitleCue } from "../editor-core/types";
import type { WaveformData } from "../media/waveform";
import { snapMoveToCaret } from "./snapping";

interface TimelineProps {
  engine: EditorEngine;
  cues: SubtitleCue[];
  selectedIds: string[];
  currentTimeUs: number;
  durationUs: number;
  waveform: WaveformData | null;
  follow: boolean;
  snap: boolean;
  onSeek(timeUs: number): void;
}

type Drag = { kind: "move" | "start" | "end"; cue: SubtitleCue; originX: number; initialStart: number; initialEnd: number };
const HEADER = 28, WAVE_TOP = 30, WAVE_HEIGHT = 66, CUE_TOP = 104, CUE_HEIGHT = 42;

export function Timeline({ engine, cues, selectedIds, currentTimeUs, durationUs, waveform, follow, snap, onSeek }: TimelineProps) {
  const scroller = useRef<HTMLDivElement>(null); const canvas = useRef<HTMLCanvasElement>(null);
  const [pxPerSecond, setPxPerSecond] = useState(100); const [scrollLeft, setScrollLeft] = useState(0); const [drag, setDrag] = useState<Drag | null>(null);
  const [preview, setPreview] = useState<{ startUs: number; endUs: number } | null>(null);
  const [snapHint, setSnapHint] = useState<string | null>(null);
  const contentWidth = Math.max(1, durationUs / 1_000_000 * pxPerSecond, scroller.current?.clientWidth ?? 800);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const usPerPixel = 1_000_000 / pxPerSecond;
  const snapTime = (timeUs: number, bypass: boolean, excludeId?: string) => {
    if (!snap || bypass) return Math.round(timeUs);
    const candidates = [0, currentTimeUs]; cues.filter(cue => cue.id !== excludeId).forEach(cue => candidates.push(cue.startUs, cue.endUs));
    const frame = Math.round(timeUs / (1_000_000 / 25)) * (1_000_000 / 25); candidates.push(frame);
    const tolerance = 10 * usPerPixel; let best = timeUs, distance = tolerance + 1;
    for (const candidate of candidates) { const d = Math.abs(candidate - timeUs); if (d < distance) { best = candidate; distance = d; } }
    return distance <= tolerance ? Math.round(best) : Math.round(timeUs);
  };

  useEffect(() => {
    if (!follow || drag || !scroller.current) return;
    const el = scroller.current; const caretX = currentTimeUs / 1_000_000 * pxPerSecond; const left = el.scrollLeft; const right = left + el.clientWidth;
    if (caretX < left + el.clientWidth * .18 || caretX > right - el.clientWidth * .22) {
      el.scrollTo({ left: Math.max(0, caretX - el.clientWidth * .35), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }, [currentTimeUs, follow, drag, pxPerSecond]);

  useEffect(() => {
    const node = canvas.current, host = scroller.current; if (!node || !host) return;
    const dpr = devicePixelRatio || 1, width = host.clientWidth, height = 154;
    node.width = width * dpr; node.height = height * dpr; node.style.width = `${width}px`; node.style.height = `${height}px`;
    const ctx = node.getContext("2d"); if (!ctx) return; ctx.scale(dpr, dpr);
    ctx.fillStyle = "#15181d"; ctx.fillRect(0, 0, width, height);
    const startUs = scrollLeft * usPerPixel, endUs = (scrollLeft + width) * usPerPixel;
    const secondsPerTick = pxPerSecond >= 200 ? .5 : pxPerSecond >= 80 ? 1 : pxPerSecond >= 30 ? 5 : 10;
    const firstTick = Math.floor(startUs / 1_000_000 / secondsPerTick) * secondsPerTick;
    ctx.font = "11px ui-monospace, monospace"; ctx.textBaseline = "top";
    for (let second = firstTick; second * 1_000_000 <= endUs; second += secondsPerTick) {
      const x = second * pxPerSecond - scrollLeft; ctx.strokeStyle = "#343943"; ctx.beginPath(); ctx.moveTo(x + .5, 18); ctx.lineTo(x + .5, height); ctx.stroke();
      ctx.fillStyle = "#9299a6"; const min = Math.floor(second / 60), sec = second % 60; ctx.fillText(`${min}:${sec.toFixed(secondsPerTick < 1 ? 1 : 0).padStart(2, "0")}`, x + 4, 4);
    }
    ctx.fillStyle = "#0d1014"; ctx.fillRect(0, WAVE_TOP, width, WAVE_HEIGHT);
    if (waveform) {
      const mid = WAVE_TOP + WAVE_HEIGHT / 2; const amplitude = WAVE_HEIGHT * .47 / waveform.normalization;
      const firstVisibleBin = Math.max(0, Math.floor(startUs / 1_000_000 * waveform.samplesPerSecond));
      const lastVisibleBin = Math.min(waveform.min.length, Math.ceil(endUs / 1_000_000 * waveform.samplesPerSecond));
      ctx.strokeStyle = "#293438"; ctx.beginPath(); ctx.moveTo(0, mid + .5); ctx.lineTo(width, mid + .5); ctx.stroke();
      ctx.fillStyle = "#67a9aa";
      for (let x = 0; x < width; x++) {
        const pixelStartUs = (scrollLeft + x) * usPerPixel;
        const pixelEndUs = pixelStartUs + usPerPixel;
        const from = Math.max(firstVisibleBin, Math.floor(pixelStartUs / 1_000_000 * waveform.samplesPerSecond));
        const to = Math.min(lastVisibleBin, Math.max(from + 1, Math.ceil(pixelEndUs / 1_000_000 * waveform.samplesPerSecond)));
        let low = 0; let high = 0;
        for (let index = from; index < to; index++) { low = Math.min(low, waveform.min[index] ?? 0); high = Math.max(high, waveform.max[index] ?? 0); }
        const top = Math.max(WAVE_TOP + 1, mid - high * amplitude);
        const bottom = Math.min(WAVE_TOP + WAVE_HEIGHT - 1, mid - low * amplitude);
        if (from < waveform.min.length) ctx.fillRect(x, top, 1, Math.max(1, bottom - top));
      }
    }
    for (const cue of cues) {
      const shown = drag?.cue.id === cue.id && preview ? { ...cue, ...preview } : cue;
      const x = shown.startUs / 1_000_000 * pxPerSecond - scrollLeft, w = Math.max(5, (shown.endUs - shown.startUs) / 1_000_000 * pxPerSecond);
      if (x > width || x + w < 0) continue;
      ctx.fillStyle = selected.has(cue.id) ? "#2d7f86" : "#394552"; ctx.strokeStyle = selected.has(cue.id) ? "#8ce1df" : "#637080"; ctx.lineWidth = selected.has(cue.id) ? 2 : 1;
      ctx.beginPath(); ctx.roundRect(x, CUE_TOP, w, CUE_HEIGHT, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#dfe7ef"; ctx.font = "12px system-ui"; ctx.save(); ctx.beginPath(); ctx.rect(x + 5, CUE_TOP + 4, Math.max(0, w - 10), CUE_HEIGHT - 8); ctx.clip(); ctx.fillText(cue.text.replace(/\n/g, " ") || "Empty subtitle", x + 6, CUE_TOP + 13); ctx.restore();
      if (selected.has(cue.id)) { ctx.fillStyle = "#b9ffff"; ctx.fillRect(x, CUE_TOP, 4, CUE_HEIGHT); ctx.fillRect(x + w - 4, CUE_TOP, 4, CUE_HEIGHT); }
    }
    const caret = currentTimeUs / 1_000_000 * pxPerSecond - scrollLeft;
    if (caret >= 0 && caret <= width) { ctx.strokeStyle = "#ffcc66"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(caret + .5, 0); ctx.lineTo(caret + .5, height); ctx.stroke(); ctx.fillStyle = "#ffcc66"; ctx.beginPath(); ctx.moveTo(caret - 5, 0); ctx.lineTo(caret + 5, 0); ctx.lineTo(caret, 7); ctx.fill(); }
    if (snapHint && caret >= 0 && caret <= width) { ctx.font = "600 11px system-ui"; const labelWidth = ctx.measureText(snapHint).width + 14; ctx.fillStyle = "#ffcc66"; ctx.fillRect(Math.min(width - labelWidth - 4, caret + 7), 7, labelWidth, 22); ctx.fillStyle = "#17130a"; ctx.fillText(snapHint, Math.min(width - labelWidth + 3, caret + 14), 12); }
  }, [cues, currentTimeUs, durationUs, waveform, pxPerSecond, scrollLeft, selected, drag, preview, contentWidth, usPerPixel, snapHint]);

  const pointerTime = (event: ReactPointerEvent | ReactMouseEvent) => (event.nativeEvent.offsetX + scrollLeft) * usPerPixel;
  const findHit = (event: ReactPointerEvent) => {
    if (event.nativeEvent.offsetY < CUE_TOP || event.nativeEvent.offsetY > CUE_TOP + CUE_HEIGHT) return null;
    const time = pointerTime(event); return [...cues].reverse().find(cue => time >= cue.startUs - 6 * usPerPixel && time <= cue.endUs + 6 * usPerPixel) ?? null;
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const cue = findHit(event);
    if (!cue) { onSeek(Math.max(0, pointerTime(event))); engine.select([]); return; }
    if (event.metaKey || event.ctrlKey) engine.toggleSelection(cue.id); else if (!selected.has(cue.id)) engine.select([cue.id], cue.id);
    const time = pointerTime(event), edge = 7 * usPerPixel; const kind = Math.abs(time - cue.startUs) <= edge ? "start" : Math.abs(time - cue.endUs) <= edge ? "end" : "move";
    event.currentTarget.setPointerCapture(event.pointerId); setDrag({ kind, cue, originX: event.clientX, initialStart: cue.startUs, initialEnd: cue.endUs }); setPreview({ startUs: cue.startUs, endUs: cue.endUs });
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drag) return; const delta = (event.clientX - drag.originX) * usPerPixel; let startUs = drag.initialStart, endUs = drag.initialEnd;
    setSnapHint(null);
    if (drag.kind === "move") {
      const rawStart = Math.max(0, drag.initialStart + delta), rawEnd = rawStart + drag.initialEnd - drag.initialStart;
      const caretSnap = !event.altKey && (event.shiftKey || snap) ? snapMoveToCaret(rawStart, rawEnd, currentTimeUs, 14 * usPerPixel) : null;
      if (caretSnap) { startUs = caretSnap.startUs; endUs = caretSnap.endUs; setSnapHint(`${caretSnap.edge === "start" ? "Start" : "End"} → playhead`); }
      else { startUs = snapTime(rawStart, event.altKey || event.shiftKey, drag.cue.id); endUs = startUs + drag.initialEnd - drag.initialStart; }
    }
    if (drag.kind === "start") { const raw = Math.max(0, drag.initialStart + delta), magnet = event.shiftKey && !event.altKey && Math.abs(raw - currentTimeUs) <= 14 * usPerPixel; startUs = Math.min(drag.initialEnd - 1, magnet ? currentTimeUs : snapTime(raw, event.altKey || event.shiftKey, drag.cue.id)); if (magnet) setSnapHint("Start → playhead"); }
    if (drag.kind === "end") { const raw = drag.initialEnd + delta, magnet = event.shiftKey && !event.altKey && Math.abs(raw - currentTimeUs) <= 14 * usPerPixel; endUs = Math.max(drag.initialStart + 1, magnet ? currentTimeUs : snapTime(raw, event.altKey || event.shiftKey, drag.cue.id)); if (magnet) setSnapHint("End → playhead"); }
    setPreview({ startUs, endUs });
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drag || !preview) return; event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag.kind === "move") engine.dispatch({ type: "move-cues", ids: selected.has(drag.cue.id) ? selectedIds : [drag.cue.id], deltaUs: preview.startUs - drag.initialStart });
    else engine.dispatch({ type: "update-cue", id: drag.cue.id, patch: preview });
    setDrag(null); setPreview(null); setSnapHint(null);
  };
  const onWheel = (event: WheelEvent) => {
    if (!(event.ctrlKey || event.metaKey)) return; event.preventDefault(); const host = scroller.current; if (!host) return;
    const rect = host.getBoundingClientRect(), pointer = event.clientX - rect.left, anchorUs = (host.scrollLeft + pointer) * usPerPixel;
    const next = Math.min(800, Math.max(20, pxPerSecond * Math.exp(-event.deltaY * .002)));
    setPxPerSecond(next); requestAnimationFrame(() => { if (scroller.current) scroller.current.scrollLeft = anchorUs / 1_000_000 * next - pointer; });
  };

  return <div className="timeline-shell">
    <div className="timeline-scroller" ref={scroller} onScroll={event => setScrollLeft(event.currentTarget.scrollLeft)} onWheel={onWheel}>
      <div className="timeline-spacer" style={{ width: contentWidth }} />
      <canvas ref={canvas} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onDoubleClick={event => onSeek(pointerTime(event))} aria-label="Subtitle timeline" />
    </div>
    <div className="zoom-control"><span>{Math.round(pxPerSecond)} px/s</span><input aria-label="Timeline zoom" type="range" min="20" max="800" value={pxPerSecond} onChange={event => setPxPerSecond(+event.target.value)} /></div>
  </div>;
}
