# Product requirements

Status: approved planning baseline  
Source: [technology and product study](../docs.md)

## Product definition

Build TinyCue as a local-first browser subtitle editor that preserves the useful workflow of the initial prototype and adds precise timeline editing expected from established subtitle and nonlinear editors. The product must remain responsive on long projects, keep timing exact while the viewport moves smoothly, and preserve work through crashes or reloads.

The first production release ends at Stage 2 in the [roadmap](roadmap.md). Later stages expand formats, media analysis, translation, and collaboration without replacing the core data model.

## Users and jobs

| User | Primary job | Required outcome |
|---|---|---|
| Subtitle editor | Time and polish dialogue against media | Frame-aware, fast keyboard and pointer workflow |
| Translator | Edit a target language while retaining source context | Linked tracks, length guidance, safe export |
| Reviewer | Find timing and text problems | Clickable issues and repeatable playback loops |
| Occasional creator | Correct an SRT or WebVTT without installing software | Simple import, edit, autosave, and download |

## Release requirements

### Project and media

- **REQ-PROJ-001:** Create, open, recover, save, import, and export a project without an account.
- **REQ-PROJ-002:** Keep media local by default. Opening a media file must not upload it.
- **REQ-PROJ-003:** Accept local media up to 500 MB for the first release and report unsupported codecs clearly.
- **REQ-PROJ-004:** Detect duration, dimensions, audio tracks, and available frame timing when the browser exposes them.
- **REQ-PROJ-005:** Preserve the imported subtitle filename, encoding decision, language, and format metadata.
- **REQ-PROJ-006:** Autosave document state and recover the latest valid revision after an interrupted session.

### Timeline and playback

- **REQ-TIME-001:** Render a ruler, exact playback caret, subtitle blocks, start/end handles, waveform, selection, markers, and visible work area.
- **REQ-TIME-002:** Support zoom, fit-to-duration, horizontal and vertical scrolling, wheel, Shift-wheel, and trackpad pinch gestures.
- **REQ-TIME-003:** Keep caret time equal to media time. Smooth scrolling may interpolate viewport position only.
- **REQ-TIME-004:** Provide follow-playback, center-caret, keep-selection-visible, and scroll-lock modes.
- **REQ-TIME-005:** Allow drag and resize with configurable snapping to frames, subtitle boundaries, markers, waveform peaks, silence edges, scenes, and keyframes.
- **REQ-TIME-006:** Permit a configurable modifier to bypass snapping for one gesture.
- **REQ-TIME-007:** Support frame stepping, configurable jumps, playback speed, current-cue loop, selection loop, and play-before/after.
- **REQ-TIME-008:** Timeline pointer feedback must remain interactive during playback and waveform rendering.

### Editing

- **REQ-EDIT-001:** Create, insert, duplicate, delete, split, merge, move, resize, and retime cues with keyboard or pointer input.
- **REQ-EDIT-002:** Support single, range, and disjoint selection and preserve selection during playback.
- **REQ-EDIT-003:** Route every document mutation through an undoable command and provide redo.
- **REQ-EDIT-004:** Support batch shifts, frame-rate conversion, proportional timing adjustment, frame rounding, overlap removal, and minimum gaps.
- **REQ-EDIT-005:** Keep cue identifiers stable across sorting, renumbering, autosave, and format round trips.
- **REQ-EDIT-006:** Allow multiline text, preserved manual breaks, automatic reflow, find/replace, and configurable text cleanup.

### Quality and formats

- **REQ-QUAL-001:** Continuously calculate duration, characters per second, line count, and maximum line length.
- **REQ-QUAL-002:** Detect all rules listed in the [feature matrix](feature-matrix.md) without blocking ordinary editing.
- **REQ-QUAL-003:** Selecting an issue must select the cue, reveal it in the grid and timeline, and seek on request.
- **REQ-FMT-001:** First release import and export must work entirely offline for SRT and WebVTT.
- **REQ-FMT-002:** Parsing must report recoverable errors by line and never silently discard cues.
- **REQ-FMT-003:** Export must offer selected cues, renumbering, styling policy, time basis, and encoding where supported.
- **REQ-FMT-004:** Format adapters must isolate format-specific rules from the editor model.

### Interface and accessibility

- **REQ-UI-001:** Provide resizable video, timeline, subtitle grid, text editor, quality, and properties regions.
- **REQ-UI-002:** Store workspace layout, theme, shortcut map, snapping options, and playback preferences per browser profile.
- **REQ-UI-003:** Every core pointer operation must have a configurable keyboard equivalent.
- **REQ-UI-004:** Meet WCAG 2.2 AA for contrast, focus visibility, names, keyboard reachability, and reduced motion.
- **REQ-UI-005:** Support current left-to-right and right-to-left scripts; later multilingual work must not require a schema migration.

## Nonfunctional requirements

| ID | Requirement | Acceptance target |
|---|---|---|
| NFR-PERF-001 | Large project editing | 10,000 cues without DOM growth proportional to all visible tracks |
| NFR-PERF-002 | Interaction latency | Pointer-to-visual feedback p95 below 32 ms on reference hardware |
| NFR-PERF-003 | Playback rendering | 55+ rendered frames per second in Chromium under the standard fixture |
| NFR-PERF-004 | Background analysis | Parsing and waveform work never blocks input for more than 50 ms |
| NFR-DATA-001 | Timing precision | Store integer microseconds; no cumulative float drift after 1,000 edits |
| NFR-DATA-002 | Recovery | Restore the most recent completed command after forced reload |
| NFR-OFF-001 | Offline core | After first load, SRT/VTT editing and export work with the network disabled |
| NFR-COMPAT-001 | Browsers | Latest two stable Chrome, Edge, Firefox, and Safari releases |
| NFR-TEST-001 | Determinism | Command, parser, serializer, and validation tests use fixed media/text fixtures |
| NFR-LIC-001 | Distribution | Runtime dependencies permit proprietary distribution; exceptions require review |

## First production release acceptance

Release is ready when the baseline workflow and the twelve priority interactions pass automated and manual acceptance tests:

1. Open a local video and SRT or WebVTT file.
2. Edit text and timing using grid, keyboard, and timeline.
3. Zoom and scroll smoothly while an exact caret follows playback.
4. Drag and resize cues with optional snapping and temporary bypass.
5. Split at caret, frame-step, loop a cue, and follow playback.
6. Undo and redo every editing command.
7. Customize shortcuts and persist them.
8. Navigate quality issues and correct them.
9. Reload after a forced interruption and recover the project.
10. Export, reimport, and compare timing/text with the in-memory document.

## Deferred release scope

ASS/SSA rendering, burned-in video, speech recognition, multiple simultaneous projects, cloud sync, comments, approvals, and team permissions begin after the first production release. Their data and adapter boundaries are included now so they can be added without replacing the editor engine.

## Related documents

- [System architecture](architecture.md)
- [Interaction and interface design](ux-design.md)
- [Delivery roadmap](roadmap.md)
- [Feature parity matrix](feature-matrix.md)
