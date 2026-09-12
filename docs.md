  # TinyCue Product and Technical Plan

  ## Summary

  Build a clean-room React 19 + TypeScript subtitle editor informed by the initial prototype and product research. Use historical behavior only as a planning
  and visual reference.

  The first production release will:

  - Match every practical behavior in the current online editor.
  - Add the twelve priority timeline and editing capabilities.
  - Work offline for local media, waveform generation, editing, validation, autosave, and SRT/WebVTT export.
  - Support files under 500 MB across current Chrome, Edge, Firefox, and Safari.
  - Use a multi-track, multilingual-ready model while initially presenting a simple single-track workflow.
  - Remain suitable for proprietary distribution through permissive or commercially compatible dependencies.

  Create docs/feature-matrix.md containing every requested feature as an individual row with: identifier, prototype status, target behavior, subsystem, dependency,
  milestone, and acceptance test.

  ## Architecture and Technology Choices

Area                     Implementation
━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Application shell        React 19, strict TypeScript, Vite, CSS Modules and design tokens
──────────────────────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Editor state             Framework-independent EditorEngine; React subscribes through useSyncExternalStore so playback frames do not rerender the application
──────────────────────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Mutations and history    Typed commands with Immer patches; drag and text input changes coalesce into single undo operations
──────────────────────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Timeline                 Custom layered Canvas 2D renderer, native scroll container, Pointer Events, requestAnimationFrame, and optional OffscreenCanvas worker
──────────────────────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Subtitle grid            TanStack Virtual with stable cue IDs for projects containing 10,000+ cues
──────────────────────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Panels and menus         react-resizable-panels and Radix UI primitives
──────────────────────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Playback                 HTML5 <video> plus requestVideoFrameCallback; fall back to requestAnimationFrame and currentTime
──────────────────────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Media parsing            Mediabunny for streaming metadata, actual frame timestamps, multiple tracks, waveform samples, and thumbnails
──────────────────────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Heavy fallback           Lazy-loaded single-thread ffmpeg.wasm; enable multithreading only when crossOriginIsolated is available
──────────────────────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Subtitle formats         Clean-room SRT/WebVTT adapters initially; chardet and iconv-lite for encoding; ASS through ass-compiler and JASSUB later
──────────────────────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Local persistence        Dexie/IndexedDB for documents and history; OPFS for waveform tiles, thumbnails, and recoverable working files
──────────────────────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Offline application      Service worker caches the application shell and ordinary workers; FFmpeg and ASS WASM assets load on demand and are cached after first use
──────────────────────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Collaboration            A future CollaborationAdapter implemented with Yjs, WebSocket synchronization, IndexedDB persistence, and awareness
──────────────────────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Testing                  Vitest, Playwright across Chromium/Firefox/WebKit, fast-check property tests, and deterministic media fixtures

  Mediabunny is preferred over FFmpeg for ordinary analysis because it provides streaming file access, microsecond timing, sample iteration, thumbnails, multiple
  tracks, and WebCodecs-backed decoding without copying the whole file into WASM memory. Its MPL-2.0 license permits closed-source use when the library itself is not
  modified. Mediabunny overview, media sinks.

  ffmpeg.wasm remains a fallback because its core download is roughly 31 MB and its multithreaded build requires SharedArrayBuffer and cross-origin isolation.
  ffmpeg.wasm usage.

  WaveSurfer.js will not own the editor timeline. Its regions and timeline plugins are useful for simple waveform players, but a custom renderer is required for
  multiple tracks, selection layers, work areas, independent scroll interpolation, thumbnails, snapping, and deterministic undo. WaveSurfer plugin APIs.

  ## Core Interfaces and Data Model

  Use integer microseconds for persisted timing. Store nominal frame rate as a rational number and build an actual frame timestamp index for variable-frame-rate media.

  interface EditorProject {
    id: string;
    schemaVersion: number;
    title: string;
    media: MediaReference | null;
    tracks: SubtitleTrack[];
    markers: TimelineMarker[];
    styles: Record<string, SubtitleStyle>;
    workArea: { startUs: number; endUs: number } | null;
    settings: ProjectSettings;
  }

  interface SubtitleTrack {
    id: string;
    language: string; // BCP 47
    name: string;
    role: "original" | "translation" | "captions";
    cues: SubtitleCue[];
  }

  interface SubtitleCue {
    id: string;
    startUs: number;
    endUs: number;
    text: string;
    styleId: string | null;
    speaker: string | null;
    notes: string;
    locked: boolean;
    timingLinkId: string | null;
    status: "draft" | "review" | "approved";
  }

  Required subsystem interfaces:

  - EditorEngine.dispatch(command) is the only path for document mutations.
  - MediaClock exposes exact media time, current presentation-frame timestamp, playback state, and looping state independently from React.
  - FormatAdapter provides detect, parse, validate, and serialize operations.
  - MediaAnalyzer streams metadata, waveform peaks, silence ranges, scenes, frame timestamps, and thumbnails.
  - ProjectRepository handles schema migration, autosave, checkpoints, recovery, import, and project export.
  - CollaborationAdapter translates editor commands into collaborative transactions without changing the local command API.

  Snapping receives candidate timestamps from frames, cue boundaries, markers, waveform peaks, silence edges, scene changes, and keyframes. It chooses the nearest
  enabled candidate within a pixel-based tolerance converted to microseconds. Holding the configured bypass modifier disables snapping for that gesture.

  The video caret always uses exact media time. Follow scrolling interpolates only the viewport position. requestVideoFrameCallback supplies the presented frame’s
  media timestamp when available. Web video frame callback, WebCodecs specification.

  ## Feature Delivery

  ### Foundation and Existing-Editor Parity

  Reimplement and verify:

  - New, open, restore, save, download, plain-text export, drag-and-drop, encoding detection, and filename preservation.
  - Local file and URL video loading, media metadata, waveform-file and scene-change import.
  - Subtitle grid selection, Ctrl/Cmd and Shift range selection, playback selection preservation, and seek-on-double-click.
  - Auto-break, un-break, CPS, duration, line-length warnings, preview overlay, settings, and auto-selection during playback.
  - Play, pause, configurable jumps, play-current, play-next, insert, start-plus-offset-rest, global delay, and frame-rate conversion.
  - Timeline waveform, ruler, cue blocks, new-region drawing, drag, edge resize, split, merge, insert-before/after, delete, scene markers, context menus, and
    horizontal wheel navigation.

  - Replace the current server-dependent SRT/VTT parsing and export with local format adapters.
  - Replace localStorage backup with versioned IndexedDB projects and OPFS derivative caches.

  ### First-Release Professional Timing

  Deliver the twelve priority capabilities:

  1. Smooth native inertial scrolling with wheel, Shift-wheel, pinch zoom, and reduced-motion handling.
  2. Exact caret driven by presented media time.
  3. Configurable magnet and snap sources with modifier bypass.
  4. Split at caret with text split at the nearest word boundary.
  5. Cue dragging and edge resizing with live preview and one undo transaction per gesture.
  6. CFR and VFR-aware frame stepping using the media frame timestamp index.
  7. Loop-current and loop-selection playback.
  8. Follow-playback, center-caret, keep-current-visible, and scroll-lock modes.
  9. Progressive waveform generation using Mediabunny audio samples, multiresolution peak tiles, and OPFS caching.
  10. Unlimited session undo/redo plus persisted operation history and recovery checkpoints.
  11. Configurable keyboard shortcuts with conflict detection and Subtitle Edit/Aegisub presets.
  12. Incremental quality validation with an issue panel that jumps to and selects the affected cue.

  First-release import/export formats are SRT and WebVTT, including BOM handling, common legacy encodings, CRLF/LF choice, cue settings, multiline text, renumbering,
  selected-cue export, and clipboard workflows.

  ### Extended Editing and Quality

  Add the full creation, timing, split/merge, selection, search, cleanup, reading-speed, punctuation, speaker, overlap, gap, and batch-adjustment lists. Every
  operation must be a typed command with deterministic undo.

  Use a native multiline editor initially for reliable IME, RTL, and CJK behavior. Add CodeMirror only for the later ASS override-tag editor. Native spellchecking
  works locally; grammar checking uses an optional LanguageTool-compatible provider and remains visibly separate from deterministic subtitle quality rules.

  Validation runs incrementally for the changed cue and its neighbors. Full-project audits run in a worker and return:

  interface QualityIssue {
    id: string;
    cueId: string;
    ruleId: string;
    severity: "info" | "warning" | "error";
    message: string;
    textRange?: { from: number; to: number };
  }

  ### Advanced Media, Styling, and Formats

  - Generate zoom-dependent thumbnail strips with Mediabunny CanvasSink.
  - Detect silence from decoded audio windows and scene changes from downscaled-frame histogram differences.
  - Support multiple audio tracks, normalization, markers, chapters, work areas, keyframe snapping, and cached analysis.
  - Implement reverse preview as muted decoded-frame playback; native HTML video remains the normal forward-playback path.
  - Add ASS/SSA parsing and style editing through ass-compiler, with JASSUB/libass WASM for accurate preview. JASSUB.
  - Add TTML/DFXP, SBV, CSV, plain text, SCC, and STL as isolated format adapters with official-format fixtures.
  - Implement burned-in export through Mediabunny decode/canvas-composite/WebCodecs encode and mux. Use FFmpeg WASM only when the required browser encoder or container
    is unavailable.

  - Add safe-area guides, positioning, style presets, per-cue styling, fonts, outlines, shadows, boxes, and ASS margins.

  ### Multilingual and Collaboration

  - Expose the already-supported multi-track model as original/translation columns with linked or independent timings.
  - Add translation completeness, glossary checks, length comparisons, RTL/CJK layout, speaker consistency, and provider adapters.
  - Add Yjs collaboration through the existing command boundary: remote cursors, comments, assignments, approvals, activity, version comparison, and offline
    reconciliation. Yjs supports both IndexedDB persistence and interchangeable network providers. Yjs offline support.

  - Introduce cloud accounts, workspaces, permissions, review links, and media storage only in this milestone; the local editor continues working without them.

  ## Validation and Acceptance

  - Preserve the current bundle as a Playwright reference route and create parity tests for each recovered command and setting.
  - Add parser golden tests for valid, malformed, BOM, legacy-encoded, RTL, CJK, multiline, styled, overlapping, and frame-based subtitle fixtures.
  - Property-test timing commands: undo restores exact state, redo restores exact result, cue IDs remain stable, durations never become negative unless explicitly
    allowed, and frame-rounding is idempotent.

  - Run browser tests in Chromium, Firefox, and WebKit for file import, drag/resize, wheel and pinch behavior, playback following, frame stepping, autosave recovery,
    and exported-file contents.

  - Test CFR 23.976/24/25/29.97/30/50/59.94/60 media plus at least one VFR fixture and one file containing multiple audio tracks.
  - Performance target: 10,000 cues and a two-hour file under 500 MB; pointer-to-paint latency below 32 ms at p95, smooth scrolling at 55+ FPS on the reference
    Chromium machine, no full React tree render during playback, first waveform tile within five seconds, and bounded analysis memory.

  - Verify the warmed application can reload offline and complete import, playback, waveform, editing, validation, autosave, crash recovery, and SRT/WebVTT export.
  - Keep historical parity notes until all rows and first-release professional-timing acceptance tests pass.

  ## Assumptions

  - The product is local-first with optional cloud collaboration later.
  - The implementation is a clean-room project; no third-party application source is copied.
  - Current desktop Chrome, Edge, Firefox, and Safari are supported through progressive fallbacks.
  - The initial media ceiling is 500 MB; larger files receive a clear warning rather than an unreliable processing attempt.
  - Core editor workflows must work offline. Translation, grammar services, accounts, and collaboration may require a network.
  - The first release uses a modern resizable professional interface while preserving the existing editor’s commands, defaults, shortcut behavior, and workflow
    semantics.
