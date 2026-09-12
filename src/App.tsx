import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Download, FilePlus2, FolderOpen, Keyboard, Magnet, Pause, Play, Plus, Redo2, Scissors, SkipBack, SkipForward, Trash2, Undo2, Video, Waves, X } from "lucide-react";
import { EditorEngine } from "./editor-core/engine";
import { createCue, createProject, newId, type SubtitleCue } from "./editor-core/types";
import { formatClock, parseClock, secondsToUs, usToSeconds } from "./editor-core/time";
import { parseSubtitles, serializeSubtitles, type SubtitleFormat } from "./formats";
import { latestProject, saveProject } from "./persistence/database";
import { cueCps, validateProject } from "./quality/checks";
import { Timeline } from "./timeline/Timeline";
import { createWaveform } from "./media/waveform";
import "./styles.css";

const engine = new EditorEngine();
type ShortcutAction = "play" | "create" | "insertBefore" | "insertAfter" | "duplicate" | "setStart" | "setEnd" | "split" | "merge" | "loop" | "delete" | "previousCue" | "nextCue" | "stepBack" | "stepForward";
const defaultShortcuts: Record<ShortcutAction, string> = { play: "Space", create: "Enter", insertBefore: "Mod+Shift+Enter", insertAfter: "Mod+Enter", duplicate: "Mod+D", setStart: "I", setEnd: "O", split: "S", merge: "M", loop: "L", delete: "Delete", previousCue: "Shift+Tab", nextCue: "Tab", stepBack: "ArrowLeft", stepForward: "ArrowRight" };
const shortcutLabels: Record<ShortcutAction, string> = { play: "Play / pause", create: "Create cue at playhead", insertBefore: "Insert cue before", insertAfter: "Insert cue after", duplicate: "Duplicate cue", setStart: "Set cue start at playhead", setEnd: "Set cue end at playhead", split: "Split at playhead", merge: "Merge selected", loop: "Loop cue", delete: "Delete selected", previousCue: "Previous cue", nextCue: "Next cue", stepBack: "Step backward", stepForward: "Step forward" };
const eventShortcut = (event: KeyboardEvent | React.KeyboardEvent, ignoreShift = false) => {
  const parts: string[] = []; if (event.ctrlKey || event.metaKey) parts.push("Mod"); if (event.altKey) parts.push("Alt"); if (event.shiftKey && !ignoreShift) parts.push("Shift");
  const key = event.code === "Space" ? "Space" : event.key.length === 1 ? event.key.toUpperCase() : event.key; return [...parts, key].join("+");
};

function IconButton({ label, disabled, active, onClick, children }: { label: string; disabled?: boolean; active?: boolean; onClick(): void; children: React.ReactNode }) {
  return <button className={`icon-button${active ? " active" : ""}`} aria-label={label} title={label} disabled={disabled} onClick={onClick}>{children}</button>;
}

function TimeInput({ value, onCommit, label }: { value: number; onCommit(value: number): void; label: string }) {
  const [draft, setDraft] = useState(formatClock(value));
  useEffect(() => setDraft(formatClock(value)), [value]);
  const commit = () => { const parsed = parseClock(draft); if (parsed === null) setDraft(formatClock(value)); else onCommit(parsed); };
  return <input aria-label={label} className="time-input" value={draft} onChange={event => setDraft(event.target.value)} onBlur={commit} onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); if (event.key === "Escape") { setDraft(formatClock(value)); event.currentTarget.blur(); } }} />;
}

function SubtitleGrid({ cues, selectedIds, activeId, currentTimeUs }: { cues: SubtitleCue[]; selectedIds: string[]; activeId: string | null; currentTimeUs: number }) {
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]); const lastClicked = useRef<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null); const [scrollTop, setScrollTop] = useState(0); const [gridHeight, setGridHeight] = useState(400); const rowHeight = 34;
  useEffect(() => { const node = gridRef.current; if (!node) return; const observer = new ResizeObserver(([entry]) => setGridHeight(entry.contentRect.height)); observer.observe(node); return () => observer.disconnect(); }, []);
  useEffect(() => { if (!activeId || !gridRef.current) return; const index = cues.findIndex(cue => cue.id === activeId); if (index < 0) return; const top = index * rowHeight, bottom = top + rowHeight; if (top < gridRef.current.scrollTop) gridRef.current.scrollTop = top; else if (bottom > gridRef.current.scrollTop + gridRef.current.clientHeight) gridRef.current.scrollTop = bottom - gridRef.current.clientHeight; }, [activeId, cues]);
  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - 5), last = Math.min(cues.length, Math.ceil((scrollTop + gridHeight) / rowHeight) + 5), visibleCues = cues.slice(first, last);
  const click = (event: React.MouseEvent, id: string) => {
    if (event.shiftKey && lastClicked.current) { const a = cues.findIndex(c => c.id === lastClicked.current), b = cues.findIndex(c => c.id === id); engine.select(cues.slice(Math.min(a, b), Math.max(a, b) + 1).map(c => c.id), id); }
    else if (event.metaKey || event.ctrlKey) engine.toggleSelection(id); else engine.select([id], id);
    lastClicked.current = id;
  };
  return <div className="grid-panel panel">
    <div className="panel-heading"><strong>Subtitles</strong><span>{cues.length} cues</span></div>
    <div className="cue-grid-header"><span>#</span><span>In</span><span>Out</span><span>CPS</span><span>Text</span></div>
    <div className="cue-grid" ref={gridRef} role="grid" aria-label="Subtitle cues" onScroll={event => setScrollTop(event.currentTarget.scrollTop)}>
      <div className="cue-grid-window" style={{ height: cues.length * rowHeight }}>
      {visibleCues.map((cue, visibleIndex) => { const index = first + visibleIndex; return <button key={cue.id} role="row" aria-rowindex={index + 1} className={`cue-row${selected.has(cue.id) ? " selected" : ""}${activeId === cue.id ? " active" : ""}${currentTimeUs >= cue.startUs && currentTimeUs <= cue.endUs ? " playing" : ""}`} style={{ transform: `translateY(${index * rowHeight}px)` }} onClick={event => click(event, cue.id)}>
        <span>{index + 1}</span><span>{formatClock(cue.startUs).slice(3)}</span><span>{formatClock(cue.endUs).slice(3)}</span><span className={cueCps(cue) > 20 ? "metric-warning" : ""}>{cueCps(cue).toFixed(1)}</span><span>{cue.text.replace(/\n/g, " ↵ ") || <em>Empty subtitle</em>}</span>
      </button>; })}
      </div>
      {!cues.length && <div className="empty-grid">Open a subtitle file or press Enter to create your first cue.</div>}
    </div>
  </div>;
}

function Inspector({ cue }: { cue?: SubtitleCue }) {
  if (!cue) return <section className="inspector panel empty-inspector"><p>Select a subtitle to edit its text and timing.</p><span>Enter creates a cue at the playhead.</span></section>;
  const update = (patch: Partial<SubtitleCue>) => engine.dispatch({ type: "update-cue", id: cue.id, patch });
  return <section className="inspector panel">
    <div className="panel-heading"><strong>Cue editor</strong><span>{((cue.endUs - cue.startUs) / 1_000_000).toFixed(2)}s · {cueCps(cue).toFixed(1)} CPS</span></div>
    <div className="timing-fields"><label>Start<TimeInput label="Cue start" value={cue.startUs} onCommit={startUs => update({ startUs })} /></label><label>End<TimeInput label="Cue end" value={cue.endUs} onCommit={endUs => update({ endUs })} /></label></div>
    <textarea aria-label="Subtitle text" value={cue.text} autoFocus onChange={event => update({ text: event.target.value })} placeholder="Type subtitle text…" />
    <div className="text-metrics"><span>{cue.text.length} characters</span><span>{cue.text.trim() ? cue.text.trim().split(/\s+/).length : 0} words</span><span>{cue.text.split("\n").length} lines</span></div>
  </section>;
}

export default function App() {
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot); const cues = snapshot.project.tracks[0].cues;
  const activeCue = cues.find(cue => cue.id === snapshot.activeCueId); const issues = useMemo(() => validateProject(snapshot.project), [snapshot.project]);
  const videoRef = useRef<HTMLVideoElement>(null); const subtitlePicker = useRef<HTMLInputElement>(null); const videoPicker = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null); const [durationUs, setDurationUs] = useState(60_000_000); const [currentTimeUs, setCurrentTimeUs] = useState(0);
  const [playing, setPlaying] = useState(false); const [follow, setFollow] = useState(true); const [snap, setSnap] = useState(true); const [loop, setLoop] = useState(false);
  const [peaks, setPeaks] = useState<number[]>([]); const [notice, setNotice] = useState("Ready"); const [showIssues, setShowIssues] = useState(() => innerWidth > 700);
  const [exportFormat, setExportFormat] = useState<SubtitleFormat>("srt");
  const [shortcutOpen, setShortcutOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState<Record<ShortcutAction, string>>(() => {
    try { return { ...defaultShortcuts, ...JSON.parse(localStorage.getItem("tinycue-shortcuts") ?? "{}") }; } catch { return defaultShortcuts; }
  });
  const playbackCue = cues.find(cue => currentTimeUs >= cue.startUs && currentTimeUs < cue.endUs);

  useEffect(() => { latestProject().then(project => { if (project && !snapshot.dirty && !cues.length) { engine.dispatch({ type: "replace-project", project }); engine.markSaved(); setNotice(`Recovered ${project.title}`); } }).catch(() => undefined); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!snapshot.dirty) return; const revision = snapshot.revision; const timer = setTimeout(() => saveProject(snapshot.project).then(() => { engine.markSaved(revision); setNotice("Autosaved locally"); }).catch(() => setNotice("Autosave unavailable")), 700); return () => clearTimeout(timer); }, [snapshot.project, snapshot.dirty, snapshot.revision]);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (snapshot.dirty) event.preventDefault(); }; addEventListener("beforeunload", warn); return () => removeEventListener("beforeunload", warn); }, [snapshot.dirty]);

  const seek = useCallback((timeUs: number) => { const safe = Math.max(0, Math.min(durationUs, timeUs)); setCurrentTimeUs(safe); if (videoRef.current) videoRef.current.currentTime = usToSeconds(safe); }, [durationUs]);
  const togglePlay = () => { const video = videoRef.current; if (!video) return; if (video.paused) video.play().catch(() => setNotice("The browser could not play this media")); else video.pause(); };
  const openSubtitle = async (file: File) => {
    const result = parseSubtitles(await file.text(), file.name); engine.dispatch({ type: "replace-project", project: result.project });
    setExportFormat(result.project.sourceFormat ?? "srt"); setDurationUs(Math.max(60_000_000, result.project.tracks[0].cues.at(-1)?.endUs ?? 0)); setNotice(result.warnings.length ? `Opened with ${result.warnings.length} warning${result.warnings.length === 1 ? "" : "s"}` : `Opened ${file.name}`);
  };
  const openVideo = async (file: File) => {
    if (videoUrl) URL.revokeObjectURL(videoUrl); const url = URL.createObjectURL(file); setVideoUrl(url); setPeaks([]); setNotice(`Opened ${file.name} · building waveform…`);
    engine.dispatch({ type: "update-project", patch: { mediaName: file.name } });
    if (file.size > 150 * 1024 * 1024) setNotice("Video ready · waveform deferred for this large file");
    else createWaveform(file).then(value => { setPeaks(value); setNotice("Waveform ready"); }).catch(() => setNotice("Video ready · waveform unavailable for this codec"));
  };
  const download = (format: SubtitleFormat) => {
    const text = serializeSubtitles(snapshot.project, format); const blob = new Blob([text], { type: format === "vtt" ? "text/vtt;charset=utf-8" : "application/x-subrip;charset=utf-8" });
    const url = URL.createObjectURL(blob), anchor = document.createElement("a"); const base = (snapshot.project.sourceFileName ?? snapshot.project.title).replace(/\.[^.]+$/, "");
    anchor.href = url; anchor.download = `${base}.${format}`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 0); engine.markSaved(); setNotice(`Downloaded ${anchor.download}`);
  };
  const createAtCaret = () => engine.createAt(currentTimeUs);
  const split = () => { if (activeCue) engine.dispatch({ type: "split-cue", id: activeCue.id, atUs: currentTimeUs }); };
  const merge = () => engine.dispatch({ type: "merge-cues", ids: snapshot.selectedIds });
  const deleteSelected = () => engine.dispatch({ type: "delete-cues", ids: snapshot.selectedIds });
  const selectAdjacent = (direction: -1 | 1) => { const index = cues.findIndex(cue => cue.id === snapshot.activeCueId); const next = cues[Math.max(0, Math.min(cues.length - 1, (index < 0 ? (direction > 0 ? -1 : cues.length) : index) + direction))]; if (next) { engine.select([next.id], next.id); seek(next.startUs); } };
  const insertRelative = (side: "before" | "after") => {
    if (!activeCue) return createAtCaret(); const index = cues.findIndex(cue => cue.id === activeCue.id), gap = 80_000, duration = 2_000_000;
    if (side === "before") { const endUs = Math.max(1, activeCue.startUs - gap), floor = (cues[index - 1]?.endUs ?? -gap) + gap; engine.dispatch({ type: "add-cue", cue: createCue(Math.max(floor, endUs - duration), endUs) }); }
    else { const startUs = activeCue.endUs + gap, ceiling = (cues[index + 1]?.startUs ?? startUs + duration + gap) - gap; engine.dispatch({ type: "add-cue", cue: createCue(startUs, Math.max(startUs + 1, Math.min(startUs + duration, ceiling))) }); }
  };
  const duplicate = () => { if (!activeCue) return; const offset = 80_000; engine.dispatch({ type: "add-cue", cue: { ...activeCue, id: newId(), startUs: activeCue.endUs + offset, endUs: activeCue.endUs + offset + (activeCue.endUs - activeCue.startUs), locked: false } }); };
  const setShortcut = (action: ShortcutAction, value: string) => { const next = { ...shortcuts, [action]: value }; setShortcuts(next); localStorage.setItem("tinycue-shortcuts", JSON.stringify(next)); };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const editing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? engine.redo() : engine.undo(); return; }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") { event.preventDefault(); download(snapshot.project.sourceFormat ?? "srt"); return; }
      const shortcut = eventShortcut(event);
      if (shortcutOpen || (editing && !shortcut.startsWith("Mod+"))) return;
      if (shortcut === shortcuts.play) { event.preventDefault(); togglePlay(); }
      else if (shortcut === shortcuts.create) { event.preventDefault(); createAtCaret(); }
      else if (shortcut === shortcuts.insertBefore) { event.preventDefault(); insertRelative("before"); }
      else if (shortcut === shortcuts.insertAfter) { event.preventDefault(); insertRelative("after"); }
      else if (shortcut === shortcuts.duplicate) { event.preventDefault(); duplicate(); }
      else if (shortcut === shortcuts.setStart) { event.preventDefault(); if (activeCue) engine.dispatch({ type: "update-cue", id: activeCue.id, patch: { startUs: currentTimeUs } }); }
      else if (shortcut === shortcuts.setEnd) { event.preventDefault(); if (activeCue) engine.dispatch({ type: "update-cue", id: activeCue.id, patch: { endUs: currentTimeUs } }); }
      else if (shortcut === shortcuts.split) { event.preventDefault(); split(); }
      else if (shortcut === shortcuts.merge) { event.preventDefault(); merge(); }
      else if (shortcut === shortcuts.loop) setLoop(value => !value);
      else if (shortcut === shortcuts.delete) { event.preventDefault(); deleteSelected(); }
      else if (shortcut === shortcuts.previousCue) { event.preventDefault(); selectAdjacent(-1); }
      else if (shortcut === shortcuts.nextCue) { event.preventDefault(); selectAdjacent(1); }
      else if (shortcut === shortcuts.stepBack || eventShortcut(event, true) === shortcuts.stepBack) { event.preventDefault(); seek(currentTimeUs - (event.shiftKey ? 1_000_000 : 40_000)); }
      else if (shortcut === shortcuts.stepForward || eventShortcut(event, true) === shortcuts.stepForward) { event.preventDefault(); seek(currentTimeUs + (event.shiftKey ? 1_000_000 : 40_000)); }
    };
    addEventListener("keydown", handler); return () => removeEventListener("keydown", handler);
  });

  return <main className="app" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (!file) return; if (/\.(srt|vtt)$/i.test(file.name)) openSubtitle(file); else openVideo(file); }}>
    <header className="topbar">
      <div className="brand"><div className="brand-mark">TC</div><div><strong>TinyCue</strong><span>Local workspace</span></div></div>
      <nav className="top-actions">
        <button onClick={() => { engine.dispatch({ type: "replace-project", project: createProject() }); setNotice("New project"); }}><FilePlus2 />New</button>
        <button onClick={() => subtitlePicker.current?.click()}><FolderOpen />Open subtitles</button>
        <button onClick={() => videoPicker.current?.click()}><Video />Open video</button>
        <span className="divider" />
        <IconButton label="Undo" disabled={!snapshot.undoDepth} onClick={() => engine.undo()}><Undo2 /></IconButton>
        <IconButton label="Redo" disabled={!snapshot.redoDepth} onClick={() => engine.redo()}><Redo2 /></IconButton>
        <IconButton label="Keyboard shortcuts" onClick={() => setShortcutOpen(true)}><Keyboard /></IconButton>
      </nav>
      <div className="save-state"><span className={snapshot.dirty ? "dirty-dot" : "saved-dot"} />{snapshot.dirty ? "Unsaved changes" : notice}<select aria-label="Download format" value={exportFormat} onChange={event => setExportFormat(event.target.value as SubtitleFormat)}><option value="srt">SRT</option><option value="vtt">WebVTT</option></select><button className="download-button" onClick={() => download(exportFormat)}><Download />Download</button></div>
      <input ref={subtitlePicker} hidden type="file" accept=".srt,.vtt,text/vtt" onChange={event => { const file = event.target.files?.[0]; if (file) openSubtitle(file); event.currentTarget.value = ""; }} />
      <input ref={videoPicker} hidden type="file" accept="video/*,audio/*" onChange={event => { const file = event.target.files?.[0]; if (file) openVideo(file); event.currentTarget.value = ""; }} />
    </header>

    <section className="workspace">
      <div className="left-stack">
        <section className="video-panel panel">
          {videoUrl ? <div className="video-stage"><video ref={videoRef} src={videoUrl} onLoadedMetadata={event => setDurationUs(secondsToUs(event.currentTarget.duration))} onTimeUpdate={event => { const time = secondsToUs(event.currentTarget.currentTime); setCurrentTimeUs(time); if (loop && activeCue && time >= activeCue.endUs) seek(activeCue.startUs); }} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />{playbackCue && <div className="subtitle-preview">{playbackCue.text.split("\n").map((line, index) => <span key={index}>{line}</span>)}</div>}</div> : <button className="video-empty" onClick={() => videoPicker.current?.click()}><Video /><strong>Open a local video</strong><span>Your media stays in this browser.</span></button>}
          <div className="transport"><IconButton label="Previous cue" onClick={() => { const prior = [...cues].reverse().find(cue => cue.startUs < currentTimeUs - 1); if (prior) { engine.select([prior.id], prior.id); seek(prior.startUs); } }}><ChevronLeft /></IconButton><IconButton label="Frame backward" onClick={() => seek(currentTimeUs - 40_000)}><SkipBack /></IconButton><IconButton label={playing ? "Pause" : "Play"} onClick={togglePlay}>{playing ? <Pause /> : <Play />}</IconButton><IconButton label="Frame forward" onClick={() => seek(currentTimeUs + 40_000)}><SkipForward /></IconButton><IconButton label="Next cue" onClick={() => { const next = cues.find(cue => cue.startUs > currentTimeUs + 1); if (next) { engine.select([next.id], next.id); seek(next.startUs); } }}><ChevronRight /></IconButton><span className="transport-time">{formatClock(currentTimeUs)} <small>/ {formatClock(durationUs)}</small></span><select aria-label="Playback speed" defaultValue="1" onChange={event => { if (videoRef.current) videoRef.current.playbackRate = +event.target.value; }}><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select><button className={loop ? "mode active" : "mode"} onClick={() => setLoop(value => !value)}>Loop cue</button></div>
        </section>
        <Inspector cue={activeCue} />
      </div>
      <SubtitleGrid cues={cues} selectedIds={snapshot.selectedIds} activeId={snapshot.activeCueId} currentTimeUs={currentTimeUs} />
      {activeCue && <div className="mobile-inspector"><button className="mobile-close" aria-label="Close cue editor" onClick={() => engine.select([])}>×</button><Inspector cue={activeCue} /></div>}
    </section>

    <section className="timeline-panel panel">
      <div className="timeline-toolbar"><div><IconButton label="Create cue at playhead" onClick={createAtCaret}><Plus /></IconButton><button disabled={!activeCue} onClick={() => insertRelative("before")}>Insert before</button><button disabled={!activeCue} onClick={() => insertRelative("after")}>Insert after</button><IconButton label="Split at playhead" disabled={!activeCue} onClick={split}><Scissors /></IconButton><IconButton label="Delete selected" disabled={!snapshot.selectedIds.length} onClick={deleteSelected}><Trash2 /></IconButton><button disabled={snapshot.selectedIds.length < 2} onClick={merge}>Merge</button></div><div><button className={snap ? "mode active" : "mode"} onClick={() => setSnap(value => !value)}><Magnet />Snap</button><button className={follow ? "mode active" : "mode"} onClick={() => setFollow(value => !value)}><Waves />Follow</button><button className={showIssues ? "mode active" : "mode"} onClick={() => setShowIssues(value => !value)}><AlertTriangle />{issues.length} issues</button></div></div>
      <Timeline engine={engine} cues={cues} selectedIds={snapshot.selectedIds} currentTimeUs={currentTimeUs} durationUs={durationUs} peaks={peaks} follow={follow} snap={snap} onSeek={seek} />
    </section>

    {showIssues && <aside className="issues-panel panel"><div className="panel-heading"><strong>Quality</strong><button onClick={() => setShowIssues(false)}>Close</button></div><div className="issues-list">{issues.map(issue => <button key={issue.id} onClick={() => { engine.select([issue.cueId], issue.cueId); const cue = cues.find(item => item.id === issue.cueId); if (cue) seek(cue.startUs); }}><span className={issue.severity}><AlertTriangle /></span><strong>{issue.rule}</strong><span>{issue.message}</span></button>)}{!issues.length && <div className="quality-clear"><Check />No issues found in the current profile.</div>}</div></aside>}
    {shortcutOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShortcutOpen(false)}><section className="shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-title" onMouseDown={event => event.stopPropagation()}><div className="dialog-heading"><div><strong id="shortcut-title">Keyboard shortcuts</strong><span>Press a key combination to replace a shortcut.</span></div><IconButton label="Close shortcuts" onClick={() => setShortcutOpen(false)}><X /></IconButton></div><div className="shortcut-list">{(Object.keys(shortcutLabels) as ShortcutAction[]).map(action => { const conflict = Object.entries(shortcuts).some(([other, value]) => other !== action && value === shortcuts[action]); return <label key={action}><span>{shortcutLabels[action]}</span><input aria-label={`${shortcutLabels[action]} shortcut`} readOnly value={shortcuts[action]} className={conflict ? "conflict" : ""} onKeyDown={event => { event.preventDefault(); event.stopPropagation(); if (!["Control", "Meta", "Alt", "Shift"].includes(event.key)) setShortcut(action, eventShortcut(event)); }} />{conflict && <small>Conflict</small>}</label>; })}</div><div className="dialog-footer"><button onClick={() => { setShortcuts(defaultShortcuts); localStorage.removeItem("tinycue-shortcuts"); }}>Restore defaults</button><button className="primary" onClick={() => setShortcutOpen(false)}>Done</button></div></section></div>}
    <footer className="statusbar"><span>{notice}</span><span>Shift magnetizes to playhead · Alt bypasses snapping · Enter new cue · I/O set in/out</span></footer>
  </main>;
}
