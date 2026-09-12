# System architecture

Status: implementation design  
Requirements: [product requirements](requirements.md)

## Architecture goals

The maintainable editor is a React and TypeScript application around a framework-independent editor engine. React renders state and dispatches commands; it does not own document truth, playback timing, or timeline geometry. This boundary makes timing logic deterministic, testable, and reusable by future collaboration or desktop shells.

```text
Browser application
├── React workspace
│   ├── VideoPlayer and controls
│   ├── Timeline viewport
│   ├── Virtualized subtitle grid
│   ├── Text and properties editors
│   └── Quality and history panels
├── EditorEngine
│   ├── Project store and derived indexes
│   ├── Command, undo, and redo journal
│   ├── Selection and snapping services
│   └── Validation scheduler
├── Media subsystem
│   ├── MediaClock
│   ├── Mediabunny/WebCodecs analyzer
│   ├── Canvas renderer workers
│   └── Lazy ffmpeg.wasm fallback
└── Adapters
    ├── Subtitle formats
    ├── IndexedDB/OPFS repository
    ├── File System Access API
    └── Future collaboration transport
```

## Technology baseline

| Concern | Choice | Reason |
|---|---|---|
| Application | React 19, TypeScript, Vite | Typed modular source, fast local build, direct browser APIs |
| External store binding | `useSyncExternalStore` | Consistent React views of an engine-owned snapshot |
| Timeline | Canvas 2D with OffscreenCanvas worker where supported | Stable cost for thousands of cues and waveform tiles |
| Long lists | TanStack Virtual | Render only visible grid rows |
| Panels and primitives | react-resizable-panels and Radix UI | Accessible resizing, menus, dialogs, and focus handling |
| Media | HTML video, `requestVideoFrameCallback`, Mediabunny/WebCodecs | Presented-frame timing and streaming analysis |
| Heavy conversion | Lazy ffmpeg.wasm | Compatibility path for unsupported analysis/conversion |
| Persistence | Dexie/IndexedDB and OPFS | Structured revisions plus large binary caches |
| Testing | Vitest, Playwright, fast-check | Unit, cross-browser workflow, and invariant coverage |

## Source layout

```text
src/
├── app/                 composition, routes, workspace shell
├── editor-core/         project model, commands, selection, indexes
├── timeline/            viewport math, gestures, snapping, canvas layers
├── media/               clock, decoding, waveform, scenes, thumbnails
├── formats/             one adapter per subtitle/project format
├── quality/             rule registry and issue index
├── persistence/         schemas, migrations, autosave, recovery, caches
├── collaboration/       adapter contract; implementation arrives later
├── ui/                  reusable accessible interface primitives
└── workers/             parsing, analysis, rendering worker entrypoints
```

Historical parity notes inform acceptance tests, but TinyCue does not ship or import the prototype application's source or assets.

## Core data model

All stored times use integer microseconds. Display and format adapters convert at their boundaries.

```ts
type Microseconds = number;

interface EditorProject {
  id: string;
  schemaVersion: number;
  title: string;
  media: MediaReference | null;
  tracks: SubtitleTrack[];
  styles: Record<string, SubtitleStyle>;
  markers: TimelineMarker[];
  settings: ProjectSettings;
  revision: number;
}

interface SubtitleTrack {
  id: string;
  language: string | null; // BCP 47
  kind: "original" | "translation" | "captions";
  timingMode: "independent" | "linked";
  cues: SubtitleCue[];
}

interface SubtitleCue {
  id: string;
  startUs: Microseconds;
  endUs: Microseconds;
  text: string;
  styleId: string | null;
  speaker: string | null;
  notes: string;
  locked: boolean;
  timingLinkId: string | null;
  status: "draft" | "review" | "approved";
}
```

Sorted indexes reference stable cue IDs. Renumbering is an export concern. Track order, display row, and subtitle number must never be used as identity.

## State and command flow

```text
Pointer / keyboard / menu
          │
          ▼
Intent resolver ──► snap/constraint preview
          │
          ▼
EditorEngine.dispatch(Command)
          │
          ├──► validate preconditions
          ├──► create inverse command
          ├──► update immutable snapshot + indexes
          ├──► append journal entry
          └──► notify UI, autosave, validators
```

`EditorEngine.dispatch(command)` is the only document mutation entrypoint. A drag gesture updates an ephemeral preview; pointer release commits one command. Text typing may coalesce adjacent edits to the same cue within a short interval. Undo and redo restore selection as well as content.

Commands carry semantic information such as `MoveCues`, `ResizeCueStart`, `SplitCue`, or `NormalizePunctuation`. This supports readable history, compact persistence, and later translation to collaborative transactions.

## Timeline and media clock

The `MediaClock` owns exact playback state. It samples `requestVideoFrameCallback` where available and falls back to `requestAnimationFrame` plus `video.currentTime`. The caret is drawn at the exact sampled time. Follow mode separately interpolates `viewportStartUs` toward a target, so animation never changes media or cue time.

Timeline geometry is expressed as pure transforms:

```text
x = (timeUs - viewportStartUs) * pixelsPerMicrosecond
timeUs = viewportStartUs + x / pixelsPerMicrosecond
```

Canvas layers are independently invalidated: ruler, waveform tiles, thumbnails, cue blocks, markers, selection, and caret. Static layers cache to offscreen surfaces. The caret and drag overlay redraw without repainting waveform data.

The snapping service receives a gesture time, pixels-per-microsecond, enabled candidate sources, and tolerance in pixels. It converts the tolerance once, searches sorted candidate indexes, and returns the closest candidate with source metadata. The bypass modifier skips the service for that gesture.

## Media pipeline

1. Create an object URL for immediate HTML video playback.
2. Read metadata and track information through Mediabunny.
3. Stream audio samples to a worker and build multiresolution peak tiles.
4. Persist reusable tiles in OPFS, keyed by file fingerprint and analyzer version.
5. Extract frame timestamps, scenes, silence, and thumbnails only when requested.
6. Load ffmpeg.wasm for a specific unsupported operation and release it afterward.

The ordinary path must not copy an entire 500 MB file into a WASM heap. Multiple audio tracks are represented in metadata from the beginning, even when the first interface exposes one selected track.

## Formats

```ts
interface FormatAdapter {
  readonly id: string;
  detect(input: Uint8Array, name?: string): DetectionResult;
  parse(input: Uint8Array, options: ParseOptions): ParseResult;
  validate(project: EditorProject, options: ExportOptions): FormatIssue[];
  serialize(project: EditorProject, options: ExportOptions): Uint8Array;
}
```

SRT and WebVTT adapters are clean-room implementations in Stage 1. Each parser preserves actionable warnings and source metadata. ASS/SSA, TTML, SCC, STL, SBV, CSV, and plain text arrive as isolated adapters. ASS rendering later uses `ass-compiler` for parsing and JASSUB for preview behind the same style model.

## Persistence and recovery

Dexie stores projects, snapshots, command journal segments, preferences, and cache metadata. OPFS stores waveform tiles, thumbnails, and optional working-file handles. Autosave writes a transaction containing the current revision and new journal entries. Periodic compact snapshots bound replay time.

On startup, recovery selects the newest internally consistent revision. Schema migrations are forward-only functions tested against fixtures for every prior version. A portable project archive includes the document, preferences needed for rendering, and optional cached analysis; media remains external unless explicitly included.

## Quality analysis

Rules implement a shared contract and declare whether they inspect one cue, adjacent cues, a track, or the project. Incremental validation runs for affected cue IDs after each command. Full validation runs in a worker on import, settings changes, and explicit request. Issues use stable IDs and contain cue/track references, severity, message, evidence, and optional safe fix command.

## Browser capability fallback

| Capability | Preferred path | Fallback |
|---|---|---|
| Presented frame time | `requestVideoFrameCallback` | animation frame + current time |
| Worker canvas | OffscreenCanvas | main-thread canvas with cached layers |
| Media decode | WebCodecs through Mediabunny | HTML media element or ffmpeg.wasm |
| Local file updates | File System Access API | download a new file |
| Large cache | OPFS | IndexedDB blobs with quota warning |
| WASM threads | cross-origin-isolated worker | single-thread build |

## Security and licensing

Local files remain in the browser unless a future cloud action clearly states what will be uploaded. Imported markup is parsed into a model and escaped on display. File names never become executable paths. Worker and WASM assets use a restrictive content security policy.

Before adding a runtime package, record its license and distribution obligations. GPL media binaries must not be bundled into a proprietary build without an explicit licensing decision. The application should prefer permissive libraries and lazy user-initiated compatibility components.

## Related documents

- [Product requirements](requirements.md)
- [Interaction and interface design](ux-design.md)
- [Delivery roadmap](roadmap.md)
- [Feature parity matrix](feature-matrix.md)
