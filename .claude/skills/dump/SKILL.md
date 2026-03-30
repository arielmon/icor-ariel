---
name: dump
description: Brain dump — capture thoughts to today's journal.
user_invocable: true
---

Brain dump — capture thoughts to today's journal.

1. If the user provided text after the command, use that as the brain dump content
2. If no text, ask: "What's on your mind? Just let it flow."
3. Create or append to today's journal file at `Journal/YYYY-MM/YYYY-MM-DD.md`
4. If the file doesn't exist, create it using the template from `Journal/template.md`
5. Add the brain dump under the `## Brain Dump` section with a timestamp
6. Respond with a brief acknowledgment (1 line). Example: "Captured. Anything else on your mind?"

Don't edit, organize, or judge the content — just capture it raw.
