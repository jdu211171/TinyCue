import Dexie, { type EntityTable } from "dexie";
import type { EditorProject } from "../editor-core/types";

export interface ProjectRecord {
  id: string;
  title: string;
  project: EditorProject;
  savedAt: number;
}

class SubtitleDatabase extends Dexie {
  projects!: EntityTable<ProjectRecord, "id">;
  constructor() {
    super("tinycue");
    this.version(1).stores({ projects: "id, savedAt, title" });
  }
}

export const database = new SubtitleDatabase();

export async function saveProject(project: EditorProject) {
  await database.projects.put({ id: project.id, title: project.title, project: structuredClone(project), savedAt: Date.now() });
}

export async function latestProject(): Promise<EditorProject | null> {
  const records = await database.projects.orderBy("savedAt").reverse().limit(1).toArray();
  return records[0]?.project ?? null;
}
