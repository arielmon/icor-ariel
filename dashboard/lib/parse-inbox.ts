import fs from "fs";
import { icorPath } from "./icor-path";

export interface InboxItem {
  date: string;
  text: string;
}

export interface InboxData {
  unprocessed: InboxItem[];
  processedCount: number;
}

function parseItems(lines: string[]): InboxItem[] {
  const items: InboxItem[] = [];
  for (const line of lines) {
    const match = line.match(/^- \[(\d{4}-\d{2}-\d{2})\] (.+)$/);
    if (match) {
      items.push({ date: match[1], text: match[2].trim() });
    }
  }
  return items;
}

export function getInboxData(): InboxData {
  const filePath = icorPath("Inbox", "inbox.md");
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    return { unprocessed: [], processedCount: 0 };
  }

  const sections = content.split(/^## /m);
  let unprocessed: InboxItem[] = [];
  let processedCount = 0;

  for (const section of sections) {
    const lines = section.split("\n");
    const header = lines[0]?.trim().toLowerCase() ?? "";

    if (header.startsWith("unprocessed")) {
      unprocessed = parseItems(lines.slice(1));
    } else if (header.startsWith("processed")) {
      processedCount = parseItems(lines.slice(1)).length;
    }
  }

  return { unprocessed, processedCount };
}
