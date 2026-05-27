# Maintainer Guide

This guide consolidates Vaexil.tv guardrails into normal maintainer documentation.

## Current Stack

- Next.js App Router under `src/app`
- TypeScript
- Tailwind CSS v4
- Turso/libSQL for guide items, suggestions, votes, admin settings, and published data
- Cloudflare R2 for protected Recon draft asset storage in production
- Zod validation for public form input
- SendGrid contact delivery hook
- Vercel for production hosting

## Do-Not-Break Workflows

- Do not invent real guide facts. Placeholder guide rows must stay clearly fake until real entries are verified.
- Keep official guide publishing admin-controlled. Votes can mark suggestions ready for review, but must not publish automatically.
- Keep VaexCore inside Vaexil.tv as a product family, not a replacement identity.
- Keep `/admin` protected and linked only from the footer.
- Keep Recon map pages hidden until a map is published and backed by an approved public asset.
- Do not commit secrets, generated local databases, draft Recon assets, deployment output, or local auth state.

## Recon Guardrails

- Public Recon imports no third-party map images, API data, marker coordinates, icons, or copied guide text.
- Approved private Recon drafts may use source-map plates and marker seeds only when they stay under local/R2 `private/recon/`, remain `draft`/`unverified`, and are served only through protected admin routes.
- Runtime requests migrate schema only. Run `npm run db:seed` for seed JSON imports and `npm run recon:upload-assets -- --write --verify` for R2 asset sync.
- Final maps should be Vaexil-authored schematic maps and documented in `src/data/recon/asset-manifest.json` before publication.

## Retired Assumptions

- Discord and GitHub links are configurable placeholders until final URLs exist.
- Clips and schedule remain structural placeholders until real media or schedule data is ready.
- Admin auth is intentionally lightweight for v1; do not add full user accounts or OAuth without an explicit decision.

## Verification Baseline

Run standard checks before publishing:

```bash
npm run lint
npm run typecheck
npm run build
npm run doctor
npm run verify
```
