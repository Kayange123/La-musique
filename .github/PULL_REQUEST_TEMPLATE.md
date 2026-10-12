Closes #

## What changed and why

<!-- The reasoning, not a restatement of the diff. Name each bug or need and its consequence. -->

## How to review

<!-- Auth and RLS boundaries, storage behavior, schema changes, behavior changes, anything left out. Commit-by-commit? -->

## Testing

- [ ] `npm run format:check`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] Added/updated tests for the behavior changed
- [ ] Tested against a local Supabase

## Database changes

- [ ] This PR does not touch `supabase/migrations`
- [ ] This PR changes `supabase/migrations` (RLS changes and live-project safety explained above)
