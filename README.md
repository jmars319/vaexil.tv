# Vaexil.tv

Vaexil.tv is the creator hub for Vaexil. It collects stream references, guide archives, community-submitted corrections, and the future VaexCore product surface in one deployable Next.js app.

## Current Reality

This is an early production-ready build, not a placeholder. Public routes cover the home hub, guide landing pages, the verified Freelancer Free Items table, Hitman mods/setup notes, contact intake, suggestion submission, community suggestions with vote thresholds, and reserved VaexCore product cards. Admin routes are intentionally lightweight and password-protected for reviewing contact intake, checking light page-view analytics, and verifying, rejecting, or publishing guide suggestions.

The Freelancer Free Items guide is seeded from a verified Vaexil source list. The Destiny 2 raid guide family starts with Salvation's Edge and The Desert Perpetual source packets reshaped into web-native raid references, but stays in signed-in admin preview until `DESTINY_GUIDES_PUBLIC=true`. The mods/setup guide tracks the current SMF-based load order and marks known-bad mods separately. Future guide additions should still go through review before they become official site content.

## What This Repo Contains

- Public creator/stream hub
- Guides and knowledge-base surfaces, including verified Freelancer item data, private-preview Destiny 2 raid references, and the current Hitman mod load order
- A read-only Destiny 2 Armor Optimizer that reconstructs owned base rolls and calculates exact per-stat ceilings around Exotic and armor-set constraints
- Recon, an experimental curated interactive map/guide foundation for games covered on stream
- Public contact form for collaboration, promotion, stream, and VaexCore inquiries
- Community suggestion form and voting flow
- Admin review/publishing surface with recent contact submissions and a small first-party analytics snapshot
- Footer links into the JAMARQ/Tenra/Vaexil site family, with admin access kept off public navigation
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
- `docs/README.md`
- `docs/MAINTAINER_GUIDE.md`
- `docs/deployment.md`
- `docs/recon/RECON_ARCHITECTURE.md`
- `docs/recon/ASSET_SOURCING.md`
- `docs/recon/DATA_ENTRY_GUIDE.md`

## Recon

Recon is available at `/recon` with initial public game pages for `/recon/hitman`
`/recon/sniper-elite-5`, and `/recon/sniper-elite-resistance`. It is a curated
static map and guide layer for games covered on stream, not AI, prediction, or a
copied reference-site data set.

Individual map pages stay hidden until a map is marked `published` and backed by
an approved public asset. Draft map assets live outside `public/` and are served
only through protected admin routes for coordinate capture.

Public Recon imports no third-party map images, API data, marker coordinates,
icons, or copied guide text. Approved private admin drafts may use HITMAPS and
Guides4Gamers source-map plates and marker seeds only under `private/recon/`,
with `draft`/`unverified` status and no public publication. Draft source packets
and source cross-checks are imported into libSQL/Turso from
`src/data/recon/source-packets.json` and
`src/data/recon/source-cross-checks.json`. Optional marker-detail payloads are
imported from `src/data/recon/marker-details.json` for location hints, how-to
steps, requirements, notes, and approved media references; these records must not
copy third-party guide prose. The JSON files remain temporary fallback sources
while the migration settles. Final public maps must be
separately approved and documented in `src/data/recon/asset-manifest.json`.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run db:seed
npm run dev
```

Open `http://localhost:3203`.

Local development defaults to `.data/vaexil.db`, which is ignored by git. The app creates missing database tables on first access, but seed data is explicit: run `npm run db:seed` after changing guide or Recon seed JSON.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run doctor
npm run verify
npm run db:seed
npm run update:destiny-armor-manifest
npm run dev:start
npm run dev:stop
npm run dev:status
npm run recon:upload-assets -- --write --verify
```

## Local Tooling

- Use `vercel` for Vercel environment, deployment, and log diagnostics.
- Use `pa11y` and Lighthouse for public-page accessibility and performance checks when guide, admin, or public landing pages change.
- Use `actionlint` after editing GitHub Actions workflows.
- Use `osv-scanner` for advisory checks across dependency manifests and lockfiles.

## Environment Variables

```bash
ADMIN_PASSWORD="change-this-before-deploy"
ADMIN_SESSION_SECRET="replace-with-a-long-random-string"
SUGGESTION_READY_VOTE_THRESHOLD="5"
LIBSQL_URL="file:.data/vaexil.db"
LIBSQL_AUTH_TOKEN=""
RECON_ASSET_STORE="local"
CLOUDFLARE_ACCOUNT_ID=""
R2_ENDPOINT=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_PUBLIC_BUCKET="vaexil-tv-media-public"
R2_PRIVATE_BUCKET="vaexil-tv-media-private"
R2_PUBLIC_BASE_URL="https://cdn.vaexil.tv"
R2_RECON_KEY_PREFIX="recon/"
R2_BUCKET=""
SENDGRID_API_KEY=""
SENDGRID_TO_EMAIL="vaexiltv@gmail.com"
SENDGRID_FROM_EMAIL=""
BUNGIE_API_KEY=""
BUNGIE_OAUTH_CLIENT_ID=""
BUNGIE_OAUTH_CLIENT_SECRET=""
BUNGIE_OAUTH_SESSION_SECRET=""
BUNGIE_OAUTH_REDIRECT_URI="https://vaexil.tv/api/auth/bungie/callback"
DESTINY_GUIDES_PUBLIC="false"
NEXT_PUBLIC_SITE_URL="https://vaexil.tv"
NEXT_PUBLIC_TWITCH_URL="https://www.twitch.tv/vaexil"
NEXT_PUBLIC_YOUTUBE_URL="https://www.youtube.com/@Vaexil-Twitch"
NEXT_PUBLIC_DISCORD_URL=""
NEXT_PUBLIC_GITHUB_URL=""
```

For production, set `LIBSQL_URL` and `LIBSQL_AUTH_TOKEN` to a hosted libSQL/Turso database. Set `RECON_ASSET_STORE=r2` plus the R2 variables when protected Recon draft assets should read from Cloudflare R2. New Vaexil protected assets should use `R2_PRIVATE_BUCKET=vaexil-tv-media-private` with `R2_RECON_KEY_PREFIX=recon/`; the old `R2_BUCKET=vaexil-recon-assets` value remains a fallback only until the standardized bucket is manually verified. Do not use the local file database on Vercel for persistent production data. Contact form submissions are recorded even if SendGrid is not configured; set `SENDGRID_API_KEY`, `SENDGRID_TO_EMAIL`, and a verified `SENDGRID_FROM_EMAIL` when email delivery should go live. Set `BUNGIE_API_KEY` when Destiny 2 guide tools should load Bungie profile, equipment, and fireteam data. The Armor Optimizer additionally requires the confidential Bungie OAuth client ID and secret, the registered callback URL, and an independent random session-encryption secret. OAuth tokens are stored only in an encrypted HTTP-only cookie. Keep `DESTINY_GUIDES_PUBLIC=false` until the Destiny guide family should be public; signed-in admins can still preview it from `/admin`. `ADMIN_PASSWORD` is the bootstrap/fallback password; after signing in, the admin UI can replace it with a database-stored password hash.

The optimizer combines live Bungie profile components with the compact, generated
`src/data/destiny-armor-manifest.json`. Refresh that file after Bungie manifest
changes with `npm run update:destiny-armor-manifest`; the command requires
`BUNGIE_API_KEY` and stores no credential in the generated output.

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
- Discord and GitHub links are configured later when final URLs exist.
- No full user accounts. Admin auth is intentionally lightweight; Bungie OAuth is
  isolated to the read-only Armor Optimizer session.
- Clips and schedule are reserved surfaces until real media or schedule data is ready.
- Official guide rows must come from admin publishing, not automatic community vote thresholds.
- Keep draft guide downloads out of `public/`; private source PDFs are served through authenticated download routes.
- Admin password changes are stored as hashes in the configured database. Keep `ADMIN_SESSION_SECRET` set in production so sessions are not tied to the bootstrap password.
