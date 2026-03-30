---
name: control
description: Process the ICOR inbox — move items to the right place.
user_invocable: true
---

Process the ICOR inbox — move items to the right place.

Read `Inbox/inbox.md`. For each item under `## Unprocessed`:

1. Show the item to the user
2. Ask: "Where does this go?" with options:
   - **Task** → Add to `Tasks/tasks.md` (ask priority: Must/Should/Could and life area tag)
   - **Knowledge** → Save to appropriate file in `Knowledge/` (Areas, Projects, or Resources)
   - **OKR** → Add or update in `OKRs/current-quarter.md`
   - **Journal** → Add to today's journal entry in `Journal/`
   - **Delete** → Remove it (not everything needs to be kept)
3. After processing, move the item from `## Unprocessed` to `## Processed`
4. Continue until inbox is at zero
5. End with: "Inbox processed. X items routed."

Be efficient — if the destination is obvious, suggest it and let the user confirm with a quick "y".
