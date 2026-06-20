# Sniper Elite 3 MapGenie Marker Audit

Last reviewed: 2026-06-16

## Source Basis

- Primary private source: `https://mapgenie.io/sniper-elite-3/maps/afrika`
- Secondary recorded references: GameMappers, PowerPyx, PS4Trophies, and
  Gamepressure records already present in Recon source packets/cross-checks.
- Import/audit commands:
  - `npm run import:recon-se3-mapgenie-details`
  - `npm run audit:recon-se3-mapgenie`

## Result

The SE3 Recon layer represents every MapGenie marker currently assigned into the
twelve local mission regions: 362 draft markers across 12 maps. Every local SE3
marker now has a private marker detail record. MapGenie exposes source
descriptions for 164 assigned markers and source images for 184 marker contexts;
the remaining details intentionally fall back to the existing local draft marker
note.

All imported marker context is private/admin-only:

- Detail records use `visibility: "private"` and `status: "draft"`.
- Image assets live under `private/recon/markers/sniper-elite-3/`.
- Image assets are `imported: true`, `status: "candidate"`, and
  `visibility: "private"`.
- Public-style Recon views suppress the private marker text and images.

## Map Counts

| Map | Marker count | Private details | Source descriptions | Context images |
| --- | ---: | ---: | ---: | ---: |
| Siege of Tobruk | 18 | 18 | 9 | 7 |
| Gaberoun | 35 | 35 | 11 | 19 |
| Halfaya Pass | 40 | 40 | 10 | 20 |
| Fort Rifugio | 34 | 34 | 13 | 16 |
| Siwa Oasis | 36 | 36 | 16 | 15 |
| Kasserine Pass | 28 | 28 | 13 | 17 |
| Ponts Du Fahs Airfield | 33 | 33 | 18 | 19 |
| Ratte Factory | 32 | 32 | 18 | 19 |
| Hunt The Grey Wolf | 27 | 27 | 24 | 7 |
| In Shadows | 24 | 24 | 10 | 15 |
| Belly of the Beast | 35 | 35 | 12 | 20 |
| Confrontation | 20 | 20 | 10 | 10 |
| **Total** | **362** | **362** | **164** | **184** |

## Publication Limits

This pass does not make SE3 public-ready. The map plates, marker coordinates,
source descriptions, and context images remain private review material only.
Before any public release, replace or rewrite source text, replace private
source imagery with Vaexil-authored public-safe material, and perform first-hand
gameplay validation for marker meaning and placement.
