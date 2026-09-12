# TinyCue

A lightweight, local-first subtitle editor for the browser. Edit SRT and WebVTT files without uploading your media.

## Run locally

Node.js 20.19 or newer is required.

```sh
npm install
npm run dev
```

Open <http://127.0.0.1:4173/>.

Use `npm test` for the core test suite and `npm run build` to create the production bundle.

## Implemented workflow

TinyCue currently supports:

- Local video and audio playback without uploading media
- SRT, WebVTT, and plain-text import, validation, serialization, and download
- Export controls for selected cues, line endings, SRT numbering, and clipboard copy
- Validated TinyCue project archive import and export
- Cue creation, selection, text editing, exact timing, split, merge, and delete
- Undoable all-cue or selected-cue delay and rational frame-rate conversion
- Canvas timeline with zoom, scrolling, playhead, waveform, snapping, drag, and resize
- Frame-sized stepping, playback speed, cue looping, and follow-playback scrolling
- Undo and redo through the editor command engine
- Configurable shortcuts with conflict detection and local persistence
- Clickable quality checks for overlaps, gaps, reading speed, duration, and line limits
- IndexedDB autosave and crash recovery
- Responsive desktop and mobile editing layouts

## Planning documents

- [Research and technology study](docs.md)
- [Product requirements](docs/requirements.md)
- [System architecture](docs/architecture.md)
- [Interaction and interface design](docs/ux-design.md)
- [Delivery roadmap and stage gates](docs/roadmap.md)
- [Feature parity matrix](docs/feature-matrix.md)

## Source layout

- `src/editor-core/` contains the framework-independent project model, commands, history, and timecode functions.
- `src/formats/` contains clean-room SRT and WebVTT adapters.
- `src/timeline/` contains the canvas timeline, viewport, snapping, and pointer gestures.
- `src/media/` contains local media analysis.
- `src/persistence/` contains IndexedDB project recovery.
- `src/quality/` contains quality rules.
- `src/App.tsx` composes the workspace.
