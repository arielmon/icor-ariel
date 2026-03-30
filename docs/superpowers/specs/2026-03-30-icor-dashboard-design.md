# ICOR Dashboard — Design Spec

## Context

The ICOR Life OS is a file-based productivity system made of Markdown files managed through Claude Code slash commands. There's no visual interface — everything happens in the terminal. This dashboard gives Ariel a read-only web view of all ICOR data so he can scan his system state at a glance from any device. The design is built to support future interactivity (editing tasks, processing inbox) without a rewrite.

## Decisions

| Decision | Choice |
|---|---|
| Type | Read-only (architecture supports future interactivity) |
| Stack | Next.js with Static Site Generation, deployed to Vercel |
| Layout | Responsive: 2-column grid on desktop, vertical feed on mobile |
| Theme | Dark Minimal — #050505 background, #d4d4d4 text, red/green/yellow accents |
| Sections | Tasks, Inbox, OKRs, Journal |
| Auth | Public (no authentication) |
| Data source | Markdown files parsed at build time |

## Architecture

### Data Flow

```
ICOR/*.md files → Next.js build (server components) → regex-based parsers → static HTML → Vercel CDN
```

Updates happen on every `git push` — Vercel rebuilds automatically.

### Project Structure

```
ICOR/
├── dashboard/              # Next.js project
│   ├── app/
│   │   ├── layout.tsx      # Root layout, dark theme, fonts
│   │   ├── page.tsx        # Main dashboard page (server component)
│   │   └── globals.css     # Global styles, CSS variables
│   ├── components/
│   │   ├── Header.tsx      # ICOR title, date, stat dots
│   │   ├── TasksSection.tsx    # Tasks grouped by priority
│   │   ├── InboxSection.tsx    # Inbox count + item list
│   │   ├── OkrSection.tsx      # OKR objectives with progress bars
│   │   ├── JournalSection.tsx  # Journal entries + gratitude
│   │   └── Section.tsx     # Shared section wrapper (header + badge + collapsible)
│   ├── lib/
│   │   ├── parse-tasks.ts  # Parse ../Tasks/tasks.md → structured data
│   │   ├── parse-inbox.ts  # Parse ../Inbox/inbox.md → structured data
│   │   ├── parse-okrs.ts   # Parse ../OKRs/current-quarter.md → structured data
│   │   ├── parse-journal.ts # Parse ../Journal/YYYY-MM/*.md → structured data
│   │   └── icor-path.ts    # Resolve path to ICOR data directory (parent of dashboard/)
│   ├── public/
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   └── tsconfig.json
├── Tasks/tasks.md          # ← read by parsers
├── Inbox/inbox.md
├── OKRs/current-quarter.md
├── Journal/YYYY-MM/*.md
└── ...
```

### Key Technical Decisions

**Tailwind CSS** for styling — matches the rapid iteration style, utility-first aligns with the dark minimal theme, and the mockup CSS translates directly to Tailwind classes.

**No database** — Markdown files are the single source of truth. Parsed at build time by simple regex/line-based parsers (not full Markdown AST — the files have a known, stable structure).

**ICOR data in the repo** — The dashboard project lives inside the existing `ICOR/` directory (e.g., `ICOR/dashboard/`). The parsers read `../Tasks/tasks.md`, `../Inbox/inbox.md`, etc. using relative paths resolved at build time. This avoids any copy/symlink complexity.

**No client-side JavaScript for data** — Everything is server-rendered. The only JS is for section collapse/expand (optional progressive enhancement).

## Components

### Header
- "ICOR" title (left) + formatted date (right)
- Stats bar below: 3 stat pills showing task count, inbox count, OKR status
- Each stat has a colored dot (red/yellow/green/gray) with glow

### TasksSection
- Parses `Tasks/tasks.md`
- Groups tasks by priority: Must (red label), Should (yellow), Could (gray)
- Each task shows: checkbox (visual only), task text, area tag pill
- Badge shows total pending count

### InboxSection
- Parses `Inbox/inbox.md`
- Counts items under `## Unprocessed`
- Shows each unprocessed item with a red dot and date
- Green badge when empty, red badge when items exist

### OkrSection
- Parses `OKRs/current-quarter.md`
- Shows each Objective with title and progress bar
- Progress bar color: green (>60%), yellow (30-60%), red (<30%), gray (0%)
- Shows "Sin definir" badge when objectives are TBD

### JournalSection
- Reads the most recent journal file from `Journal/YYYY-MM/`
- Shows brain dump entries with timestamps, left-bordered
- Gratitude items with green label
- On desktop: journal entries in 2-column grid, gratitude full width

### Section (shared wrapper)
- Header bar with title (uppercase) + badge
- Dark card with subtle border (#1a1a1a)
- Expandable/collapsible (optional, for mobile)

## Responsive Layout

### Mobile (<768px)
- Single column, vertical feed
- Stats bar stacked vertically
- All sections full width
- 16px horizontal padding

### Tablet/Desktop (768px+)
- 2-column CSS Grid
- Tasks: column 1, rows 1-2 (tall card)
- Inbox: column 2, row 1
- OKRs: column 2, row 2
- Journal: full width below
- 24px gap between cards

### Large Desktop (1024px+)
- Max width 1200px, centered
- 48px horizontal padding
- Larger title

## Markdown Parsing

Each parser reads a specific file and returns typed data. No need for a generic Markdown parser — the files have predictable structure.

### parse-tasks.ts
```typescript
interface Task {
  text: string;
  done: boolean;
  tag: string | null;  // "#work", "#finance", etc.
}
interface TaskData {
  must: Task[];
  should: Task[];
  could: Task[];
  totalPending: number;
}
```
Parsing: Split by `## Must`, `## Should`, `## Could` headers. Match lines like `- [ ] text #tag` or `- [x] text #tag`.

### parse-inbox.ts
```typescript
interface InboxItem {
  date: string;
  text: string;
}
interface InboxData {
  unprocessed: InboxItem[];
  processedCount: number;
}
```
Parsing: Split by `## Unprocessed` / `## Processed`. Match `- [date] text` pattern.

### parse-okrs.ts
```typescript
interface KeyResult {
  text: string;
  done: boolean;
}
interface Objective {
  title: string;
  keyResults: KeyResult[];
  status: string;
  progress: number;
}
interface OkrData {
  quarter: string;
  objectives: Objective[];
}
```
Parsing: Match `## Objective N: title`, then `- [ ] KR:`, then `**Status:**` line.

### parse-journal.ts
```typescript
interface JournalEntry {
  timestamp: string;
  text: string;
}
interface JournalData {
  date: string;
  brainDumps: JournalEntry[];
  gratitude: string[];
  top3: string[];
}
```
Parsing: Split by `## Brain dump`, `## Gratitude`, `## Top 3 today`. Match `- [HH:MM] text` for timestamps.

## Color System

```css
--bg-base:      #050505;
--bg-card:      #0a0a0a;
--bg-card-header: #0f0f0f;
--bg-elevated:  #0d0d0d;
--border:       #1a1a1a;
--border-subtle:#141414;

--text-primary: #ffffff;
--text-body:    #d4d4d4;
--text-secondary:#b3b3b3;
--text-muted:   #a3a3a3;
--text-dim:     #737373;
--text-faint:   #525252;

--accent-red:   #ef4444;
--accent-red-text: #f87171;
--accent-yellow:#f59e0b;
--accent-yellow-text: #fbbf24;
--accent-green: #22c55e;
--accent-green-text: #4ade80;
```

## Verification Plan

1. **Build locally**: `npm run build` — should complete without errors
2. **Check parsers**: Verify each parser correctly reads the current ICOR Markdown files
3. **Visual check**: Compare rendered dashboard against approved mockup (v3)
4. **Responsive test**: Resize browser from 375px to 1440px — layout should adapt at 768px breakpoint
5. **Deploy to Vercel**: `vercel deploy` — verify it builds and serves correctly
6. **Data accuracy**: Compare dashboard content against actual Markdown file contents

## Visual Reference

Approved mockup: `.superpowers/brainstorm/589-1774888830/content/full-dashboard-mockup-v3.html`
