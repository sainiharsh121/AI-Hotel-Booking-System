---
description: Commit, push, create PR, merge, and clean up after a feature is complete
allowed-tools: Read, Bash, mcp__github__create_pull_request, mcp__github__merge_pull_request, mcp__github__pull_request_read
---

Ship the current feature branch of the Rajmahal Residency booking system (FastAPI backend in `backend/`, React + Vite frontend in `frontend/`).

## Step 1 — Identify current branch and repo
```bash
git branch --show-current
git remote get-url origin
```
Store the branch as CURRENT_BRANCH. Parse OWNER and REPO from the remote URL (for this project: `sainiharsh121` / `AI-Hotel-Booking-System`) and pass them explicitly to every GitHub MCP call.

**If CURRENT_BRANCH is `main`, stop** and say:
"You are on main. Create a feature branch first (run /session-branch-workflow), then run /ship-feature again."
Committing or pushing from main would break the "never commit directly to main" rule, and a PR from main into main is impossible.

## Step 2 — Review the changes and generate a commit message
```bash
git fetch origin
git status --short
git diff --staged
git diff
git log origin/main..HEAD --oneline
```

Before continuing, check that the files to be committed contain no secrets or junk (`.env`, `*.db`, `node_modules/`, `__pycache__/`, `.venv/`, `frontend/dist/`). Only `backend/.env.example` is allowed. If any of them would be included, stop and tell the user. These are normally covered by `.gitignore`, so a match means something is wrong.

If files under `backend/` changed, run the tests and stop if they fail. Do not ship failing code.
```bash
cd backend && python -m pytest -q
```
(The tests expect a seeded database. If they fail only because the database is empty, run `python seed_data.py` once and retry.)

If `.claude/specs/` exists, read it to find the spec for this feature. If it does not exist or has no matching spec, build the PR text from the commits and the diff instead.

Generate a Conventional Commit message:
- feat: new feature
- fix: bug fix
- chore: config or tooling
- docs: documentation only

Rules:
- Lowercase
- No period at the end
- Under 72 characters
- Describes what the user can now do, not what the code does

Good: "feat: add price filter to the room search"
Bad: "feat: added query param to rooms router"

## Step 3 — Commit
If there is nothing to commit but the branch already has commits that `origin/main` does not, skip to Step 4.
```bash
git add .
git commit -m "<generated-message>"
```
Report: "✓ Committed — <message>"

## Step 4 — Push to feature branch
```bash
git push -u origin CURRENT_BRANCH
```
Report: "✓ Pushed — CURRENT_BRANCH"

## Step 5 — Create PR via GitHub MCP
Use the GitHub MCP server (`mcp__github__create_pull_request`) to create a pull request from CURRENT_BRANCH into `main`.

Title: plain English feature name, no conventional commit prefix
Example: "Add price filter to room search"

Description:
```markdown
## What this PR does
<one paragraph: from the spec overview if there is one, otherwise from the commits and diff>

## Changes
<bullet list of every file changed with one line description each>

## Definition of done
<if the spec has a checklist, copy it; otherwise write the checklist below.
mark every item that is true as checked [x], and leave any item that is not true unchecked>
- [ ] Backend tests pass (`cd backend && pytest`)
- [ ] The feature works in the browser
- [ ] No secrets or build files committed

## How to test
1. Start the backend: `cd backend && python app.py` (http://127.0.0.1:5000, docs at /docs)
2. Start the frontend: `cd frontend && npm run dev` (http://127.0.0.1:5173)
3. Log in as harsh@example.com / PIN 1234 (run `python seed_data.py` first if the database is empty)
4. <specific steps to verify this feature, from the spec or the diff>
```

Report: "✓ PR created — <PR URL>"

If PR creation fails, stop here. Do not continue to the merge.

## Step 6 — Merge PR via GitHub MCP
Use the GitHub MCP server (`mcp__github__merge_pull_request`) with `merge_method: squash` to merge the pull request just created.

Then confirm with `mcp__github__pull_request_read` that the PR state is merged. If it is not merged, stop and report why. Do not delete any branch.

Report: "✓ PR merged to main"

## Step 7 — Delete remote branch
The GitHub MCP server has no tool for deleting a branch, so use git:
```bash
git push origin --delete CURRENT_BRANCH
```
If it fails with "remote ref does not exist", GitHub already deleted it; that is fine.

Report: "✓ Remote branch deleted"

## Step 8 — Switch to main and pull
```bash
git checkout main
git pull --ff-only origin main
```
Report: "✓ Switched to main — up to date"

## Step 9 — Delete local feature branch
Only after Step 6 confirmed the merge. A squash merge makes the feature commits look unmerged to git, so `-D` is needed here.
```bash
git branch -D CURRENT_BRANCH
```
Report: "✓ Local branch deleted"

## Final summary
Print:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
/ship-feature complete
✓ Committed — <message>
✓ Pushed — <branch>
✓ PR created and merged
✓ Remote branch deleted
✓ Switched to main
✓ Local branch deleted
Next: run /session-branch-workflow to start the next feature
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

## Rules
- Never commit directly to main
- Always use squash merge
- Delete the remote and local branch only after the merge is confirmed
- If GitHub MCP is not connected stop and say:
  "GitHub MCP is not connected. Run /mcp to check connection."
- If push fails due to no upstream, use git push -u origin CURRENT_BRANCH
- Never proceed to merge if PR creation fails
- Never force push
