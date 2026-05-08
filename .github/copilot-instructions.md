# Vaexil.tv Repository Instructions

This is the production Vaexil.tv creator hub. It contains stream references,
guide surfaces, community suggestions, admin-controlled publishing, and the
future VaexCore product surface.

## Current Stack

- Next.js App Router under `src/app`
- TypeScript
- Tailwind CSS v4
- Turso/libSQL for guide items, suggestions, votes, admin settings, and
  published data
- Zod validation for public form input
- Vercel for production hosting

## Change Rules

- Do not invent real guide facts. Placeholder guide rows must stay clearly fake
  until real entries are verified.
- Keep publishing admin-controlled; votes can mark suggestions ready for review
  but must not publish automatically.
- Keep VaexCore inside Vaexil.tv as a product family, not a replacement identity.
- Keep `/admin` protected and linked only from the footer.
- Do not commit secrets, generated local databases, or deployment output.

## Verification

Run the standard checks before publishing changes:

```bash
npm run lint
npm run typecheck
npm run build
```

Use `README.md` and `docs/deployment.md` for environment, deployment, domain,
and runtime notes.
