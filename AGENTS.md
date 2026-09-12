# Project Structure

- `src/App.tsx` composes the TinyCue workspace and application controls.
- `src/editor-core/` contains project types, commands, history, and timecode utilities.
- `src/formats/` contains subtitle format parsers and serializers.
- `src/timeline/` contains timeline rendering, snapping, and pointer interactions.
- `src/media/` contains local media analysis.
- `src/persistence/` contains IndexedDB persistence.
- `src/quality/` contains subtitle quality rules.
- `fixtures/` contains deterministic test fixtures.
- `docs/` contains product, architecture, UX, roadmap, and feature-planning references.
- Static assets live at the repository root and build output is written to `dist/`.
