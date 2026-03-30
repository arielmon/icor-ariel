import fs from "fs";
import { icorPath } from "./icor-path";

export interface KeyResult {
  text: string;
  done: boolean;
}

export interface Objective {
  title: string;
  keyResults: KeyResult[];
  status: string;
  progress: number;
}

export interface OkrData {
  quarter: string;
  objectives: Objective[];
  overallProgress: number;
}

export function getOkrData(): OkrData {
  const filePath = icorPath("OKRs", "current-quarter.md");
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    return { quarter: "", objectives: [], overallProgress: 0 };
  }

  // Extract quarter from first heading
  const quarterMatch = content.match(/^# OKRs — (.+)$/m);
  const quarter = quarterMatch ? quarterMatch[1].trim() : "";

  const objectives: Objective[] = [];
  const objSections = content.split(/^## /m).slice(1);

  for (const section of objSections) {
    const lines = section.split("\n");
    const titleLine = lines[0]?.trim() ?? "";

    // Match "Objective N: Title"
    const titleMatch = titleLine.match(/^Objective \d+:\s*(.+)$/);
    if (!titleMatch) continue;

    const title = titleMatch[1].trim();
    const keyResults: KeyResult[] = [];

    for (const line of lines.slice(1)) {
      const krMatch = line.match(/^- \[([ x])\] KR\d*:\s*(.*)$/);
      if (krMatch) {
        keyResults.push({
          done: krMatch[1] === "x",
          text: krMatch[2].trim(),
        });
      }
    }

    // Extract status
    const statusMatch = section.match(/\*\*Status:\*\*\s*(.+?)(?:\||$)/);
    const status = statusMatch ? statusMatch[1].trim() : "Not started";

    // Extract progress
    const progressMatch = section.match(/Progress:\s*(\d+)%/);
    const progress = progressMatch ? parseInt(progressMatch[1], 10) : 0;

    objectives.push({ title, keyResults, status, progress });
  }

  const overallProgress =
    objectives.length > 0
      ? Math.round(
          objectives.reduce((sum, o) => sum + o.progress, 0) /
            objectives.length
        )
      : 0;

  return { quarter, objectives, overallProgress };
}
