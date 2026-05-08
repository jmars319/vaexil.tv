# Vaexil.tv Deployment Checklist

This project is set up for Vercel plus a hosted libSQL/Turso database.

## Before First Production Deploy

1. Create or select the Vercel project. Recommended project name: `vaexil-tv`.
2. Create a hosted libSQL/Turso database.
3. Add these Vercel environment variables for Production and Preview:

```bash
ADMIN_PASSWORD="use-a-real-password"
ADMIN_SESSION_SECRET="use-a-long-random-string"
LIBSQL_URL="libsql://..."
LIBSQL_AUTH_TOKEN="..."
NEXT_PUBLIC_SITE_URL="https://vaexil.tv"
NEXT_PUBLIC_TWITCH_URL="https://www.twitch.tv/vaexil"
NEXT_PUBLIC_YOUTUBE_URL="https://www.youtube.com/@vaexil"
NEXT_PUBLIC_DISCORD_URL=""
NEXT_PUBLIC_GITHUB_URL=""
```

`LIBSQL_URL` must not be `file:.data/vaexil.db` on Vercel. The app intentionally throws an error on Vercel if a file database is configured, because Vercel filesystem storage is not persistent production storage.

## Domain Setup

Add both hostnames to the Vercel project:

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
- `/guides/freelancer-free-items` loads seeded guide rows from the hosted database.
- `/suggest` accepts a test suggestion.
- `/suggestions` shows the submitted suggestion.
- `/admin` accepts `ADMIN_PASSWORD`.
- Admin can verify and publish a test suggestion.
- Security headers are present, including `strict-transport-security`, `x-frame-options`, and `x-content-type-options`.

## Notes

- Do not enable static export for this project. Server actions and the DB-backed pages require the Next.js server runtime.
- Real guide content should be entered only after verification. The initial rows are fictional seed data.
- Changing any Vercel environment variable requires a new deployment before the change applies.
