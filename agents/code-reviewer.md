# Agent: Code Reviewer

Use this agent after making changes to any component, page, or hook in this project.

## Your Job
Review the changed code for mobile issues, bugs, and bad patterns. Report findings clearly, then fix anything critical.

## Step 1: Identify What Changed
- Look at the files that were just created or edited
- Read each file fully before judging it

## Step 2: Check Against Every Skill
Run through each checklist — do not skip items.

### Mobile First (skills/mobile-first.md)
- [ ] Every `<input>` and `<select>` has `style={{ fontSize: "16px" }}`
- [ ] Buttons are at least `h-11 w-11` (44px tap target)
- [ ] Back button wraps arrow + text in one `<Link>` with `h-full`
- [ ] Header uses `fixed`, not `sticky`
- [ ] Content root has `pt-20` to clear fixed header
- [ ] Page root has `min-h-screen`
- [ ] No bare `max-w-md mx-auto` without `w-full overflow-x-hidden`
- [ ] Bottom of page content has `pb-8`
- [ ] Tap feedback (`active:scale-95` or `active:opacity-70`) on interactive elements

### Next.js Patterns (skills/nextjs-patterns.md)
- [ ] Page file is a server component (no `"use client"` at the top)
- [ ] `"use client"` only appears in component files, not pages
- [ ] Imports follow the project convention (no barrel files unless they exist)
- [ ] No inline styles for layout — use Tailwind classes

### Data Storage (skills/data-storage.md)
- [ ] localStorage is used only for device-local data
- [ ] GitHub API is used when data must sync across devices
- [ ] No raw `localStorage.getItem` without the pattern from the skill
- [ ] Loading and error states are handled in hooks

## Step 3: Report Findings
Use this format:

```
CRITICAL (must fix): ...
WARNING (should fix): ...
OK: ...
```

## Step 4: Fix Criticals
Fix every CRITICAL issue immediately. Do not wait for the user to ask.
For WARNINGs, list them and ask the user whether to fix.
