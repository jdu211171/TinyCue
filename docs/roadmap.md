# Delivery roadmap and stage gates

Status: execution plan  
Release definition: [product requirements](requirements.md)

Implementation status (2026-09-12): Stage 0 is complete. Stage 1 remains in progress with verified project archives, plain-text import/export, configurable SRT export, batch subtitle delay, and rational frame-rate conversion. Stage 2 timeline features are partially implemented ahead of the Stage 1 exit gate.

## Delivery rules

Each stage starts only after its entry gate is met and ends with a demonstrable vertical workflow. A feature counts as complete only when its command behavior, persistence, keyboard path, error state, and relevant cross-browser tests pass. The [feature matrix](feature-matrix.md) is updated in the same change that completes a feature.

Historical parity notes remain available throughout Stages 0–2, while all new functionality is implemented in TinyCue's TypeScript source.

## Stage 0 — Baseline and maintainable scaffold

**Purpose:** establish a safe replacement path and measurable reference.

**Entry gate:** the initial prototype runs locally; upload, timing edit, and subtitle download have been manually verified.

**Deliverables:**

- Record the initial prototype behavior and retain reusable test fixtures.
- Scaffold React 19, TypeScript, Vite, linting, Vitest, and Playwright.
- Define editor-core packages, integer-microsecond types, IDs, and command interfaces.
- Add deterministic SRT, VTT, and short media fixtures.
- Capture baseline workflows, screenshots, browser console state, and timing round-trip results.
- Add dependency license inventory and browser capability probe.

**Exit gate:** both routes run in one development command; CI exercises unit tests and Chromium/Firefox/WebKit smoke flows; architectural boundaries are enforced by imports.

## Stage 1 — Maintainable baseline parity

**Purpose:** replace the server-dependent editing workflow with a clean-room local implementation.

**Depends on:** Stage 0.

**Deliverables:**

- Project shell, video player, virtualized grid, text editor, and basic canvas timeline.
- SRT and WebVTT detection, parsing, warnings, serialization, and round-trip tests.
- Local video and subtitle import by picker and drag/drop.
- Cue create, select, edit, move, resize, insert before/after, split, merge, and delete.
- Exact time fields, global shift, frame-rate conversion, auto line break/unbreak.
- Command-based undo/redo, IndexedDB autosave, reload recovery, and dirty state.
- Download, plain-text export, filename preservation, and project archive.
- Baseline visual and workflow parity report.

**Exit gate:** a user can complete the practical open-edit-save workflow with the network disabled. SRT/VTT export reimports without timing or text loss. Every document mutation is undoable.

## Stage 2 — Professional timing release

**Purpose:** deliver the first production release around the twelve priority interactions.

**Depends on:** stable Stage 1 commands and persistence.

**Deliverables:**

- Multiresolution waveform worker, cache, zoom, and progressive rendering.
- Smooth inertial pan and pointer-centered zoom.
- Exact playback caret with follow, center, keep-visible, and scroll-lock modes.
- Configurable snapping, candidate preview, tolerance, and temporary bypass.
- Split at caret; precise block dragging and edge resizing.
- Actual-frame stepping with constant-frame fallback and frame display.
- Current-cue and selection loops plus play-before/after.
- Shortcut editor with conflict handling and workflow presets.
- Incremental quality checks and clickable issue panel.
- Performance instrumentation and accessibility pass.

**Exit gate:** all first-release acceptance scenarios in [requirements](requirements.md#first-production-release-acceptance) pass. A 10,000-cue fixture meets interaction targets, a forced reload recovers the last completed command, and current supported browsers pass the core Playwright suite.

## Stage 3 — Extended editing, validation, and formats

**Purpose:** cover advanced daily editorial operations and interchange.

**Depends on:** Stage 2 performance and command invariants.

**Deliverables:**

- Smart split modes, multi-cue merge modes, batch timing, overlap repair, and minimum gaps.
- Full find/replace, cleanup transforms, spelling integration, and project-wide selection predicates.
- Complete quality rule catalog with profiles, bulk fixes, and report export.
- TTML/DFXP, SCC, STL, SBV, CSV, and plain-text adapters.
- Encoding detection, RTL and CJK line-break rules, clipboard import/export.
- Saved workspaces, themes, compact mode, context menus, and touch refinements.

**Exit gate:** every Stage 3 matrix row has a fixture or workflow test. Imported malformed files retain valid cues and actionable source-line diagnostics. Bulk fixes are previewed and undo as one operation.

## Stage 4 — Advanced media and styling

**Purpose:** add format-rich authoring and analysis without slowing the core editor.

**Depends on:** Stage 3 adapter contracts and stable worker scheduling.

**Deliverables:**

- ASS/SSA parser, style editor, positioning, safe-area guides, and JASSUB preview.
- Multiple audio track selection, waveform normalization, thumbnails, silence, scenes, peaks, and keyframes.
- Media synchronization offset, speed-change timing recalculation, and external media relinking.
- On-demand ffmpeg.wasm compatibility tools and burned-in export with progress/cancel.
- Optional local speech recognition integration behind a provider adapter.

**Exit gate:** advanced assets load only when invoked; ordinary SRT/VTT startup size and responsiveness stay within Stage 2 budgets. ASS fixtures render and round-trip within the documented supported subset.

## Stage 5 — Multilingual review and collaboration

**Purpose:** support translation teams and client review.

**Depends on:** stable project migrations, identity model, and command journal.

**Deliverables:**

- Side-by-side original and translated tracks, linked or independent timing, completeness, glossary, and translation memory adapters.
- Accounts, workspaces, role permissions, project sharing, and read-only review links.
- Timecoded comments, resolution, approvals, assignments, due dates, and activity history.
- Yjs collaboration adapter, presence, offline queue, conflict tests, and version comparison.
- Multi-language import/export and approval reports.

**Exit gate:** two offline-capable clients can edit and reconnect without losing valid commands; permissions are enforced by the service and verified by integration tests; reviewers can comment and approve without editor privileges.

## Cross-stage quality gates

Before closing any stage:

1. Update requirements and the feature matrix for scope changes.
2. Run unit, property, migration, and relevant browser workflow tests.
3. Verify keyboard-only and reduced-motion workflows.
4. Compare performance to the previous accepted stage.
5. Review dependency licenses, bundle growth, and offline cache behavior.
6. Record known limits in user-facing documentation.

## Key risks and controls

| Risk | Control |
|---|---|
| Variable-frame-rate drift | Use presentation timestamps; test VFR fixtures |
| Main-thread stalls | Worker analysis, virtualized rows, cached canvas layers |
| WASM memory pressure | Streaming normal path; lazy fallback with file-size checks |
| Browser codec differences | Capability probe and clear fallback states |
| Autosave corruption | Transactional revisions, checksums, migrations, recovery tests |
| Format loss | Adapter-specific warnings and golden round-trip fixtures |
| Scope expansion | First release ends at Stage 2; later rows remain explicitly staged |
| Legacy coupling | Separate route and parity fixtures; no imports from captured bundle |

## Related documents

- [Product requirements](requirements.md)
- [System architecture](architecture.md)
- [Interaction and interface design](ux-design.md)
- [Feature parity matrix](feature-matrix.md)
