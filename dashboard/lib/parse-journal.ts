import fs from "fs";
import path from "path";
import { icorPath } from "./icor-path";

export interface JournalEntry {
  timestamp: string;
  text: string;
}

export interface JournalData {
  date: string;
  brainDumps: JournalEntry[];
  gratitude: string[];
  top3: string[];
}

function findLatestJournal(): string | null {
  const journalDir = icorPath("Journal");

  let monthDirs: string[];
  try {
    monthDirs = fs
      .readdirSync(journalDir)
      .filter((d) => /^\d{4}-\d{2}$/.test(d))
      .sort()
      .reverse();
  } catch {
    return null;
  }

  for (const month of monthDirs) {
    const monthPath = path.join(journalDir, month);
    const files = fs
      .readdirSync(monthPath)
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .sort()
      .reverse();

    if (files.length > 0) {
      return path.join(monthPath, files[0]);
    }
  }

  return null;
}

export function getJournalData(): JournalData | null {
  const filePath = findLatestJournal();
  if (!filePath) return null;

  const content = fs.readFileSync(filePath, "utf-8");

  // Extract date from filename
  const dateMatch = path.basename(filePath).match(/^(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : "";

  const sections = content.split(/^## /m);
  const brainDumps: JournalEntry[] = [];
  const gratitude: string[] = [];
  const top3: string[] = [];

  for (const section of sections) {
    const lines = section.split("\n");
    const header = lines[0]?.trim().toLowerCase() ?? "";

    if (header.startsWith("brain dump") || header.startsWith("brain-dump")) {
      for (const line of lines.slice(1)) {
        // Match "- [HH:MM] text" pattern
        const tsMatch = line.match(/^- \[(\d{2}:\d{2})\] (.+)$/);
        if (tsMatch) {
          brainDumps.push({ timestamp: tsMatch[1], text: tsMatch[2].trim() });
        } else if (line.startsWith("- ") && !line.startsWith("- Ref:") && !line.includes("<!--")) {
          // Plain bullet without timestamp
          const text = line.replace(/^- /, "").trim();
          if (text) {
            brainDumps.push({ timestamp: "", text });
          }
        }
      }
    } else if (header.startsWith("gratitude")) {
      for (const line of lines.slice(1)) {
        if (line.startsWith("- ") && line.trim() !== "-") {
          gratitude.push(line.replace(/^- /, "").trim());
        }
      }
    } else if (header.startsWith("top 3")) {
      for (const line of lines.slice(1)) {
        const numMatch = line.match(/^\d+\.\s*(.+)$/);
        if (numMatch && numMatch[1].trim()) {
          top3.push(numMatch[1].trim());
        }
      }
    }
  }

  return { date, brainDumps, gratitude, top3 };
}
