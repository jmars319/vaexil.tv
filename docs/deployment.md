# Vaexil.tv Deployment Checklist

This project is set up for a modern Git-based Node hosting platform plus a
hosted libSQL/Turso database. Vercel is the recommended first target because it
has first-class Next.js App Router support, automatic preview deployments, and
simple custom-domain management.

## Before First Production Deploy

1. Create or select the hosting project. Recommended Vercel project name:
   `vaexil-tv`.
2. Create a hosted libSQL/Turso database.
3. Add these environment variables for Production and Preview:

```bash
ADMIN_PASSWORD="use-a-real-bootstrap-password"
ADMIN_SESSION_SECRET="use-a-long-random-string"
SUGGESTION_READY_VOTE_THRESHOLD="5"
LIBSQL_URL="libsql://..."
LIBSQL_AUTH_TOKEN="..."
SENDGRID_API_KEY=""
SENDGRID_TO_EMAIL="vaexiltv@gmail.com"
SENDGRID_FROM_EMAIL=""
NEXT_PUBLIC_SITE_URL="https://vaexil.tv"
NEXT_PUBLIC_TWITCH_URL="https://www.twitch.tv/vaexil"
NEXT_PUBLIC_YOUTUBE_URL="https://www.youtube.com/@Vaexil-Twitch"
NEXT_PUBLIC_DISCORD_URL=""
NEXT_PUBLIC_GITHUB_URL=""
```

`LIBSQL_URL` must not be `file:.data/vaexil.db` on serverless production
hosting. The app intentionally throws an error on Vercel if a file database is
configured, because Vercel filesystem storage is not persistent production
storage.

Contact form submissions are saved to the database even when SendGrid is not
configured. Add `SENDGRID_API_KEY`, `SENDGRID_TO_EMAIL`, and a verified
`SENDGRID_FROM_EMAIL` before relying on email delivery from production.

## Domain Setup

On Vercel, add both hostnames to the project:

- `vaexil.tv`
- `www.vaexil.tv`

Set one as the canonical production domain. The current app metadata assumes `https://vaexil.tv`, so use the apex domain as primary unless you decide to change `NEXT_PUBLIC_SITE_URL`.

If the domain DNS is managed outside Vercel, follow the DNS records shown in the Vercel Domains panel. Vercel's current guidance is to add the apex domain to the project, inspect the required DNS records, configure the DNS provider, and then verify the domain and SSL certificate.

## Post-Deploy Checks

After the first production deployment and domain verification:

```bash
curl -I https://vaexil.tv
curl -I https://vaexil.tv/guides/freelancer-free-items
curl https://vaexil.tv/robots.txt
curl https://vaexil.tv/sitemap.xml
```

Confirm:

- `https://vaexil.tv` loads without certificate warnings.
- `www.vaexil.tv` redirects to the canonical domain.
- `/guides/freelancer-free-items` loads the verified guide rows from the hosted database.
- `/guides/mods-setup` shows the SMF requirement, current load order, Nexus links, and known-bad mods.
- `/suggest` accepts a test suggestion.
- `/suggestions` shows the submitted suggestion.
- `/contact` records a test message and sends email after SendGrid is configured.
- `/admin` accepts `ADMIN_PASSWORD`.
- Admin can change the password after signing in.
- Admin shows recent contact submissions and a light page-view snapshot.
- Admin can verify and publish a test suggestion.
- Security headers are present, including `strict-transport-security`, `x-frame-options`, and `x-content-type-options`.

## Notes

- Do not enable static export for this project. Server actions and the DB-backed pages require the Next.js server runtime.
- Official guide content should be entered only after verification. The current Freelancer rows are verified seed data and replace the old fictional samples during DB seeding.
- Changing any Vercel environment variable requires a new deployment before the change applies.
- `ADMIN_PASSWORD` is the bootstrap/fallback password. In-app password changes are stored as hashes in the configured database.
