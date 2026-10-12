# La-musique

A music streaming app: browse and search songs, upload your own tracks with cover art, like songs, and listen with a persistent player.

Built with Next.js 13 (App Router), Supabase (auth, Postgres, storage), Zustand, Tailwind CSS and Radix UI.

## Features

- Email, magic-link, Google and Facebook sign-in (Supabase Auth)
- Upload mp3 songs (up to 20MB) with a cover image (up to 5MB)
- Latest songs on the home page, search by title
- Like songs and play them from your Liked Songs playlist
- Player with play/pause, next/previous, auto-advance and volume

## Getting started

### 1. Install

```bash
npm install
```

### 2. Set up Supabase

#### Local (recommended for development)

With Docker running:

```bash
npx supabase start
```

This starts Supabase on your machine and applies everything in [supabase/migrations](supabase/migrations). Then put the local values in `.env.local`:

```bash
npx supabase status -o env
# copy API_URL into NEXT_PUBLIC_SUPABASE_URL and ANON_KEY into NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Email confirmation is off locally, so you can sign up with any address. Supabase Studio runs at [http://127.0.0.1:54323](http://127.0.0.1:54323). Use `npx supabase db reset` to start from an empty database.

#### Hosted

Create a project at [supabase.com](https://supabase.com), then apply the schema in [supabase/migrations](supabase/migrations). It creates the tables, row-level security policies and the `songs` and `images` storage buckets.

For a **new** project, either paste the SQL into the Supabase SQL editor, or use the CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

For a project that **already has the tables**, don't push the migration (it fails with "relation already exists"). Pull your live schema instead, or mark this migration as applied:

```bash
npx supabase db pull
# or
npx supabase migration repair 20230917000000 --status applied
```

Then run `npx supabase db push` to apply the later migrations, such as the image type restriction.

To enable Google or Facebook sign-in, configure the providers under Authentication → Providers.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Project Settings → API.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | What it does               |
| --------------- | -------------------------- |
| `npm run dev`   | Start the dev server       |
| `npm run build` | Build for production       |
| `npm run start` | Serve the production build |
| `npm run lint`  | Run ESLint                 |

## Project structure

```
actions/      Server-side data fetching (songs, search, liked songs)
app/          Routes: home, search, liked-songs, with loading and error states
components/   UI, player, modals, sidebar and library
hooks/        Client hooks: player state, modals, user, song loading
providers/    Supabase, user, modal and toast providers
supabase/     Database migrations
```
