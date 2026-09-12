# Interaction and interface design

Status: implementation design  
Requirements: [product requirements](requirements.md)

## Design intent

The editor should feel like a focused desktop timing tool in a browser. Dense information is acceptable when hierarchy, keyboard focus, and direct manipulation remain clear. The default workspace exposes the video, subtitle grid, text editor, and waveform timeline without opening modal windows.

## Default workspace

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ File  Edit  Timing  Text  Tools  View       Project name       Save state │
├───────────────────────────────────┬────────────────────────────────────────┤
│                                   │  Subtitle grid                         │
│           Video preview           │  #   In        Out       CPS   Text    │
│                                   │  12  00:14.2   00:16.8   15    ...     │
├───────────────────────────────────┼────────────────────────────────────────┤
│ Playback, time/frame, speed, loop │  Cue text / translation / properties   │
├───────────────────────────────────┴────────────────────────────────────────┤
│ Timeline toolbar: zoom, fit, snap, follow, waveform, markers, issues       │
│ ruler ─────────────────────────────── caret ─────────────────────────────── │
│ wave  ▂▃▆█▅▂▁   ▂▅██▇▃▁       ▃▆█▇▂                                   │
│ cues      [ subtitle 12 ][ subtitle 13 ]       [ subtitle 14 ]             │
├────────────────────────────────────────────────────────────────────────────┤
│ Quality / history drawer                                     8 issues      │
└────────────────────────────────────────────────────────────────────────────┘
```

Panel dividers are resizable. The timeline can grow vertically, the waveform can collapse, and the lower drawer can show quality, history, markers, or project details. Layout changes persist locally.

## Interaction principles

1. **Time is explicit.** Every timing edit shows the resulting time and delta. Frame mode shows the resolved presentation frame as well as timecode.
2. **Preview before commit.** Dragging, resizing, snapping, batch changes, and safe fixes show a preview. One completed gesture creates one undo command.
3. **Selection is stable.** Playback and scrolling do not clear selection. Seeking does not select a cue unless auto-select is enabled.
4. **Tools have visible modes.** Follow, snapping, loop, frame display, and scroll lock are persistent toolbar toggles with shortcut hints.
5. **Errors lead to action.** A quality issue names the rule and measured value, then selects and reveals the affected cue.
6. **Keyboard and pointer agree.** Commands use the same constraint and snapping services regardless of input method.

## Timeline behavior

### Geometry and zoom

The pointer-centered zoom keeps the time under the pointer stationary. Keyboard zoom centers on the caret. Fit computes a scale that includes the full media duration and work-area padding. A minimum block width keeps short cues selectable while handles continue to map to their true times.

The ruler chooses intervals from a stable 1/2/5 sequence and formats them as milliseconds or frame-aware timecode. At close zoom, minor ticks may represent individual frames. Variable-frame-rate media uses actual decoded frame timestamps rather than an assumed constant interval.

### Scrolling and follow

- Wheel scrolls vertically when multiple tracks overflow.
- Shift-wheel scrolls horizontally.
- Horizontal-dominant trackpad gestures pan horizontally.
- Ctrl/Cmd plus wheel or a pinch gesture zooms around the pointer.
- Native momentum is preserved for manual trackpad scrolling.
- Manual scrolling temporarily suspends follow until the resume delay expires.
- Follow mode begins moving before the caret reaches the configured edge zone.
- Center mode targets the viewport center; keep-visible mode moves only when needed.
- Reduced-motion mode removes interpolation while retaining follow behavior.

The exact caret is computed from `MediaClock`. An animation frame loop eases only the viewport toward its target. Seeking, snapping, and cue edits never read the eased viewport as time truth.

### Caret and snapping

The caret can be freely placed or snapped. Candidate types are separately configurable: cue start/end, frame, marker, waveform peak, silence edge, scene, and keyframe. A small label identifies the winning candidate during a gesture. Tolerance is configured in screen pixels and displayed as the equivalent milliseconds at the current zoom.

Holding the configured bypass modifier suppresses snapping until that pointer or keyboard gesture completes. Conflicting candidates resolve by shortest pixel distance, then the user's priority order. Locked cues can be snap targets but cannot be changed.

### Cue blocks

The block body moves selected cues. Start and end handles resize the active cue. The preview displays timing, duration, and delta; invalid negative duration is constrained before commit. Multi-selection movement stops at time zero and optionally preserves relative gaps. Overlap and minimum-gap rules may warn or constrain according to the active profile.

Click selects, Ctrl/Cmd-click toggles, Shift-click extends, and marquee drag selects cues in a time/track rectangle. The selected cue uses both a color and outline change so status does not depend on color alone.

## Grid and text editing

The virtualized grid columns are number, start, end, duration, CPS, style/speaker, status, and text. Users can hide and reorder nonessential columns. Double-clicking timing opens an exact editor; ordinary navigation never traps keyboard focus inside a cell.

The text editor preserves manual line breaks and previews line count, longest line, characters, words, CPS, and duration. Warnings update as the user types. Search and replace support literal, case-sensitive, and regular-expression modes with a match preview before replace-all.

For translation, the same editor region can show original and target fields side by side. Stage 1 uses one track, but spacing and data flow must accommodate the second field without redesign.

## Quality panel

Issues group by severity or rule and can be filtered to selection, track, or project. Each row contains cue number, time, concise explanation, measured and allowed values, and a fix action when the correction is deterministic. Clicking reveals the cue; double-clicking seeks and plays the configured context.

Bulk fixes show the number of affected cues and a diff summary. Applying the batch is one undoable command. Suppressed rules and per-project thresholds are visible in the project settings.

## Commands and shortcuts

The command palette lists every action and its current shortcut. Shortcut editing detects conflicts, supports presets for Subtitle Edit and Aegisub, and provides restore defaults. When focus is in text input, text-editing shortcuts take precedence; global playback commands that remain active are shown in shortcut settings.

Default priority shortcuts include Space for play/pause; arrows for stepping; I/O for start/end; Enter/N for creation; S for split; M for merge; L for loop; Tab for next; Delete for delete; and platform-standard save, search, undo, redo, and duplicate combinations.

## Visual system

- Use a dark neutral workspace by default with a light theme and a high-contrast theme.
- Reserve saturated colors for selection, caret, warnings, errors, markers, and speaker/style identity.
- Use tabular numerals for timecodes and metrics.
- Keep ordinary controls at least 32 CSS pixels high and touch-mode targets at least 44 pixels.
- Render timeline text at device-pixel-aware resolution and avoid CSS scaling of canvas output.
- Respect system font sizing and allow a compact density without reducing focus visibility.

## Responsive behavior

Desktop widths show the full split workspace. At medium widths, video and grid become switchable upper tabs while the timeline stays visible. At narrow widths, panels become ordered views: video, cues, text, timeline, issues. Touch mode increases handles, uses long-press context menus, and avoids hover-only actions. Professional timing remains optimized for a keyboard and a precision pointer.

## Accessibility states

Canvas content has an adjacent semantic control surface: the selected cue's start, end, duration, snapping result, and active markers are exposed through labelled controls and live status text. Focus never moves merely because playback selects or reveals a cue. Animation respects `prefers-reduced-motion`. Waveform and cue colors meet contrast targets and have non-color selection indicators.

## Empty, loading, and failure states

| State | Response |
|---|---|
| No project | Two primary actions: open subtitle and open video; recent recoveries below |
| Video only | Timeline and playback work; creation action is prominent |
| Subtitle only | Duration derives from cues; video-dependent actions explain the requirement |
| Waveform processing | Progressive waveform appears by tile; editing stays available |
| Unsupported codec | Keep subtitle editing active; offer compatibility analysis if available |
| Storage quota | Preserve in-memory work, offer project download, and identify removable caches |
| Parser warning | Import valid cues and show source-line warnings before save/export |
| Recovery found | Show timestamp and project identity, then restore without replacing a newer open project |

## Related documents

- [Product requirements](requirements.md)
- [System architecture](architecture.md)
- [Delivery roadmap](roadmap.md)
- [Feature parity matrix](feature-matrix.md)
