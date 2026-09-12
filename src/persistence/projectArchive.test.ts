import { describe, expect, it } from "vitest";
import { createCue, createProject } from "../editor-core/types";
import { parseProjectArchive, projectArchiveFileName, serializeProjectArchive } from "./projectArchive";

describe("TinyCue project archives", () => {
  it("round-trips project metadata, cue IDs, text, and exact timing", () => {
    const project = createProject("Interview");
    const cue = createCue(1_234_567, 3_456_789, "Hello\nworld");
    project.sourceFileName = "interview.srt";
    project.sourceFormat = "srt";
    project.mediaName = "interview.mp4";
    project.tracks[0].cues = [cue];

    expect(parseProjectArchive(serializeProjectArchive(project))).toEqual(project);
  });

  it("rejects unsupported versions and invalid cue timing", () => {
    const project = createProject();
    project.tracks[0].cues = [createCue(1_000_000, 2_000_000)];
    const archive = JSON.parse(serializeProjectArchive(project));
    archive.version = 2;
    expect(() => parseProjectArchive(JSON.stringify(archive))).toThrow("archive version is unsupported");

    archive.version = 1;
    archive.project.tracks[0].cues[0].endUs = 500_000;
    expect(() => parseProjectArchive(JSON.stringify(archive))).toThrow("endUs must be after startUs");
  });

  it("rejects duplicate stable IDs", () => {
    const project = createProject();
    const cue = createCue(1_000_000, 2_000_000);
    project.tracks[0].cues = [cue, { ...cue }];
    expect(() => serializeProjectArchive(project)).toThrow("id must be unique");
  });

  it("creates a filesystem-safe archive name", () => {
    expect(projectArchiveFileName('  Episode: 1/2?  ')).toBe("Episode- 1-2-.tinycue");
    expect(projectArchiveFileName("\u0000")).toBe("-.tinycue");
  });
});
