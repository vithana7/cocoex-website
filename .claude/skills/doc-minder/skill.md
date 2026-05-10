# /doc-minder

You are running the `doc-minder` skill. Your job is to inspect all staged and unstaged git changes in this repository and update the documentation so it stays in sync with the code. This exists to keep AI context clean and accurate between sessions.

---

## Step 1 — Collect the changes

Run these commands and read their output carefully:

```bash
git diff HEAD --stat
git diff HEAD -- index.html css/styles.css js/main.js data/events.json
git status --short
```

If no changes exist, tell the user "No changes detected — documentation is up to date." and stop.

---

## Step 2 — Classify each changed file

For each modified file, determine which documentation it affects:

| Changed file | Docs to check |
|---|---|
| `index.html` | `CLAUDE.md` → DOM Quick Reference table, section HTML line numbers, asset map |
| `css/styles.css` | `CLAUDE.md` → CSS Design System, DOM Quick Reference CSS lines, breakpoints; `docs/responsive-design.md` if layout/fluid typography changed |
| `js/main.js` | `CLAUDE.md` → JS module map line numbers, SCROLL_TIMING values, WebGL system table; `docs/TECHNICAL-SPEC.md` if behavior changed |
| `data/events.json` | `CLAUDE.md` → Data Layer section (current campaign count, partner count, horizon event count) |
| `assets/images/**` | `CLAUDE.md` → Asset Map |
| Any file | `CLAUDE.md` → File sizes table (line counts), UPDATED AT timestamp |

---

## Step 3 — Verify, don't assume

Before updating any line number or claim in the docs, **read the actual file** to confirm the current state. A doc that says "line 248" is only correct if that's where the code actually lives today.

Key things to re-verify:
- Exact line counts for `index.html`, `css/styles.css`, `js/main.js`
- SCROLL_TIMING constant values in `js/main.js`
- DOM element selectors and their HTML line numbers
- CSS section boundaries
- JS module start/end lines

---

## Step 4 — Update CLAUDE.md

Edit `CLAUDE.md` to reflect current reality:

1. **Always update the `UPDATED AT` timestamp** at the top to today's date (format: `YYYY-MM-DD`).
2. Update the **File sizes table** with current line counts.
3. Update any **line numbers** in the DOM Quick Reference, JS module map, or CSS section references that have shifted.
4. Update **SCROLL_TIMING** values if they changed.
5. If a new HTML section was added or removed, update the **Page Sections** list.
6. If new CSS variables were added, update the **CSS Design System**.
7. If a new JS module was added, add it to the **JS module structure** block.
8. If `data/events.json` changed, update the **Data Layer** description (e.g., campaign count).
9. If new assets were added, update the **Asset Map**.

---

## Step 5 — Check secondary docs

If the change touched **layout, typography, or responsive behavior**, open `docs/responsive-design.md` and update:
- Any `clamp()` values that changed
- Breakpoint behavior descriptions
- Orbit ellipse ratios if modified

If the change touched **WebGL shaders, GSAP timing, or scroll architecture**, open `docs/TECHNICAL-SPEC.md` and update:
- The relevant section spec
- Behavior descriptions for the modified section
- Any timing or vh values

---

## Step 6 — Report what you did

After all edits, output a concise summary:

```
doc-minder report
─────────────────
Changed files: [list]

Documentation updated:
  CLAUDE.md — [what changed: e.g., "line counts, DOM table line 42 updated, added StepPopup to module map"]
  docs/responsive-design.md — [what changed, or "no changes needed"]
  docs/TECHNICAL-SPEC.md — [what changed, or "no changes needed"]

No changes needed in:
  [any docs that were checked but required no edits]
```

---

## Rules

- Never rewrite documentation that is still accurate — only update what has drifted.
- Never remove a section from `CLAUDE.md` unless the feature it documents has been deleted from the code.
- If you are unsure whether a line number shifted, read the file and confirm before updating.
- The `UPDATED AT` date at the top of `CLAUDE.md` must always be updated, even if only one line number changed.
- Do not update `.claude/memo/` files — those are brand/concept canon, not code documentation.
