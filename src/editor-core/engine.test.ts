import { describe, expect, it } from "vitest";
import { EditorEngine } from "./engine";
import { frameRateScale } from "./frameRates";
import { createCue, createProject } from "./types";

describe("EditorEngine", () => {
  it("moves, splits, and restores cues through undo", () => {
    const project = createProject(); const cue = createCue(1_000_000, 3_000_000, "Hello world"); project.tracks[0].cues = [cue];
    const engine = new EditorEngine(project);
    engine.dispatch({ type: "move-cues", ids: [cue.id], deltaUs: 500_000 });
    expect(engine.getSnapshot().project.tracks[0].cues[0].startUs).toBe(1_500_000);
    engine.dispatch({ type: "split-cue", id: cue.id, atUs: 2_000_000 });
    expect(engine.getSnapshot().project.tracks[0].cues.map(item => item.text)).toEqual(["Hello", "world"]);
    engine.undo(); expect(engine.getSnapshot().project.tracks[0].cues).toHaveLength(1);
    engine.undo(); expect(engine.getSnapshot().project.tracks[0].cues[0].startUs).toBe(1_000_000);
    engine.redo(); expect(engine.getSnapshot().project.tracks[0].cues[0].startUs).toBe(1_500_000);
  });
  it("shifts all or selected cues, clamps at zero, and preserves locked cues", () => {
    const project = createProject(); const first = createCue(500_000, 1_500_000); const second = createCue(2_000_000, 3_000_000); const locked = { ...createCue(100_000, 200_000), locked: true };
    project.tracks[0].cues = [locked, first, second]; const engine = new EditorEngine(project);
    engine.dispatch({ type: "shift-all", deltaUs: -1_000_000 });
    expect(engine.getSnapshot().project.tracks[0].cues.map(cue => [cue.id, cue.startUs])).toEqual([[first.id, 0], [locked.id, 100_000], [second.id, 1_500_000]]);
    engine.dispatch({ type: "move-cues", ids: [second.id], deltaUs: 250_000.4 });
    expect(engine.getSnapshot().project.tracks[0].cues.find(cue => cue.id === second.id)?.startUs).toBe(1_750_000);
    engine.undo(); engine.undo();
    expect(engine.getSnapshot().project.tracks[0].cues.map(cue => cue.startUs)).toEqual([100_000, 500_000, 2_000_000]);
  });
  it("converts frame-rate timing with a rational scale and stable IDs", () => {
    const project = createProject(); const cue = createCue(24_000_000, 48_000_000); project.tracks[0].cues = [cue]; const engine = new EditorEngine(project);
    const scale = frameRateScale("24/1", "24000/1001");
    engine.dispatch({ type: "scale-cues", ids: [cue.id], ...scale });
    expect(engine.getSnapshot().project.tracks[0].cues[0]).toMatchObject({ id: cue.id, startUs: 24_024_000, endUs: 48_048_000 });
    engine.undo(); expect(engine.getSnapshot().project.tracks[0].cues[0]).toMatchObject({ id: cue.id, startUs: 24_000_000, endUs: 48_000_000 });
    engine.redo(); expect(engine.getSnapshot().project.tracks[0].cues[0].startUs).toBe(24_024_000);
  });
  it("deletes selected cues and restores them with undo", () => {
    const project = createProject(); const first = createCue(0, 1_000_000, "First"); const second = createCue(2_000_000, 3_000_000, "Second");
    project.tracks[0].cues = [first, second]; const engine = new EditorEngine(project); engine.select([first.id], first.id);
    engine.dispatch({ type: "delete-cues", ids: engine.getSnapshot().selectedIds });
    expect(engine.getSnapshot().project.tracks[0].cues.map(cue => cue.id)).toEqual([second.id]);
    engine.undo();
    expect(engine.getSnapshot().project.tracks[0].cues.map(cue => cue.id)).toEqual([first.id, second.id]);
    expect(engine.getSnapshot().selectedIds).toEqual([first.id]);
  });
});
