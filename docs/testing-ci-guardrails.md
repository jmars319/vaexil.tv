# Testing And CI Guardrails

- Test IDs use lowercase kebab-case, for example `recon-map-card`.
- E2E-created records should use an obvious fixture prefix and register cleanup in `finally`.
- Playwright `.first()` is allowed only with a nearby `selector-intentional-first` comment explaining why a business selector is not available.
- Browser tests use local base URLs. A direct production URL in a browser navigation needs a `production-url-intentional` comment.
- Smoke routes are listed in `e2e/smoke-routes.json`.
- Playwright reports, traces, screenshots, videos, and blob reports are ignored artifacts.
- Domain-specific map/recon admin flows stay local to this repo; do not import cPanel-only test tooling here.
