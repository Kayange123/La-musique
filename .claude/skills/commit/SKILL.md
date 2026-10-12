---
name: commit
description: Commit work on a feature branch using Conventional Commits, with each commit linked to the GitHub issue it addresses. Use when the user asks to commit, or before /push when there are uncommitted changes.
---

# Commit

## 1. Branch

Never commit on `main` or `develop`. If the current branch is one of
them, create a branch off `develop` first:

```bash
git checkout -b <type>/<short-description>   # e.g. fix/player-queue
```

## 2. Group the changes

Run `git status --short` and `git diff`. Split the work into commits
that each do one thing and can be reviewed alone, usually one per issue.
Stage files by path. Never `git add -A` or `git add .`, because local
tool folders (such as `.claude-flow/`) live untracked in the repo root.

## 3. Link an issue

Every commit needs a `Refs #N` footer. Find the matching issue with
`gh issue list --state all --search "<keywords>"`. If there isn't one,
create it with `gh issue create`. Give it a title that names the problem
(not the fix), a body that explains the user-visible consequence, and a
label (`bug`, `enhancement`, `documentation`).

## 4. Write the message

Conventional Commits:

```
<type>(<scope>): <imperative summary, lower case, no period>

<Why the change was needed and what it does, wrapped at 72 columns.>

Refs #N
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`.
Scopes follow the area: `player`, `likes`, `upload`, `search`, `auth`,
`data`, `db`, `deps`, `setup`.

Don't add `Co-Authored-By` or other attribution trailers. `Refs` is the
last line of the message.

## 5. Verify

Before the first commit of a session, run `npm run typecheck` and
`npm run lint`. Don't commit code that fails them.
