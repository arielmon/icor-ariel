---
name: inbox
description: Quick capture to ICOR inbox.
user_invocable: true
---

Quick capture to ICOR inbox.

Read the file `Inbox/inbox.md`. Then:

1. If the user provided text after the command (e.g. `/inbox call dentist`), append it as a new bullet under `## Unprocessed` with today's date prefix: `- [YYYY-MM-DD] item text`
2. If no text was provided, ask: "What do you want to capture?"
3. After adding, show the current count of unprocessed items.
4. Keep the response to 1-2 lines. Example: "Added to inbox. You have 5 unprocessed items."
