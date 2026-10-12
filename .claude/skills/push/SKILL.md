---
name: push
description: Push a feature branch to GitHub and open (or update) its pull request against develop, linking the issues it closes and following this repo's PR template. Use after /commit, or when the user asks to push, open a PR, or ship a branch.
argument-hint: "[--draft] [optional base branch, default develop]"
---

# Push and open a PR

Every branch in `La-musique` ends in a pull request. That's a standing
maintainer rule, so pushing a feature branch and opening its PR needs no
extra confirmation. Two things still always need explicit confirmation:
**force-pushing**, and **targeting `main`**.

## Branch model

- `develop` is the integration branch and GitHub's default. Feature,
  fix, and docs branches open PRs **into `develop`**.
- `main` is release-only. It receives `develop` via a release PR. Don't
  target `main` unless the user asked for a release PR.
- Never push directly to `main` or `develop`. If the current branch is
  one of them, stop and run the commit workflow
  (`.claude/skills/commit/SKILL.md`), which creates a branch.

## 1. Pre-flight

Run in parallel:

```bash
git branch --show-current
git status --short
git fetch origin
git log --format='%h %s%n%b' origin/develop..HEAD
gh pr view --json number,url,state 2>/dev/null
```

- If the working tree has uncommitted changes, ask whether they belong
  on this branch (commit them first) or elsewhere. Don't silently leave
  them out.
- If there are no commits ahead of `origin/develop`, there's nothing to
  push. Say so and stop.
- **Every commit must have a `Refs #N` footer.** If one doesn't, find or
  create the issue (commit skill, step 3). Fix the footer only on
  unpushed commits. Never rewrite pushed history.
- If the branch is behind `origin/develop`, tell the user. Don't
  rebase or merge unasked.

## 2. Run the full gate

These are the checks CI runs (`.github/workflows/ci.yml`):

```bash
npm run format:check
npm run typecheck
npm run lint
npm test
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder npm run build
```

The build values are the same non-secret placeholders CI uses. They
prove the app compiles, not that it talks to Supabase. If any step
fails, stop and report the output. Don't push red code, and don't skip
hooks.

For changes to auth, data access, uploads or migrations, also test
against the local Supabase (`npx supabase start`, see the README) and
say in the PR what you tested.

## 3. Push

```bash
git push -u origin HEAD
```

- Never `--force` without explicit confirmation. If a force is genuinely
  needed (the user rewrote their own unshared branch), use
  `--force-with-lease`, never plain `--force`.
- If the push is rejected (remote has new commits), report it. Don't
  force your way past it.

## 4. Open or update the PR

If `gh pr view` found an open PR for this branch, the push already
updated it. Update the body if new commits changed what it covers
(`gh pr edit --body-file`), then report the URL.

Otherwise create one. Write the body to a scratch file following
`.github/PULL_REQUEST_TEMPLATE.md`, filled in honestly:

```markdown
Closes #1
Closes #2

## What changed and why

<The reasoning, not a restatement of the diff. Name each bug/need and its
consequence. With several commits, a short list mapping each commit to
the issue it addresses helps reviewers go commit-by-commit.>

## How to review

<Call out auth and RLS boundaries, storage behavior, schema changes,
behavior changes, anything deliberately left out. Say whether reviewing
commit-by-commit is recommended.>

## Testing

- [x] `npm run format:check`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm test`
- [x] `npm run build`
- [ ] Added/updated tests for the behavior changed
- [ ] Tested against a local Supabase

<Mention any check that was NOT run or didn't pass, with why. Only tick
boxes for checks that actually ran green in step 2. Say what was tested
by hand, if anything.>

## Database changes

- [x] This PR does not touch `supabase/migrations`
```

Then:

```bash
gh pr create --base develop --head "$(git branch --show-current)" \
  --title "<type>(<scope>): <summary>" --body-file <scratch file>
```

- **Closing issues.** Use one `Closes #N` line per issue the PR fully
  resolves. Partially addressed issues get `Refs #N`.
- **Title.** Conventional Commits style. A single-commit PR reuses the
  commit subject. A multi-commit PR summarizes the area, e.g.
  `fix(player): repair queue navigation and upload cleanup`.
- **Labels.** Mirror the issues' labels (`--label bug`, etc.).
- **Draft.** Add `--draft` if the user passed it, or if the work is
  knowingly incomplete.
- **Schema changes.** If the PR touches `supabase/migrations`, tick the
  second database box instead. "What changed and why" must then cover
  the RLS policies added or changed, and whether the migration is safe
  to apply to the existing live project.
- **Authorization.** If the PR touches RLS policies, storage policies,
  or the auth middleware, say what a signed-out user and a different
  signed-in user can and can't do afterwards.
- Don't add `Co-Authored-By` lines to the body.

## 5. Report

Give the user the PR URL, the base branch, and the issues it closes.
Note that CI (format → typecheck → lint → test → build) runs on the PR.
