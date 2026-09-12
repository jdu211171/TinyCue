# Feature parity matrix

Status: scope ledger  
Stages: [delivery roadmap](roadmap.md)

This matrix maps each requested capability from the initial prototype to the TinyCue target. **Present** means the behavior was verified in the prototype; **Partial** means a limited version exists; **Missing** means it was not found. Stage 2 is the first production release. Dependencies use `core`, `media`, `wave`, `format`, `quality`, `style`, `storage`, `UI`, and `cloud` as the owning boundaries.

The `Prototype` column is frozen historical evidence and does not describe TinyCue. As of 2026-09-11, TinyCue provides the Stage 1 vertical workflow plus early Stage 2 playback caret, smooth follow, zoom, snapping, waveform, frame-sized stepping, cue loop, and quality navigation. Add the delivery-state column described below as the remaining rows move into implementation.

## Timeline, scrolling, and caret

| ID | Capability | Prototype | Owner | Stage | Acceptance |
|---|---|---|---|---|---|
| TL-001 | Zoom in/out | Missing | timeline | 2 | Pointer and keyboard zoom retain anchor time |
| TL-002 | Fit to video duration | Missing | timeline | 2 | Full duration fits with work-area padding |
| TL-003 | Horizontal scrolling | Present | timeline | 1 | Scrollbar and gestures pan time |
| TL-004 | Vertical scrolling | Partial | UI | 2 | Overflowing tracks/panels scroll independently |
| TL-005 | Scroll wheel | Present | timeline | 1 | Wheel pans expected axis |
| TL-006 | Shift-wheel horizontal scroll | Missing | timeline | 2 | Shift-wheel pans time |
| TL-007 | Trackpad pinch zoom | Missing | timeline | 2 | Pinch zooms around gesture center |
| TL-008 | Millisecond/frame ruler | Partial | timeline | 2 | Mode changes labels and ticks |
| TL-009 | Timecode display | Present | core | 1 | Exact caret and cue timecode shown |
| TL-010 | Frame-number display | Missing | media | 2 | Presented frame number shown when known |
| TL-011 | Current-position caret | Present | media | 1 | Caret follows exact playback time |
| TL-012 | Cue start/end markers | Present | timeline | 1 | Handles map to exact boundaries |
| TL-013 | Draggable subtitle blocks | Present | timeline | 1 | Drag commits one undoable move |
| TL-014 | Separate waveform track | Present | wave | 2 | Wave track toggles independently |
| TL-015 | Video thumbnail strip | Missing | media | 4 | On-demand thumbnails align to timestamps |
| TL-016 | Markers and chapters | Partial | core | 3 | Add/edit/navigate typed markers |
| TL-017 | Loop region display | Missing | timeline | 2 | Active loop is visibly bounded |
| TL-018 | Work-area boundaries | Missing | core | 2 | In/out work area displays and constrains commands |
| TL-019 | Smooth horizontal scrolling | Partial | timeline | 2 | Follow and commands animate without time drift |
| TL-020 | Smooth vertical scrolling | Missing | UI | 3 | Panel/list navigation respects motion setting |
| TL-021 | Wheel momentum | Partial | timeline | 2 | Native momentum is preserved |
| TL-022 | Trackpad inertia | Partial | timeline | 2 | Manual inertia is not cancelled by playback |
| TL-023 | Auto-scroll during playback | Partial | timeline | 2 | Follow keeps caret in configured zone |
| TL-024 | Edge-triggered auto-scroll | Missing | timeline | 2 | Drag/playback scroll begins near edge |
| TL-025 | Center-caret mode | Partial | timeline | 2 | Caret targets viewport center |
| TL-026 | Keep-current-cue-visible | Partial | timeline | 2 | Active cue remains wholly or minimally visible |
| TL-027 | Scroll-lock mode | Missing | timeline | 2 | Playback never changes viewport while locked |
| TL-028 | Manual scroll during playback | Partial | timeline | 2 | Manual pan suspends follow without pausing |
| TL-029 | Scroll to current cue | Present | timeline | 1 | Command reveals active cue |
| TL-030 | Scroll to selected cue | Present | timeline | 1 | Selection command reveals cue |
| TL-031 | Scroll next/previous cue | Partial | core | 2 | Navigation selects and reveals adjacent cue |
| TL-032 | Scroll animation speed | Missing | UI | 3 | Preference changes follow interpolation |
| TL-033 | Reduced motion | Missing | UI | 2 | System/setting removes interpolation |
| TL-034 | Follow-playback toggle | Partial | timeline | 2 | Persistent visible toggle controls follow |
| TL-035 | Free caret | Present | timeline | 1 | Click seeks exact unsnapped time |
| TL-036 | Magnet caret master mode | Missing | timeline | 2 | Toggle enables configured sources |
| TL-037 | Snap to cue start | Missing | timeline | 2 | Nearest start wins within tolerance |
| TL-038 | Snap to cue end | Missing | timeline | 2 | Nearest end wins within tolerance |
| TL-039 | Snap to nearest frame | Missing | media | 2 | Resolves actual frame timestamp |
| TL-040 | Snap to waveform peaks | Missing | wave | 2 | Indexed peak candidate is selectable |
| TL-041 | Snap to other boundaries | Missing | timeline | 2 | Other cue edges are candidates |
| TL-042 | Snap to markers | Missing | timeline | 2 | Enabled marker types are candidates |
| TL-043 | Magnet tolerance | Missing | timeline | 2 | Pixel setting maps to current scale |
| TL-044 | Modifier snap bypass | Missing | timeline | 2 | Modifier suppresses snap for one gesture |
| TL-045 | Snap to grid | Missing | timeline | 2 | Configured interval is candidate source |
| TL-046 | Snap to keyframe | Missing | media | 4 | Decoded keyframes are candidates |
| TL-047 | Snap to silence | Missing | wave | 4 | Silence edges are candidates |
| TL-048 | Snap to scene change | Missing | media | 4 | Scene boundaries are candidates |

## Creation, timing, split, merge, and selection

| ID | Capability | Prototype | Owner | Stage | Acceptance |
|---|---|---|---|---|---|
| ED-001 | Create at caret/video position | Present | core | 1 | New cue begins at exact caret |
| ED-002 | Create with default duration | Present | core | 1 | Preference supplies valid duration |
| ED-003 | Create from in/out points | Partial | core | 2 | Work area creates one cue |
| ED-004 | Create while playing | Present | core | 1 | Shortcut works without pausing |
| ED-005 | Set start at current position | Present | core | 1 | Command changes only start |
| ED-006 | Set end at current position | Present | core | 1 | Command changes only end |
| ED-007 | Create from selection | Partial | core | 2 | Selected time range creates cue |
| ED-008 | Create from speech/silence | Missing | wave | 4 | Detected ranges preview before creation |
| ED-009 | Duplicate cue | Missing | core | 2 | Duplicate has stable new ID |
| ED-010 | Insert before | Present | core | 1 | Valid cue placed before active cue |
| ED-011 | Insert after | Present | core | 1 | Valid cue placed after active cue |
| ED-012 | Add at end | Present | core | 1 | New cue follows final cue |
| ED-013 | Auto-place between neighbors | Present | core | 1 | Default duration respects available gap |
| ED-014 | Move cue left/right | Present | core | 1 | Body drag/shortcut preserves duration |
| ED-015 | Move only start | Present | core | 1 | Start handle preserves end |
| ED-016 | Move only end | Present | core | 1 | End handle preserves start |
| ED-017 | Change duration | Present | core | 1 | Exact field and handles agree |
| ED-018 | Extend to next cue | Missing | core | 3 | End reaches next start under gap rule |
| ED-019 | Extend from previous cue | Missing | core | 3 | Start reaches previous end under gap rule |
| ED-020 | Set exact start/end/duration | Present | core | 1 | Validated fields commit one command |
| ED-021 | Shift all forward/back | Present | core | 1 | Signed delta applies without drift |
| ED-022 | Shift selected cues | Partial | core | 2 | Only selected stable IDs move |
| ED-023 | Shift cues after current | Missing | core | 3 | Predicate batch preview is correct |
| ED-024 | Shift cues before current | Missing | core | 3 | Predicate batch preview is correct |
| ED-025 | Sync to another subtitle file | Missing | core | 3 | Anchors produce previewed transform |
| ED-026 | Frame-rate/timecode conversion | Present | core | 1 | Known-rate fixture matches expected times |
| ED-027 | Subtitle delay | Present | core | 1 | Signed delay applies to target scope |
| ED-028 | Proportional timing/stretch | Missing | core | 3 | Two anchors map cues proportionally |
| ED-029 | Recalculate after speed change | Missing | core | 4 | Speed ratio produces deterministic timing |
| ED-030 | Round to frame boundaries | Missing | media | 3 | Every boundary resolves to chosen frame rule |
| ED-031 | Remove overlaps | Missing | core | 3 | Preview resolves overlaps under policy |
| ED-032 | Add minimum gaps | Missing | core | 3 | Result meets configured gap or reports conflict |
| ED-033 | Split at caret | Present | core | 2 | Text/timing split at caret is undoable |
| ED-034 | Split at middle | Present | core | 1 | Timing divides exactly at midpoint |
| ED-035 | Split at word boundary | Partial | core | 3 | Nearest valid word split is proposed |
| ED-036 | Split at sentence boundary | Missing | core | 3 | Punctuation-aware split preserves text |
| ED-037 | Split equal durations | Missing | core | 3 | N outputs cover original interval |
| ED-038 | Split equal text lengths | Missing | core | 3 | Balanced output preserves all text |
| ED-039 | Split by line | Missing | core | 3 | Each line maps to ordered cue |
| ED-040 | Merge previous/next | Partial | core | 1 | Text and outer timing combine |
| ED-041 | Merge selected cues | Missing | core | 3 | Ordered selection merges once |
| ED-042 | Merge overlaps | Missing | core | 3 | Overlap group merges under policy |
| ED-043 | Join preserving text | Partial | core | 3 | Text policy is explicit and lossless |
| ED-044 | Join preserving timing | Partial | core | 3 | Timing policy is explicit |
| ED-045 | Split text/timing independently | Missing | core | 3 | Mode changes only chosen dimension |
| ED-046 | Split on waveform silence | Missing | wave | 4 | Candidate silence is previewed |
| ED-047 | Split on punctuation | Missing | core | 3 | Locale-aware punctuation sets split |
| ED-048 | Select current cue | Present | core | 1 | Active cue ID becomes selection anchor |
| ED-049 | Multi-select/toggle | Present | core | 1 | Ctrl/Cmd toggles stable cue IDs |
| ED-050 | Select all/range | Present | core | 1 | All and Shift-range work in grid/timeline |
| ED-051 | Select current to end/start | Missing | core | 3 | Ordered predicate selects expected IDs |
| ED-052 | Select by speaker/style | Missing | core | 3 | Metadata predicate selects matches |
| ED-053 | Select cues with errors | Missing | quality | 3 | Current filter selects affected cues |
| ED-054 | Select overlaps/time range | Missing | core | 3 | Interval predicate includes exact intersections |
| ED-055 | Extend selection by keyboard | Partial | core | 2 | Shortcut extends from anchor |
| ED-056 | Preserve selection in playback | Partial | core | 2 | Playback does not clear selection |

## Text editing and quality

| ID | Capability | Prototype | Owner | Stage | Acceptance |
|---|---|---|---|---|---|
| TX-001 | Inline and full grid editing | Partial | UI | 1 | Grid and editor update same command state |
| TX-002 | Multiline and line breaks | Present | core | 1 | Manual breaks round-trip |
| TX-003 | Auto wrap / preserve manual breaks | Present | core | 1 | Reflow is optional and undoable |
| TX-004 | Undo/redo | Partial | core | 1 | Every mutation reverses/restores selection |
| TX-005 | Find/replace all | Missing | core | 3 | Preview, literal, case, and regex modes work |
| TX-006 | Spell/grammar checking | Missing | quality | 3 | Provider is optional and language-aware |
| TX-007 | Word/character count | Partial | quality | 2 | Live values reflect normalized policy |
| TX-008 | CPS/reading speed | Present | quality | 1 | Profile threshold drives visible state |
| TX-009 | Max line length/line count warning | Partial | quality | 2 | Live warning links to rule |
| TX-010 | Min/max duration warning | Present | quality | 1 | Thresholds are configurable |
| TX-011 | Punctuation normalization | Missing | core | 3 | Previewed transform is locale-aware |
| TX-012 | Whitespace/duplicate-space cleanup | Missing | core | 3 | Transform preserves intentional line breaks |
| TX-013 | Quote and case conversion | Missing | core | 3 | Scope and locale are explicit |
| TX-014 | Strip formatting tags | Missing | format | 3 | Supported tags removed without text loss |
| TX-015 | Search by time/number/speaker/style | Missing | core | 3 | Structured query locates exact cues |
| QC-001 | Overlap and negative-duration checks | Partial | quality | 2 | Issues identify both boundaries |
| QC-002 | Empty/identical/repeated text | Missing | quality | 3 | Adjacent and project rules report cues |
| QC-003 | Duration and minimum-gap checks | Partial | quality | 2 | Measured value and threshold shown |
| QC-004 | CPL, CPS, and line-count checks | Partial | quality | 2 | Profile controls severity |
| QC-005 | Beyond-video/outside-media checks | Missing | quality | 2 | Media duration comparison is exact |
| QC-006 | Invalid timecodes | Partial | format | 1 | Parser reports source line and recovery |
| QC-007 | Invalid/missing/duplicate numbering | Partial | format | 3 | SRT diagnostics and renumber fix work |
| QC-008 | Unclosed/invalid/unsupported tags | Missing | quality | 3 | Issue identifies tag and position |
| QC-009 | Bad punctuation and line breaks | Missing | quality | 3 | Locale profile provides fix where safe |
| QC-010 | One-word orphan lines | Missing | quality | 3 | Rule identifies avoidable orphan |
| QC-011 | Speaker/capitalization consistency | Missing | quality | 3 | Project index finds variants |
| QC-012 | Missing/untranslated translation | Missing | quality | 5 | Linked-track completeness is reported |
| QC-013 | Click issue to jump | Missing | quality | 2 | Cue is selected and revealed |

## Video, audio, and analysis

| ID | Capability | Prototype | Owner | Stage | Acceptance |
|---|---|---|---|---|---|
| AV-001 | HTML5 playback and play/pause | Present | media | 1 | Local object URL plays without upload |
| AV-002 | Frame step forward/back | Missing | media | 2 | Moves to adjacent actual frame when known |
| AV-003 | Configurable time jumps | Partial | media | 2 | Preference controls signed jump |
| AV-004 | Playback speed | Missing | media | 2 | Audio/video remain synchronized |
| AV-005 | Reverse playback | Missing | media | 4 | Supported clips step backward predictably |
| AV-006 | Loop current cue/range | Missing | media | 2 | Loop respects exact in/out boundaries |
| AV-007 | Play from start/until end | Present | media | 1 | Cue boundaries control playback |
| AV-008 | Play before/after cue | Partial | media | 2 | Configured context plays once |
| AV-009 | Waveform and zoom | Partial | wave | 2 | Progressive multiresolution waveform aligns |
| AV-010 | Waveform normalization | Missing | wave | 4 | Toggle changes scale without changing samples |
| AV-011 | Multiple audio tracks | Missing | media | 4 | Selected track drives playback/analysis |
| AV-012 | Waveform caching | Missing | storage | 2 | Reload reuses fingerprinted tiles |
| AV-013 | Video thumbnails | Missing | media | 4 | Strip loads visible tiles on demand |
| AV-014 | Scene-change detection | Partial | media | 4 | Worker produces editable scene markers |
| AV-015 | Silence detection | Missing | wave | 4 | Threshold preview produces ranges |
| AV-016 | Waveform markers | Partial | wave | 3 | Add/edit/navigate waveform markers |
| AV-017 | A/V synchronization offset | Missing | media | 4 | Non-destructive offset affects preview/export policy |
| AV-018 | External media and drag/drop | Present | media | 1 | File remains local and can be relinked |
| AV-019 | Duration and frame-rate detection | Partial | media | 2 | Metadata distinguishes CFR/VFR uncertainty |

## Styling, shortcuts, and formats

| ID | Capability | Prototype | Owner | Stage | Acceptance |
|---|---|---|---|---|---|
| ST-001 | Bold/italic/underline | Partial | style | 3 | Supported format round-trips tags |
| ST-002 | Font family/size/color | Missing | style | 4 | Style preview and ASS export agree |
| ST-003 | Outline/shadow/background | Missing | style | 4 | Renderer and serialized style agree |
| ST-004 | Alignment and positioning | Partial | style | 4 | Preview uses margins and alignment |
| ST-005 | Vertical/horizontal margins | Missing | style | 4 | Numeric controls update safe preview |
| ST-006 | Per-cue/per-line styling | Missing | style | 4 | Override scope round-trips |
| ST-007 | Speaker colors/style presets | Missing | style | 4 | Stable style IDs apply consistently |
| ST-008 | Default styles and ASS/SSA | Missing | style | 4 | Supported ASS subset has golden fixtures |
| ST-009 | HTML-like tags | Partial | format | 3 | Format policy validates and preserves tags |
| ST-010 | Position preview and safe guides | Missing | style | 4 | Title/action-safe overlays toggle |
| KB-001 | Core default shortcuts | Partial | UI | 2 | Published map triggers listed commands |
| KB-002 | Configurable shortcuts | Missing | UI | 2 | Remap persists and reports conflicts |
| KB-003 | Workflow presets | Missing | UI | 2 | Subtitle Edit/Aegisub presets load/reset |
| IO-001 | SRT import/export | Present | format | 1 | Offline golden round-trip passes |
| IO-002 | WebVTT import/export | Partial | format | 1 | Offline golden round-trip passes |
| IO-003 | ASS/SSA import/export | Partial | format | 4 | Supported subset reports loss |
| IO-004 | TTML/DFXP | Partial | format | 3 | Adapter fixtures pass |
| IO-005 | SCC | Partial | format | 3 | Frame-based fixtures pass |
| IO-006 | STL | Partial | format | 3 | Encoding/timebase fixtures pass |
| IO-007 | SBV | Partial | format | 3 | Adapter fixtures pass |
| IO-008 | CSV | Partial | format | 3 | Mapped columns preview and round-trip |
| IO-009 | Plain text | Present | format | 1 | Import/export options preserve lines |
| IO-010 | Drag/drop subtitle import | Present | UI | 1 | Drop opens supported file safely |
| IO-011 | Clipboard import | Missing | format | 3 | Paste detects format and previews |
| IO-012 | Encoding detection/UTF-8 | Partial | format | 3 | Confidence and override are exposed |
| IO-013 | RTL language support | Partial | UI | 3 | Direction and cue text render correctly |
| IO-014 | Burned-in video | Missing | media | 4 | Cancelable local render produces playable file |
| IO-015 | Subtitle download/clipboard | Partial | format | 1 | Local serialize/download is exact |
| IO-016 | Export selection/translation | Missing | format | 3 | Scope produces only intended track/cues |
| IO-017 | Styling preserve/remove | Missing | format | 3 | Export policy previews loss |
| IO-018 | Frame/ms timecodes | Partial | format | 3 | Timebase choice validates format |
| IO-019 | Preserve/renumber numbering | Partial | format | 1 | Export option produces expected sequence |

## Translation, safety, interface, and collaboration

| ID | Capability | Prototype | Owner | Stage | Acceptance |
|---|---|---|---|---|---|
| TR-001 | Original/translated columns and side-by-side edit | Missing | core | 5 | Linked tracks display and edit together |
| TR-002 | Translation memory | Missing | cloud | 5 | Adapter suggests with source attribution |
| TR-003 | Copy original to translation | Missing | core | 5 | Scope copy is undoable |
| TR-004 | Lock original | Missing | core | 5 | Mutations reject locked track |
| TR-005 | Length comparison/completeness | Missing | quality | 5 | Track metrics update incrementally |
| TR-006 | Independent/shared language timing | Missing | core | 5 | Link mode preserves stable relations |
| TR-007 | Multiple-language import/export | Missing | format | 5 | Language metadata round-trips |
| TR-008 | RTL and CJK breaking | Partial | core | 3 | Locale fixtures wrap correctly |
| TR-009 | Speaker consistency/glossary | Missing | quality | 5 | Terms and speakers validate by language |
| HS-001 | Unlimited undo/redo/history | Partial | core | 1 | Journal is bounded by storage policy, not arbitrary count |
| HS-002 | Autosave/crash recovery | Partial | storage | 1 | Forced reload restores last command |
| HS-003 | IndexedDB project storage | Missing | storage | 1 | Project and revisions persist transactionally |
| HS-004 | Restore previous version | Partial | storage | 3 | Checkpoint opens without destroying current state |
| HS-005 | Temporary backups | Present | storage | 1 | Recoveries are named and expirable |
| HS-006 | Dirty indicator/close warning | Missing | UI | 1 | Unsaved state is visible and guarded |
| HS-007 | Project import/export | Missing | storage | 1 | Portable archive validates schema |
| HS-008 | Version/collaborative history | Missing | cloud | 5 | Named versions and authors compare |
| UI-001 | Resizable panels/dockable timeline | Missing | UI | 1 | Dividers persist layout |
| UI-002 | Collapsible waveform | Partial | UI | 2 | Toggle retains scale and scroll |
| UI-003 | Grid/video/text/error/properties panels | Partial | UI | 2 | All regions coordinate selection |
| UI-004 | Dark/light/compact modes | Partial | UI | 3 | Theme and density persist |
| UI-005 | Full screen/custom font/high contrast | Partial | UI | 3 | Settings meet accessibility checks |
| UI-006 | Saved layouts and shortcuts | Missing | UI | 3 | Named workspace restores safely |
| UI-007 | Context menus | Present | UI | 1 | Keyboard and pointer open same actions |
| UI-008 | Drag/drop cue reordering | Missing | core | 3 | Reorder has explicit timing policy |
| UI-009 | Multiple tabs/projects/recent list | Missing | storage | 3 | Projects isolate state and recoveries |
| UI-010 | Responsive layout/touch | Partial | UI | 3 | Narrow and coarse-pointer flows remain usable |
| CO-001 | Accounts and team workspaces | Missing | cloud | 5 | Authentication and membership are enforced |
| CO-002 | Sharing/read-only review links | Missing | cloud | 5 | Reviewer cannot mutate cues |
| CO-003 | Cue comments/timecoded comments | Missing | cloud | 5 | Comment targets stable cue/time ID |
| CO-004 | Approval/revision status | Missing | cloud | 5 | Authorized transitions appear in history |
| CO-005 | Assigned editor and due dates | Missing | cloud | 5 | Assignment filters and notifications work |
| CO-006 | Client review mode | Missing | UI | 5 | Simplified playback/comment workflow works |
| CO-007 | Resolve comments | Missing | cloud | 5 | Resolution is permissioned and reversible by history |
| CO-008 | Activity history | Missing | cloud | 5 | Actor, command, and time are auditable |
| CO-009 | Role permissions | Missing | cloud | 5 | Server denies unauthorized operations |
| CO-010 | Cloud autosave | Missing | cloud | 5 | Offline queue reconnects idempotently |
| CO-011 | Version comparison | Missing | cloud | 5 | Text/timing diffs identify cue lineage |
| CO-012 | Approval reports | Missing | format | 5 | Export contains status, comments, and version |

## Maintenance rule

When implementation begins, add a `Delivery` column with `Planned`, `In progress`, `Verified`, or `Deferred`. A row becomes `Verified` only after its acceptance behavior has an automated test or a recorded manual cross-browser check. Prototype status remains unchanged as historical evidence.

## Related documents

- [Research and technology study](../docs.md)
- [Product requirements](requirements.md)
- [System architecture](architecture.md)
- [Interaction and interface design](ux-design.md)
- [Delivery roadmap](roadmap.md)
