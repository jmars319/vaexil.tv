# Vaexil.tv

Vaexil.tv is the creator hub for Vaexil. It collects stream references, guide archives, community-submitted corrections, and the future VaexCore product surface in one deployable Next.js app.

## Current Reality

This is an early production-ready build, not a placeholder. Public routes cover the home hub, guide landing pages, the verified Freelancer Free Items table, Hitman mods/setup notes, contact intake, suggestion submission, community suggestions with vote thresholds, and VaexCore placeholder product cards. Admin routes are intentionally lightweight and password-protected for reviewing contact intake, checking light page-view analytics, and verifying, rejecting, or publishing guide suggestions.

The Freelancer Free Items guide is seeded from a verified Vaexil source list. The mods/setup guide tracks the current SMF-based load order and marks known-bad mods separately. Future guide additions should still go through review before they become official site content.

## What This Repo Contains

- Public creator/stream hub
- Guides and knowledge-base surfaces, including verified Freelancer item data and the current Hitman mod load order
- Recon, an experimental curated interactive map/guide foundation for games covered on stream
- Public contact form for collaboration, promotion, stream, and VaexCore inquiries
- Community suggestion form and voting flow
- Admin review/publishing surface with recent contact submissions and a small first-party analytics snapshot
- Footer links into the JAMARQ/Tenra/Vaexil site family, with admin access kept unobtrusive in the footer
- libSQL-backed local data layer with hosted libSQL/Turso deployment path
- Deployment notes for Vercel or a comparable Git-based Node host

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- libSQL via `@libsql/client`
- SendGrid contact delivery hook
- Zod validation
- Lightweight password-based admin session

## Documentation

Start here:
- `docs/deployment.md`
- `docs/recon/RECON_ARCHITECTURE.md`
- `docs/recon/ASSET_SOURCING.md`
- `docs/recon/DATA_ENTRY_GUIDE.md`

## Recon

Recon is available at `/recon` with initial public game pages for `/recon/hitman`
and `/recon/sniper-elite-5`. It is a curated static map and guide layer for
games covered on stream, not AI, prediction, or a copied reference-site data
set.

Individual map pages stay hidden until a map is marked `published` and backed by
an approved public asset. Draft map assets live outside `public/` and are served
only through protected admin routes for coordinate capture.

Recon v1 imports no third-party map images, API data, marker coordinates, icons,
or copied guide text. Final maps should be Vaexil-authored schematic maps and
must be documented in `src/data/recon/asset-manifest.json` before publication.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

Local development defaults to `.data/vaexil.db`, which is ignored by git. The app also creates and seeds the database automatically on first access if needed. Seeding removes the old fictional sample rows and upserts the verified Freelancer item list.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run doctor
npm run verify
npm run db:seed
npm run dev:start
npm run dev:stop
npm run dev:status
```

## Environment Variables

```bash
ADMIN_PASSWORD="change-this-before-deploy"
ADMIN_SESSION_SECRET="replace-with-a-long-random-string"
SUGGESTION_READY_VOTE_THRESHOLD="5"
LIBSQL_URL="file:.data/vaexil.db"
LIBSQL_AUTH_TOKEN=""
SENDGRID_API_KEY=""
SENDGRID_TO_EMAIL="vaexiltv@gmail.com"
SENDGRID_FROM_EMAIL=""
NEXT_PUBLIC_SITE_URL="https://vaexil.tv"
NEXT_PUBLIC_TWITCH_URL="https://www.twitch.tv/vaexil"
NEXT_PUBLIC_YOUTUBE_URL="https://www.youtube.com/@Vaexil-Twitch"
NEXT_PUBLIC_DISCORD_URL=""
NEXT_PUBLIC_GITHUB_URL=""
```

For production, set `LIBSQL_URL` and `LIBSQL_AUTH_TOKEN` to a hosted libSQL/Turso database. Do not use the local file database on Vercel for persistent production data. Contact form submissions are recorded even if SendGrid is not configured; set `SENDGRID_API_KEY`, `SENDGRID_TO_EMAIL`, and a verified `SENDGRID_FROM_EMAIL` when email delivery should go live. `ADMIN_PASSWORD` is the bootstrap/fallback password; after signing in, the admin UI can replace it with a database-stored password hash.

## Data Workflow

Community guide suggestions follow this path:

`Submitted -> Pending -> Ready for Review at configured vote threshold -> Verified by admin -> Published by admin`

Publishing is never automatic. Admin verification and admin publishing are separate actions.

## Deployment

Vercel is the recommended first deployment target because this is a Next.js
App Router project with server actions and dynamic DB-backed pages. A comparable
Git-based Node hosting platform can also work if it supports environment
variables, production builds, and a persistent hosted database connection.

1. Create a hosted libSQL/Turso database.
2. Add the environment variables above in the hosting provider.
3. Deploy with the default Next.js settings.
4. Visit `/admin`, sign in with `ADMIN_PASSWORD`, and review the suggestion queue.
5. Submit a test contact form after SendGrid is configured and confirm email delivery plus admin logging.

See [docs/deployment.md](docs/deployment.md) for the full domain, DNS, environment variable, and post-deploy checklist.

## Guardrails

- The current official Freelancer guide rows are verified seed data; keep future official additions reviewed before publishing.
- Discord and GitHub links are configurable placeholders until final URLs exist.
- No full user accounts or OAuth. Admin auth is intentionally lightweight for v1.
- Clips and schedule are structural placeholders until real media or schedule data is ready.
- Official guide rows must come from admin publishing, not automatic community vote thresholds.
- Admin password changes are stored as hashes in the configured database. Keep `ADMIN_SESSION_SECRET` set in production so sessions are not tied to the bootstrap password.
