import { describe, expect, it } from "vitest";
import { EditorEngine } from "./engine";
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
});
