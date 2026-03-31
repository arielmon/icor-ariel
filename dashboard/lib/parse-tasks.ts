import fs from "fs";
import { icorPath } from "./icor-path";

export interface Task {
  text: string;
  done: boolean;
  tag: string | null;
}

export interface TaskData {
  must: Task[];
  should: Task[];
  could: Task[];
  totalPending: number;
}

function parseTasks(lines: string[]): Task[] {
  const tasks: Task[] = [];
  for (const line of lines) {
    const match = line.match(/^- \[([ x])\] (.+)$/);
    if (!match) continue;
    const done = match[1] === "x";
    let text = match[2].trim();
    let tag: string | null = null;

    const tagMatch = text.match(/(#\w+)\s*$/);
    if (tagMatch) {
      tag = tagMatch[1];
      text = text.slice(0, -tagMatch[0].length).trim();
    }

    tasks.push({ text, done, tag });
  }
  return tasks;
}

export function getTaskData(): TaskData {
  const filePath = icorPath("Tasks", "tasks.md");
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    return { must: [], should: [], could: [], totalPending: 0 };
  }

  const sections = content.split(/^## /m);
  let must: Task[] = [];
  let should: Task[] = [];
  let could: Task[] = [];

  for (const section of sections) {
    const lines = section.split("\n");
    const header = lines[0]?.trim().toLowerCase() ?? "";

    if (header.startsWith("must")) {
      must = parseTasks(lines.slice(1)).filter((t) => !t.done);
    } else if (header.startsWith("should")) {
      should = parseTasks(lines.slice(1)).filter((t) => !t.done);
    } else if (header.startsWith("could")) {
      could = parseTasks(lines.slice(1)).filter((t) => !t.done);
    }
  }

  const totalPending = [...must, ...should, ...could].filter(
    (t) => !t.done
  ).length;

  return { must, should, could, totalPending };
}
