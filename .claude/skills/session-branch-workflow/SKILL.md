---
name: session-branch-workflow
description: Use at the start of every coding session in a git repo to save leftover work (commit and push), clean up the old branch, and create a fresh feature branch from an updated main.
---

# Session start: branch hygiene like a professional engineer

Run this **before touching any code** at the start of every session in an initialized git repo. Goal: every session works on its own clean, well-named branch, and no work is ever lost.

If the directory is not a git repo (`git rev-parse --is-inside-work-tree` fails), skip everything and say so in one line. Do not run `git init` unless the user asks.

## Hard rules (never break)
- Never force push (`--force`, `--force-with-lease`) and never rewrite history.
- Never commit directly to the base branch (`main`/`master`/`develop`). Never delete the base branch.
- Never delete a **remote** branch automatically. Remote copies are the safety net; the user deletes them after the PR is merged.
- Never delete a local branch until its commits are confirmed on the remote (see Step 4).
- Never commit secrets or junk: `.env*`, keys, tokens, `*.pem`, `node_modules/`, `__pycache__/`, `.venv/`, build output, large binaries. If such a file shows up untracked and is not in `.gitignore`, add it to `.gitignore` instead of committing it, and tell the user.
- If any step fails (no remote, auth error, merge conflict, hook failure), stop, report the exact error, and ask. Do not improvise around it.

## Step 1: Inspect state
```bash
git rev-parse --abbrev-ref HEAD          # current branch
git status --porcelain                   # empty output = clean
git remote -v                            # is there an origin?
git symbolic-ref --short refs/remotes/origin/HEAD   # base branch (fallback: main, then master)
```
Call the current branch OLD, and the base branch BASE.

## Step 2: Decide the new branch name
Name = `TYPE/short-kebab-feature-name`, where TYPE is one of `feature`, `fix`, `refactor`, `docs`, `chore`, `test`.
- Take the feature name from the user's first request of the session (example: "add Redis cache for hotel search" becomes `feature/hotel-search-redis-cache`).
- Lowercase, kebab-case, 2 to 5 words, no dates or personal names.
- If the request is too vague to name the feature, ask the user for the feature name in one short question. Do not invent `session-1` or `temp`.
- If the name already exists locally or on the remote, append a short suffix such as `-v2`. Never reuse or overwrite an existing branch.

## Step 3: If the tree is dirty (leftover work from the last session)
1. If OLD is the base branch, do not commit there. First create a rescue branch: `git switch -c wip/leftover-YYYYMMDD` and treat that as OLD.
2. Review what will be committed: `git status` and `git diff --stat`. Stage only intended files (`git add -A` is fine after the secrets/junk check above).
3. Commit with a Conventional Commits message that describes the actual change, for example `feat(search): add pgvector hybrid filter`. If the leftover changes are unrelated, split them into more than one commit. If the work is half-finished, use `wip:` as the prefix. Append whatever commit attribution lines the environment asks for.
4. Push: `git push -u origin OLD` (plain `git push` if upstream is already set).

## Step 4: Clean up the old branch (only after a successful push)
1. `git fetch origin --prune`
2. Switch to base and update it: `git switch BASE && git pull --ff-only origin BASE`. If `--ff-only` fails, stop and report; do not merge or rebase on your own.
3. Verify the old work is safe on the remote before deleting anything: `git branch -r --contains OLD` must list `origin/OLD` (or the work must already be merged into BASE).
4. Only then delete the **local** old branch: `git branch -d OLD`. If git refuses because it is not merged, and step 3 confirmed it is on the remote, `git branch -D OLD` is allowed. If step 3 failed, do not delete; report instead.
5. Leave `origin/OLD` untouched.

## Step 5: If the tree is clean from the start
Skip the commit and push parts of Step 3. If OLD is not BASE and is fully pushed or merged, still follow Step 4 to clean it up. If it has unpushed commits, push first (Step 3.4).

## Step 6: Create the new session branch
```bash
git switch BASE
git pull --ff-only origin BASE
git switch -c TYPE/feature-name
git push -u origin TYPE/feature-name   # optional; do it if the user wants the branch visible on GitHub early
```

## Step 7: Report in 4 lines, then start the real task
- Old branch: what was committed and pushed, and whether the local copy was deleted
- New branch name and the base commit it was cut from
- Anything skipped or needing the user's attention (secrets found, unmerged remote branch, conflicts)
- Reminder that the remote copy of the old branch is still there for the PR

## During the session
- Make small, focused commits with Conventional Commit messages; push at logical checkpoints, not only at the end.
- When the feature is done, suggest opening a PR from the session branch into BASE (do not merge it automatically).
