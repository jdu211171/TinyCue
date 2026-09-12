# Feature parity matrix

Status: scope ledger  
Stages: [delivery roadmap](roadmap.md)

This matrix maps each requested capability from the initial prototype to the TinyCue target. **Present** means the behavior was verified in the prototype; **Partial** means a limited version exists; **Missing** means it was not found. Stage 2 is the first production release. Dependencies use `core`, `media`, `wave`, `format`, `quality`, `style`, `storage`, `UI`, and `cloud` as the owning boundaries.

The `Prototype` column is frozen historical evidence and does not describe TinyCue. As of 2026-09-12, TinyCue provides the Stage 1 vertical workflow, project archives, plain-text and configurable subtitle export, batch subtitle delay, and rational frame-rate conversion, plus early Stage 2 playback caret, smooth follow, zoom, snapping, waveform, frame-sized stepping, cue loop, and quality navigation.

## Timeline, scrolling, and caret

| ID | Capability | Prototype | Owner | Stage | Acceptance | Delivery |
|---|---|---|---|---|---|---|
| TL-001 | Zoom in/out | Missing | timeline | 2 | Pointer and keyboard zoom retain anchor time | In progress |
| TL-002 | Fit to video duration | Missing | timeline | 2 | Full duration fits with work-area padding | In progress |
| TL-003 | Horizontal scrolling | Present | timeline | 1 | Scrollbar and gestures pan time | In progress |
| TL-004 | Vertical scrolling | Partial | UI | 2 | Overflowing tracks/panels scroll independently | In progress |
| TL-005 | Scroll wheel | Present | timeline | 1 | Wheel pans expected axis | In progress |
| TL-006 | Shift-wheel horizontal scroll | Missing | timeline | 2 | Shift-wheel pans time | In progress |
| TL-007 | Trackpad pinch zoom | Missing | timeline | 2 | Pinch zooms around gesture center | In progress |
| TL-008 | Millisecond/frame ruler | Partial | timeline | 2 | Mode changes labels and ticks | In progress |
| TL-009 | Timecode display | Present | core | 1 | Exact caret and cue timecode shown | Verified |
| TL-010 | Frame-number display | Missing | media | 2 | Presented frame number shown when known | In progress |
| TL-011 | Current-position caret | Present | media | 1 | Caret follows exact playback time | In progress |
| TL-012 | Cue start/end markers | Present | timeline | 1 | Handles map to exact boundaries | In progress |
| TL-013 | Draggable subtitle blocks | Present | timeline | 1 | Drag commits one undoable move | In progress |
| TL-014 | Separate waveform track | Present | wave | 2 | Wave track toggles independently | In progress |
| TL-015 | Video thumbnail strip | Missing | media | 4 | On-demand thumbnails align to timestamps | Planned |
| TL-016 | Markers and chapters | Partial | core | 3 | Add/edit/navigate typed markers | Planned |
| TL-017 | Loop region display | Missing | timeline | 2 | Active loop is visibly bounded | In progress |
| TL-018 | Work-area boundaries | Missing | core | 2 | In/out work area displays and constrains commands | In progress |
| TL-019 | Smooth horizontal scrolling | Partial | timeline | 2 | Follow and commands animate without time drift | In progress |
| TL-020 | Smooth vertical scrolling | Missing | UI | 3 | Panel/list navigation respects motion setting | Planned |
| TL-021 | Wheel momentum | Partial | timeline | 2 | Native momentum is preserved | In progress |
| TL-022 | Trackpad inertia | Partial | timeline | 2 | Manual inertia is not cancelled by playback | In progress |
| TL-023 | Auto-scroll during playback | Partial | timeline | 2 | Follow keeps caret in configured zone | In progress |
| TL-024 | Edge-triggered auto-scroll | Missing | timeline | 2 | Drag/playback scroll begins near edge | In progress |
| TL-025 | Center-caret mode | Partial | timeline | 2 | Caret targets viewport center | In progress |
| TL-026 | Keep-current-cue-visible | Partial | timeline | 2 | Active cue remains wholly or minimally visible | In progress |
| TL-027 | Scroll-lock mode | Missing | timeline | 2 | Playback never changes viewport while locked | In progress |
| TL-028 | Manual scroll during playback | Partial | timeline | 2 | Manual pan suspends follow without pausing | In progress |
| TL-029 | Scroll to current cue | Present | timeline | 1 | Command reveals active cue | In progress |
| TL-030 | Scroll to selected cue | Present | timeline | 1 | Selection command reveals cue | In progress |
| TL-031 | Scroll next/previous cue | Partial | core | 2 | Navigation selects and reveals adjacent cue | In progress |
| TL-032 | Scroll animation speed | Missing | UI | 3 | Preference changes follow interpolation | Planned |
| TL-033 | Reduced motion | Missing | UI | 2 | System/setting removes interpolation | In progress |
| TL-034 | Follow-playback toggle | Partial | timeline | 2 | Persistent visible toggle controls follow | In progress |
| TL-035 | Free caret | Present | timeline | 1 | Click seeks exact unsnapped time | In progress |
| TL-036 | Magnet caret master mode | Missing | timeline | 2 | Toggle enables configured sources | In progress |
| TL-037 | Snap to cue start | Missing | timeline | 2 | Nearest start wins within tolerance | In progress |
| TL-038 | Snap to cue end | Missing | timeline | 2 | Nearest end wins within tolerance | In progress |
| TL-039 | Snap to nearest frame | Missing | media | 2 | Resolves actual frame timestamp | In progress |
| TL-040 | Snap to waveform peaks | Missing | wave | 2 | Indexed peak candidate is selectable | In progress |
| TL-041 | Snap to other boundaries | Missing | timeline | 2 | Other cue edges are candidates | In progress |
| TL-042 | Snap to markers | Missing | timeline | 2 | Enabled marker types are candidates | In progress |
| TL-043 | Magnet tolerance | Missing | timeline | 2 | Pixel setting maps to current scale | In progress |
| TL-044 | Modifier snap bypass | Missing | timeline | 2 | Modifier suppresses snap for one gesture | In progress |
| TL-045 | Snap to grid | Missing | timeline | 2 | Configured interval is candidate source | In progress |
| TL-046 | Snap to keyframe | Missing | media | 4 | Decoded keyframes are candidates | Planned |
| TL-047 | Snap to silence | Missing | wave | 4 | Silence edges are candidates | Planned |
| TL-048 | Snap to scene change | Missing | media | 4 | Scene boundaries are candidates | Planned |

## Creation, timing, split, merge, and selection

| ID | Capability | Prototype | Owner | Stage | Acceptance | Delivery |
|---|---|---|---|---|---|---|
| ED-001 | Create at caret/video position | Present | core | 1 | New cue begins at exact caret | In progress |
| ED-002 | Create with default duration | Present | core | 1 | Preference supplies valid duration | In progress |
| ED-003 | Create from in/out points | Partial | core | 2 | Work area creates one cue | In progress |
| ED-004 | Create while playing | Present | core | 1 | Shortcut works without pausing | In progress |
| ED-005 | Set start at current position | Present | core | 1 | Command changes only start | In progress |
| ED-006 | Set end at current position | Present | core | 1 | Command changes only end | In progress |
| ED-007 | Create from selection | Partial | core | 2 | Selected time range creates cue | In progress |
| ED-008 | Create from speech/silence | Missing | wave | 4 | Detected ranges preview before creation | Planned |
| ED-009 | Duplicate cue | Missing | core | 2 | Duplicate has stable new ID | In progress |
| ED-010 | Insert before | Present | core | 1 | Valid cue placed before active cue | In progress |
| ED-011 | Insert after | Present | core | 1 | Valid cue placed after active cue | In progress |
| ED-012 | Add at end | Present | core | 1 | New cue follows final cue | In progress |
| ED-013 | Auto-place between neighbors | Present | core | 1 | Default duration respects available gap | In progress |
| ED-014 | Move cue left/right | Present | core | 1 | Body drag/shortcut preserves duration | Verified |
| ED-015 | Move only start | Present | core | 1 | Start handle preserves end | In progress |
| ED-016 | Move only end | Present | core | 1 | End handle preserves start | In progress |
| ED-017 | Change duration | Present | core | 1 | Exact field and handles agree | In progress |
| ED-018 | Extend to next cue | Missing | core | 3 | End reaches next start under gap rule | Planned |
| ED-019 | Extend from previous cue | Missing | core | 3 | Start reaches previous end under gap rule | Planned |
| ED-020 | Set exact start/end/duration | Present | core | 1 | Validated fields commit one command | In progress |
| ED-021 | Shift all forward/back | Present | core | 1 | Signed delta applies without drift | Verified |
| ED-022 | Shift selected cues | Partial | core | 2 | Only selected stable IDs move | Verified |
| ED-023 | Shift cues after current | Missing | core | 3 | Predicate batch preview is correct | Planned |
| ED-024 | Shift cues before current | Missing | core | 3 | Predicate batch preview is correct | Planned |
| ED-025 | Sync to another subtitle file | Missing | core | 3 | Anchors produce previewed transform | Planned |
| ED-026 | Frame-rate/timecode conversion | Present | core | 1 | Known-rate fixture matches expected times | Verified |
| ED-027 | Subtitle delay | Present | core | 1 | Signed delay applies to target scope | Verified |
| ED-028 | Proportional timing/stretch | Missing | core | 3 | Two anchors map cues proportionally | Planned |
| ED-029 | Recalculate after speed change | Missing | core | 4 | Speed ratio produces deterministic timing | Planned |
| ED-030 | Round to frame boundaries | Missing | media | 3 | Every boundary resolves to chosen frame rule | Planned |
| ED-031 | Remove overlaps | Missing | core | 3 | Preview resolves overlaps under policy | Planned |
| ED-032 | Add minimum gaps | Missing | core | 3 | Result meets configured gap or reports conflict | Planned |
| ED-033 | Split at caret | Present | core | 2 | Text/timing split at caret is undoable | Verified |
| ED-034 | Split at middle | Present | core | 1 | Timing divides exactly at midpoint | In progress |
| ED-035 | Split at word boundary | Partial | core | 3 | Nearest valid word split is proposed | Planned |
| ED-036 | Split at sentence boundary | Missing | core | 3 | Punctuation-aware split preserves text | Planned |
| ED-037 | Split equal durations | Missing | core | 3 | N outputs cover original interval | Planned |
| ED-038 | Split equal text lengths | Missing | core | 3 | Balanced output preserves all text | Planned |
| ED-039 | Split by line | Missing | core | 3 | Each line maps to ordered cue | Planned |
| ED-040 | Merge previous/next | Partial | core | 1 | Text and outer timing combine | In progress |
| ED-041 | Merge selected cues | Missing | core | 3 | Ordered selection merges once | Planned |
| ED-042 | Merge overlaps | Missing | core | 3 | Overlap group merges under policy | Planned |
| ED-043 | Join preserving text | Partial | core | 3 | Text policy is explicit and lossless | Planned |
| ED-044 | Join preserving timing | Partial | core | 3 | Timing policy is explicit | Planned |
| ED-045 | Split text/timing independently | Missing | core | 3 | Mode changes only chosen dimension | Planned |
| ED-046 | Split on waveform silence | Missing | wave | 4 | Candidate silence is previewed | Planned |
| ED-047 | Split on punctuation | Missing | core | 3 | Locale-aware punctuation sets split | Planned |
| ED-048 | Select current cue | Present | core | 1 | Active cue ID becomes selection anchor | In progress |
| ED-049 | Multi-select/toggle | Present | core | 1 | Ctrl/Cmd toggles stable cue IDs | In progress |
| ED-050 | Select all/range | Present | core | 1 | All and Shift-range work in grid/timeline | In progress |
| ED-051 | Select current to end/start | Missing | core | 3 | Ordered predicate selects expected IDs | Planned |
| ED-052 | Select by speaker/style | Missing | core | 3 | Metadata predicate selects matches | Planned |
| ED-053 | Select cues with errors | Missing | quality | 3 | Current filter selects affected cues | Planned |
| ED-054 | Select overlaps/time range | Missing | core | 3 | Interval predicate includes exact intersections | Planned |
| ED-055 | Extend selection by keyboard | Partial | core | 2 | Shortcut extends from anchor | In progress |
| ED-056 | Preserve selection in playback | Partial | core | 2 | Playback does not clear selection | In progress |

## Text editing and quality

| ID | Capability | Prototype | Owner | Stage | Acceptance | Delivery |
|---|---|---|---|---|---|---|
| TX-001 | Inline and full grid editing | Partial | UI | 1 | Grid and editor update same command state | In progress |
| TX-002 | Multiline and line breaks | Present | core | 1 | Manual breaks round-trip | Verified |
| TX-003 | Auto wrap / preserve manual breaks | Present | core | 1 | Reflow is optional and undoable | In progress |
| TX-004 | Undo/redo | Partial | core | 1 | Every mutation reverses/restores selection | Verified |
| TX-005 | Find/replace all | Missing | core | 3 | Preview, literal, case, and regex modes work | Planned |
| TX-006 | Spell/grammar checking | Missing | quality | 3 | Provider is optional and language-aware | Planned |
| TX-007 | Word/character count | Partial | quality | 2 | Live values reflect normalized policy | In progress |
| TX-008 | CPS/reading speed | Present | quality | 1 | Profile threshold drives visible state | In progress |
| TX-009 | Max line length/line count warning | Partial | quality | 2 | Live warning links to rule | In progress |
| TX-010 | Min/max duration warning | Present | quality | 1 | Thresholds are configurable | In progress |
| TX-011 | Punctuation normalization | Missing | core | 3 | Previewed transform is locale-aware | Planned |
| TX-012 | Whitespace/duplicate-space cleanup | Missing | core | 3 | Transform preserves intentional line breaks | Planned |
| TX-013 | Quote and case conversion | Missing | core | 3 | Scope and locale are explicit | Planned |
| TX-014 | Strip formatting tags | Missing | format | 3 | Supported tags removed without text loss | Planned |
| TX-015 | Search by time/number/speaker/style | Missing | core | 3 | Structured query locates exact cues | Planned |
| QC-001 | Overlap and negative-duration checks | Partial | quality | 2 | Issues identify both boundaries | In progress |
| QC-002 | Empty/identical/repeated text | Missing | quality | 3 | Adjacent and project rules report cues | Planned |
| QC-003 | Duration and minimum-gap checks | Partial | quality | 2 | Measured value and threshold shown | In progress |
| QC-004 | CPL, CPS, and line-count checks | Partial | quality | 2 | Profile controls severity | In progress |
| QC-005 | Beyond-video/outside-media checks | Missing | quality | 2 | Media duration comparison is exact | In progress |
| QC-006 | Invalid timecodes | Partial | format | 1 | Parser reports source line and recovery | In progress |
| QC-007 | Invalid/missing/duplicate numbering | Partial | format | 3 | SRT diagnostics and renumber fix work | Planned |
| QC-008 | Unclosed/invalid/unsupported tags | Missing | quality | 3 | Issue identifies tag and position | Planned |
| QC-009 | Bad punctuation and line breaks | Missing | quality | 3 | Locale profile provides fix where safe | Planned |
| QC-010 | One-word orphan lines | Missing | quality | 3 | Rule identifies avoidable orphan | Planned |
| QC-011 | Speaker/capitalization consistency | Missing | quality | 3 | Project index finds variants | Planned |
| QC-012 | Missing/untranslated translation | Missing | quality | 5 | Linked-track completeness is reported | Planned |
| QC-013 | Click issue to jump | Missing | quality | 2 | Cue is selected and revealed | In progress |

## Video, audio, and analysis

| ID | Capability | Prototype | Owner | Stage | Acceptance | Delivery |
|---|---|---|---|---|---|---|
| AV-001 | HTML5 playback and play/pause | Present | media | 1 | Local object URL plays without upload | In progress |
| AV-002 | Frame step forward/back | Missing | media | 2 | Moves to adjacent actual frame when known | In progress |
| AV-003 | Configurable time jumps | Partial | media | 2 | Preference controls signed jump | In progress |
| AV-004 | Playback speed | Missing | media | 2 | Audio/video remain synchronized | In progress |
| AV-005 | Reverse playback | Missing | media | 4 | Supported clips step backward predictably | Planned |
| AV-006 | Loop current cue/range | Missing | media | 2 | Loop respects exact in/out boundaries | In progress |
| AV-007 | Play from start/until end | Present | media | 1 | Cue boundaries control playback | In progress |
| AV-008 | Play before/after cue | Partial | media | 2 | Configured context plays once | In progress |
| AV-009 | Waveform and zoom | Partial | wave | 2 | Progressive multiresolution waveform aligns | In progress |
| AV-010 | Waveform normalization | Missing | wave | 4 | Toggle changes scale without changing samples | Planned |
| AV-011 | Multiple audio tracks | Missing | media | 4 | Selected track drives playback/analysis | Planned |
| AV-012 | Waveform caching | Missing | storage | 2 | Reload reuses fingerprinted tiles | In progress |
| AV-013 | Video thumbnails | Missing | media | 4 | Strip loads visible tiles on demand | Planned |
| AV-014 | Scene-change detection | Partial | media | 4 | Worker produces editable scene markers | Planned |
| AV-015 | Silence detection | Missing | wave | 4 | Threshold preview produces ranges | Planned |
| AV-016 | Waveform markers | Partial | wave | 3 | Add/edit/navigate waveform markers | Planned |
| AV-017 | A/V synchronization offset | Missing | media | 4 | Non-destructive offset affects preview/export policy | Planned |
| AV-018 | External media and drag/drop | Present | media | 1 | File remains local and can be relinked | In progress |
| AV-019 | Duration and frame-rate detection | Partial | media | 2 | Metadata distinguishes CFR/VFR uncertainty | In progress |

## Styling, shortcuts, and formats

| ID | Capability | Prototype | Owner | Stage | Acceptance | Delivery |
|---|---|---|---|---|---|---|
| ST-001 | Bold/italic/underline | Partial | style | 3 | Supported format round-trips tags | Planned |
| ST-002 | Font family/size/color | Missing | style | 4 | Style preview and ASS export agree | Planned |
| ST-003 | Outline/shadow/background | Missing | style | 4 | Renderer and serialized style agree | Planned |
| ST-004 | Alignment and positioning | Partial | style | 4 | Preview uses margins and alignment | Planned |
| ST-005 | Vertical/horizontal margins | Missing | style | 4 | Numeric controls update safe preview | Planned |
| ST-006 | Per-cue/per-line styling | Missing | style | 4 | Override scope round-trips | Planned |
| ST-007 | Speaker colors/style presets | Missing | style | 4 | Stable style IDs apply consistently | Planned |
| ST-008 | Default styles and ASS/SSA | Missing | style | 4 | Supported ASS subset has golden fixtures | Planned |
| ST-009 | HTML-like tags | Partial | format | 3 | Format policy validates and preserves tags | Planned |
| ST-010 | Position preview and safe guides | Missing | style | 4 | Title/action-safe overlays toggle | Planned |
| KB-001 | Core default shortcuts | Partial | UI | 2 | Published map triggers listed commands | In progress |
| KB-002 | Configurable shortcuts | Missing | UI | 2 | Remap persists and reports conflicts | In progress |
| KB-003 | Workflow presets | Missing | UI | 2 | Subtitle Edit/Aegisub presets load/reset | In progress |
| IO-001 | SRT import/export | Present | format | 1 | Offline golden round-trip passes | Verified |
| IO-002 | WebVTT import/export | Partial | format | 1 | Offline golden round-trip passes | Verified |
| IO-003 | ASS/SSA import/export | Partial | format | 4 | Supported subset reports loss | Planned |
| IO-004 | TTML/DFXP | Partial | format | 3 | Adapter fixtures pass | Planned |
| IO-005 | SCC | Partial | format | 3 | Frame-based fixtures pass | Planned |
| IO-006 | STL | Partial | format | 3 | Encoding/timebase fixtures pass | Planned |
| IO-007 | SBV | Partial | format | 3 | Adapter fixtures pass | Planned |
| IO-008 | CSV | Partial | format | 3 | Mapped columns preview and round-trip | Planned |
| IO-009 | Plain text | Present | format | 1 | Import/export options preserve lines | Verified |
| IO-010 | Drag/drop subtitle import | Present | UI | 1 | Drop opens supported file safely | In progress |
| IO-011 | Clipboard import | Missing | format | 3 | Paste detects format and previews | Planned |
| IO-012 | Encoding detection/UTF-8 | Partial | format | 3 | Confidence and override are exposed | Planned |
| IO-013 | RTL language support | Partial | UI | 3 | Direction and cue text render correctly | Planned |
| IO-014 | Burned-in video | Missing | media | 4 | Cancelable local render produces playable file | Planned |
| IO-015 | Subtitle download/clipboard | Partial | format | 1 | Local serialize/download is exact | In progress |
| IO-016 | Export selection/translation | Missing | format | 3 | Scope produces only intended track/cues | In progress |
| IO-017 | Styling preserve/remove | Missing | format | 3 | Export policy previews loss | Planned |
| IO-018 | Frame/ms timecodes | Partial | format | 3 | Timebase choice validates format | Planned |
| IO-019 | Preserve/renumber numbering | Partial | format | 1 | Export option produces expected sequence | Verified |

## Translation, safety, interface, and collaboration

| ID | Capability | Prototype | Owner | Stage | Acceptance | Delivery |
|---|---|---|---|---|---|---|
| TR-001 | Original/translated columns and side-by-side edit | Missing | core | 5 | Linked tracks display and edit together | Planned |
| TR-002 | Translation memory | Missing | cloud | 5 | Adapter suggests with source attribution | Planned |
| TR-003 | Copy original to translation | Missing | core | 5 | Scope copy is undoable | Planned |
| TR-004 | Lock original | Missing | core | 5 | Mutations reject locked track | Planned |
| TR-005 | Length comparison/completeness | Missing | quality | 5 | Track metrics update incrementally | Planned |
| TR-006 | Independent/shared language timing | Missing | core | 5 | Link mode preserves stable relations | Planned |
| TR-007 | Multiple-language import/export | Missing | format | 5 | Language metadata round-trips | Planned |
| TR-008 | RTL and CJK breaking | Partial | core | 3 | Locale fixtures wrap correctly | Planned |
| TR-009 | Speaker consistency/glossary | Missing | quality | 5 | Terms and speakers validate by language | Planned |
| HS-001 | Unlimited undo/redo/history | Partial | core | 1 | Journal is bounded by storage policy, not arbitrary count | In progress |
| HS-002 | Autosave/crash recovery | Partial | storage | 1 | Forced reload restores last command | In progress |
| HS-003 | IndexedDB project storage | Missing | storage | 1 | Project and revisions persist transactionally | In progress |
| HS-004 | Restore previous version | Partial | storage | 3 | Checkpoint opens without destroying current state | Planned |
| HS-005 | Temporary backups | Present | storage | 1 | Recoveries are named and expirable | In progress |
| HS-006 | Dirty indicator/close warning | Missing | UI | 1 | Unsaved state is visible and guarded | In progress |
| HS-007 | Project import/export | Missing | storage | 1 | Portable archive validates schema | Verified |
| HS-008 | Version/collaborative history | Missing | cloud | 5 | Named versions and authors compare | Planned |
| UI-001 | Resizable panels/dockable timeline | Missing | UI | 1 | Dividers persist layout | In progress |
| UI-002 | Collapsible waveform | Partial | UI | 2 | Toggle retains scale and scroll | In progress |
| UI-003 | Grid/video/text/error/properties panels | Partial | UI | 2 | All regions coordinate selection | In progress |
| UI-004 | Dark/light/compact modes | Partial | UI | 3 | Theme and density persist | Planned |
| UI-005 | Full screen/custom font/high contrast | Partial | UI | 3 | Settings meet accessibility checks | Planned |
| UI-006 | Saved layouts and shortcuts | Missing | UI | 3 | Named workspace restores safely | Planned |
| UI-007 | Context menus | Present | UI | 1 | Keyboard and pointer open same actions | In progress |
| UI-008 | Drag/drop cue reordering | Missing | core | 3 | Reorder has explicit timing policy | Planned |
| UI-009 | Multiple tabs/projects/recent list | Missing | storage | 3 | Projects isolate state and recoveries | Planned |
| UI-010 | Responsive layout/touch | Partial | UI | 3 | Narrow and coarse-pointer flows remain usable | Planned |
| CO-001 | Accounts and team workspaces | Missing | cloud | 5 | Authentication and membership are enforced | Planned |
| CO-002 | Sharing/read-only review links | Missing | cloud | 5 | Reviewer cannot mutate cues | Planned |
| CO-003 | Cue comments/timecoded comments | Missing | cloud | 5 | Comment targets stable cue/time ID | Planned |
| CO-004 | Approval/revision status | Missing | cloud | 5 | Authorized transitions appear in history | Planned |
| CO-005 | Assigned editor and due dates | Missing | cloud | 5 | Assignment filters and notifications work | Planned |
| CO-006 | Client review mode | Missing | UI | 5 | Simplified playback/comment workflow works | Planned |
| CO-007 | Resolve comments | Missing | cloud | 5 | Resolution is permissioned and reversible by history | Planned |
| CO-008 | Activity history | Missing | cloud | 5 | Actor, command, and time are auditable | Planned |
| CO-009 | Role permissions | Missing | cloud | 5 | Server denies unauthorized operations | Planned |
| CO-010 | Cloud autosave | Missing | cloud | 5 | Offline queue reconnects idempotently | Planned |
| CO-011 | Version comparison | Missing | cloud | 5 | Text/timing diffs identify cue lineage | Planned |
| CO-012 | Approval reports | Missing | format | 5 | Export contains status, comments, and version | Planned |

## Maintenance rule

When implementation begins, add a `Delivery` column with `Planned`, `In progress`, `Verified`, or `Deferred`. A row becomes `Verified` only after its acceptance behavior has an automated test or a recorded manual cross-browser check. Prototype status remains unchanged as historical evidence.

## Related documents

- [Research and technology study](../docs.md)
- [Product requirements](requirements.md)
- [System architecture](architecture.md)
- [Interaction and interface design](ux-design.md)
- [Delivery roadmap](roadmap.md)
