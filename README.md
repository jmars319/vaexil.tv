# Vaexil.tv

Vaexil.tv is the first version of a creator hub for Vaexil: stream references, verified guide entries, community suggestions, and a future VaexCore product surface.

## Stack

- Next.js App Router with TypeScript for a Vercel-friendly full-stack React app.
- Tailwind CSS for fast, maintainable styling without a large component framework.
- libSQL via `@libsql/client` for local file-based development now and a clean path to hosted Turso/libSQL later.
- Zod for server-side validation on public form input.
- Lightweight admin auth using `ADMIN_PASSWORD` and a signed HTTP-only cookie.

This keeps the first version deployable and maintainable without introducing a separate API service or heavyweight auth system.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

Local development defaults to `.data/vaexil.db`, which is ignored by git. The app also creates and seeds the database automatically on first access if needed.

## Environment Variables

```bash
ADMIN_PASSWORD="change-this-before-deploy"
ADMIN_SESSION_SECRET="replace-with-a-long-random-string"
SUGGESTION_READY_VOTE_THRESHOLD="5"
LIBSQL_URL="file:.data/vaexil.db"
LIBSQL_AUTH_TOKEN=""
NEXT_PUBLIC_SITE_URL="https://vaexil.tv"
NEXT_PUBLIC_TWITCH_URL="https://www.twitch.tv/vaexil"
NEXT_PUBLIC_YOUTUBE_URL="https://www.youtube.com/@vaexil"
NEXT_PUBLIC_DISCORD_URL=""
NEXT_PUBLIC_GITHUB_URL=""
```

For production, set `LIBSQL_URL` and `LIBSQL_AUTH_TOKEN` to a hosted libSQL/Turso database. Do not use the local file database on Vercel for persistent production data.

## Core Workflow

Community guide suggestions follow this path:

`Submitted -> Pending -> Ready for Review at configured vote threshold -> Verified by admin -> Published by admin`

Publishing is never automatic. Admin verification and admin publishing are separate actions.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run db:seed
```

## Deployment Notes

Vercel is the recommended first deployment target because this is a Next.js
App Router project with server actions and dynamic DB-backed pages. A comparable
Git-based Node hosting platform can also work if it supports environment
variables, production builds, and a persistent hosted database connection.

1. Create a hosted libSQL/Turso database.
2. Add the environment variables above in the hosting provider.
3. Deploy with the default Next.js settings.
4. Visit `/admin`, sign in with `ADMIN_PASSWORD`, and review the suggestion queue.

See [docs/deployment.md](docs/deployment.md) for the full domain, DNS, environment variable, and post-deploy checklist.

## Current Deferred Items

- Real guide content is intentionally not included. Seed rows are fictional placeholders only.
- Discord and GitHub links are configurable placeholders until final URLs exist.
- No full user accounts or OAuth. Admin auth is intentionally lightweight for v1.
- Clips and schedule are structural placeholders until real media or schedule data is ready.
