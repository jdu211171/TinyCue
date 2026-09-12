import type { EditorProject, SubtitleCue, SubtitleTrack } from "../editor-core/types";

const ARCHIVE_FORMAT = "tinycue-project";
const ARCHIVE_VERSION = 1;

interface ProjectArchive {
  format: typeof ARCHIVE_FORMAT;
  version: typeof ARCHIVE_VERSION;
  project: EditorProject;
}

export class ProjectArchiveError extends Error {
  constructor(message: string) {
    super(`Invalid TinyCue project: ${message}`);
    this.name = "ProjectArchiveError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function requireCondition(condition: unknown, message: string): asserts condition {
  if (!condition) throw new ProjectArchiveError(message);
}

const isNullableString = (value: unknown) => value === null || typeof value === "string";
const isTimestamp = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0;

function validateCue(value: unknown, path: string, ids: Set<string>): asserts value is SubtitleCue {
  requireCondition(isRecord(value), `${path} must be an object`);
  requireCondition(typeof value.id === "string" && value.id.length > 0, `${path}.id must be a non-empty string`);
  requireCondition(!ids.has(value.id), `${path}.id must be unique`);
  ids.add(value.id);
  requireCondition(isTimestamp(value.startUs), `${path}.startUs must be a non-negative integer`);
  requireCondition(isTimestamp(value.endUs) && value.endUs > value.startUs, `${path}.endUs must be after startUs`);
  requireCondition(typeof value.text === "string", `${path}.text must be a string`);
  requireCondition(isNullableString(value.styleId), `${path}.styleId must be a string or null`);
  requireCondition(isNullableString(value.speaker), `${path}.speaker must be a string or null`);
  requireCondition(typeof value.notes === "string", `${path}.notes must be a string`);
  requireCondition(typeof value.locked === "boolean", `${path}.locked must be a boolean`);
  requireCondition(["draft", "review", "approved"].includes(String(value.status)), `${path}.status is unsupported`);
}

function validateTrack(value: unknown, index: number, trackIds: Set<string>, cueIds: Set<string>): asserts value is SubtitleTrack {
  const path = `project.tracks[${index}]`;
  requireCondition(isRecord(value), `${path} must be an object`);
  requireCondition(typeof value.id === "string" && value.id.length > 0, `${path}.id must be a non-empty string`);
  requireCondition(!trackIds.has(value.id), `${path}.id must be unique`);
  trackIds.add(value.id);
  requireCondition(typeof value.name === "string", `${path}.name must be a string`);
  requireCondition(isNullableString(value.language), `${path}.language must be a string or null`);
  requireCondition(["original", "translation", "captions"].includes(String(value.kind)), `${path}.kind is unsupported`);
  requireCondition(Array.isArray(value.cues), `${path}.cues must be an array`);
  value.cues.forEach((cue, cueIndex) => validateCue(cue, `${path}.cues[${cueIndex}]`, cueIds));
}

function validateProject(value: unknown): asserts value is EditorProject {
  requireCondition(isRecord(value), "project must be an object");
  requireCondition(value.schemaVersion === 1, "project schema version is unsupported");
  requireCondition(typeof value.id === "string" && value.id.length > 0, "project.id must be a non-empty string");
  requireCondition(typeof value.title === "string" && value.title.length > 0, "project.title must be a non-empty string");
  requireCondition(isNullableString(value.sourceFileName), "project.sourceFileName must be a string or null");
  requireCondition(value.sourceFormat === null || value.sourceFormat === "srt" || value.sourceFormat === "vtt" || value.sourceFormat === "txt", "project.sourceFormat is unsupported");
  requireCondition(isNullableString(value.mediaName), "project.mediaName must be a string or null");
  requireCondition(isTimestamp(value.createdAt), "project.createdAt must be a non-negative integer");
  requireCondition(isTimestamp(value.updatedAt), "project.updatedAt must be a non-negative integer");
  requireCondition(Array.isArray(value.tracks) && value.tracks.length > 0, "project.tracks must contain at least one track");
  const trackIds = new Set<string>();
  const cueIds = new Set<string>();
  value.tracks.forEach((track, index) => validateTrack(track, index, trackIds, cueIds));
}

export function serializeProjectArchive(project: EditorProject): string {
  validateProject(project);
  const archive: ProjectArchive = { format: ARCHIVE_FORMAT, version: ARCHIVE_VERSION, project };
  return `${JSON.stringify(archive, null, 2)}\n`;
}

export function parseProjectArchive(input: string): EditorProject {
  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch {
    throw new ProjectArchiveError("file is not valid JSON");
  }
  requireCondition(isRecord(value), "archive must be an object");
  requireCondition(value.format === ARCHIVE_FORMAT, "archive format is unsupported");
  requireCondition(value.version === ARCHIVE_VERSION, "archive version is unsupported");
  validateProject(value.project);
  return structuredClone(value.project);
}

export function projectArchiveFileName(title: string): string {
  const safeTitle = title.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").trim();
  return `${safeTitle || "untitled-project"}.tinycue`;
}
