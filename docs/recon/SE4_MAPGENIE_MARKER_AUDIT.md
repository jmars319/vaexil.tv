# Sniper Elite 4 MapGenie Marker Audit

Last reviewed: 2026-06-16

## Source Basis

- Primary private source: `https://mapgenie.io/sniper-elite-4/maps/italia`
- Secondary recorded references: `https://sniperelite4maps.de/h/` and `https://github.com/lordfiSh/sniperelite4maps`
- Import/audit commands:
  - `npm run import:recon-se4-mapgenie-details`
  - `npm run audit:recon-se4-mapgenie`

## Result

The SE4 Recon layer represents every MapGenie marker currently assigned into the
twelve local mission bounds: 564 draft markers across 12 maps. Every local SE4
marker now has a private marker detail record. MapGenie only exposes source
descriptions for 130 of those assigned markers and source images for 149 marker
contexts, so the remaining details intentionally fall back to the existing local
draft marker note.

All imported marker context is private/admin-only:

- Detail records use `visibility: "private"` and `status: "draft"`.
- Image assets live under `private/recon/markers/sniper-elite-4/`.
- Image assets are `imported: true`, `status: "candidate"`, and
  `visibility: "private"`.
- Public-style Recon views suppress the private marker text and images.

## Map Counts

| Map | Marker count | Private details | Source descriptions | Context images |
| --- | ---: | ---: | ---: | ---: |
| San Celini Island | 56 | 56 | 46 | 33 |
| Bitanti Village | 61 | 61 | 25 | 43 |
| Regilino Viaduct | 60 | 60 | 22 | 33 |
| Lorino Dockyard | 66 | 66 | 29 | 40 |
| Abrunza Monastery | 41 | 41 | 1 | 0 |
| Magazzeno Facility | 40 | 40 | 1 | 0 |
| Giovi Fiorini Mansion | 34 | 34 | 1 | 0 |
| Allagra Fortress | 41 | 41 | 1 | 0 |
| Target Fuhrer | 37 | 37 | 1 | 0 |
| Deathstorm Part 1: Inception | 36 | 36 | 1 | 0 |
| Deathstorm Part 2: Infiltration | 44 | 44 | 1 | 0 |
| Deathstorm Part 3: Obliteration | 48 | 48 | 1 | 0 |
| **Total** | **564** | **564** | **130** | **149** |

## Publication Limits

This pass does not make SE4 public-ready. The map plates, marker coordinates,
source descriptions, and context images remain private review material only.
Before any public release, replace or rewrite source text, replace private
source imagery with Vaexil-authored public-safe material, and perform first-hand
gameplay validation for marker meaning and placement.
