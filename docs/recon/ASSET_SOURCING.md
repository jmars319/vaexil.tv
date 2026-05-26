# Recon Asset Sourcing

Public Recon still publishes no third-party map images, marker coordinates, API
data, official game icons, or guide text. Draft/admin Recon may now keep
explicitly approved third-party source-map images under `private/recon/` when
the owner has approved that private review use and the asset remains blocked
from public publication.

Private source maps are working assets, not final Vaexil public map plates. They
exist to make coordinate capture and floor/layer review practical. Do not copy
marker coordinates, marker labels, guide prose, checklist data, UI, or icons from
them unless a specific owner-approved private draft import is recorded in this
document and source packet. Do not move them to `public/` without a separate
publication decision, attribution review, and asset record update.

Third-party map images can still be used as temporary draw-under references
while producing Vaexil-authored plates. Temporary references that are not
explicitly recorded in the asset manifest must stay in scratch space and out of
Git.

## Reviewed Sources

| Candidate source | URL | Asset type | License/status | Attribution requirement | Imported | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| HITMAPS HITMAN 3 floor maps | https://www.hitmaps.com/games/hitman3/ | Interactive HITMAN floor maps and markers | Owner-approved private review use only; public publication not approved | Record source in manifest/docs | Private only | Floor map images are committed only as protected admin source maps for approved draft targets. No marker data, checklist data, public UI, labels, API nodes, or prose is copied. |
| HITMAPS website | https://www.hitmaps.com/ | Interactive HITMAN maps and markers | Third-party site; private source-map imagery approved for admin review only | Record source for imported private maps | Private only for approved HITMAN floor plates | Recon must not copy or depend on HITMAPS marker coordinates, UI, guide data, labels, or API nodes. |
| HITMAPS API docs | https://hitmaps.readme.io/ | API/data access | Requires visible attribution when using API/services | Required if used | No | User requirement is no HITMAPS API or data dependency. |
| HITMAPS nodes API | https://hitmaps.readme.io/reference/v2gamesgamelocationslocationmissionsmissionnodes | Marker/node data | API data with attribution/service terms | Required if used | No | Marker coordinates/data are excluded to keep Recon independent. |
| HITMAPS GitHub repo | https://github.com/hitmaps/hitmaps | Code and project assets | Code license is separate from game images/text; repo notes HITMAN assets belong to IO Interactive | Depends on asset | No | A code license does not make proprietary game map imagery or marker data safe to import. |
| HITMAPS media browser | https://mediabrowser.hitmaps.com/images/ | Images | No independent Vaexil permission beyond owner-approved HITMAN floor source maps | Unknown/unsafe | No general import | No hotlinking or broad media scraping. Only documented floor plates are imported as private candidate assets. |
| Sniper Elite 5 Maps | https://sniperelite5maps.de/ | Interactive Sniper Elite 5 maps and markers | Third-party site | Depends on license | No | Recon must not copy map images, marker coordinates, UI, or guide data. |
| Sniper Elite 5 Maps GitHub repo | https://github.com/lordfiSh/sniperelite5maps | Code/assets/data | CC BY-NC-SA posture is not suitable for unconstrained Vaexil.tv reuse | Attribution, non-commercial, share-alike if used | No | Non-commercial/share-alike obligations do not fit the independence goal. |
| eXputer Sniper Elite 5 interactive map article | https://exputer.com/guides/sniper-elite-5-interactive-map/ | Editorial map images, guide text, collectible counts | Third-party editorial content | Not used for assets | No | Cross-check source for base-mission and Wolf Mountain visual/count coverage only. Do not copy map images, screenshots, prose, or coordinates. |
| Guides4Gamers Sniper Elite 5 | https://guides4gamers.com/sniper-elite-5/maps/campaign-maps/ and DLC map pages | Maps, guide text, marker lists | Owner-approved private review use only; public publication not approved | Record source in manifest/docs | Private only | All eight main-campaign maps plus Wolf Mountain, Landing Force, Conqueror, Rough Landing, and Kraken Awakes are committed as protected admin draft source plates with draft/unverified marker seeds. Guide prose, screenshots, icons, and public UI are not copied. |
| Guides4Gamers Sniper Elite: Resistance | https://guides4gamers.com/sniper-elite-resistance/maps/campaign-maps/ and DLC map pages | Maps, guide text, marker lists | Owner-approved private review use only; public publication not approved | Record source in manifest/docs | Private only | All nine Sniper Elite: Resistance campaign cells plus Lights, Camera, Achtung!, Vercors Vendetta, Striking Range, and Mud and Thunder are committed as protected admin draft source plates with draft/unverified marker seeds. Guide prose, screenshots, icons, and public UI are not copied. |
| Gamer Guides Sniper Elite 5 | https://www.gamerguides.com/sniper-elite-5/maps | Interactive map index, marker counts, guide text, screenshots | Third-party editorial/map content | Not used for assets | No | Cross-check source for map-count/category coverage only. Do not copy screenshots, marker coordinates, guide prose, or marker detail text. |
| Wand Sniper Elite: Resistance | https://wand.com/maps/sniper-elite-resistance | Interactive map/checklist index and app-backed map data | Third-party map/checklist content | Not used for assets | No | Cross-check source for Resistance map/checklist coverage only. Do not copy app data, coordinates, screenshots, icons, or route prose. |
| MapMaster Sniper Elite Resistance | https://mapmaster.io/games/sniper-elite-resistance | Interactive Resistance maps and checklist UI | Third-party map/checklist content | Not used for assets | No | Cross-check source for Resistance visual map availability and rough area sanity only. Do not copy map images, coordinates, guide text, icons, or checklist data. |
| PowerPyx Sniper Elite Resistance collectible guide | https://www.powerpyx.com/sniper-elite-resistance-collectible-guide-letters-documents-items-eagles-workbenches/ | Editorial collectible guide, screenshots, counts | Third-party editorial content | Not used for assets | No | Cross-check source for Resistance collectible-count expectations only. Do not copy prose, screenshots, routes, or positions. |
| Sniper Elite 5 DLC collectible guides | https://www.powerpyx.com/ and https://itemlevel.net/ | Editorial DLC collectible guides | Third-party editorial content | Not used for assets | No | Cross-check source for DLC collectible/workbench plausibility only. Do not copy guide prose, screenshots, or positions. |
| GameSpot Sniper Elite: Resistance workbench guide | https://www.gamespot.com/gallery/sniper-elite-resistance-workbench-locations-weapon-workbenches-guide/2900-6153/ | Editorial guide, screenshots, workbench notes | Third-party editorial content | Not used for assets | No | Cross-check source for Resistance workbench count/location plausibility only. Do not copy screenshots, guide prose, or map images. |
| Game Rant Sniper Elite Resistance DLC guides | https://gamerant.com/db/video-game/sniper-elite-resistance/guides/ | Editorial DLC collectible/workbench guides, screenshots, counts | Third-party editorial content | Not used for assets | No | Striking Range and Mud and Thunder collectible/workbench spot checks only. Do not copy screenshots, prose, or positions. |
| IO Interactive HITMAN World of Assassination | https://ioi.dk/hitman | Official product/location context | Official source for facts, not reusable assets | Not used for assets | No | Source-packet citation only; no screenshots, art, or UI assets are imported. |
| Rebellion Sniper Elite 5 | https://shop.rebellion.com/products/sniper-elite-5 | Official product/feature context | Official source for facts, not reusable assets | Not used for assets | No | Source-packet citation only; no screenshots, art, or UI assets are imported. |
| Rebellion Sniper Elite: Resistance | https://shop.rebellion.com/products/sniper-elite-resistance | Official product/feature context | Official source for facts, not reusable assets | Not used for assets | No | Source-packet citation only; no screenshots, art, or UI assets are imported. |
| Push Square Sniper Elite guides | https://www.pushsquare.com/guides | Guide text, screenshots, collectible lists | Third-party editorial content | Not used for assets | No | Cross-check source only; do not copy screenshots, prose, marker coordinates, or guide routes. |

## Committed Assets

| Asset | Path | Source | License/status | Imported |
| --- | --- | --- | --- | --- |
| HITMAN Dubai Level -1 through Level 5 floor maps | `private/recon/maps/hitman-dubai/` | HITMAPS | Third-party source map; private draft review use approved by owner | Yes, private only |
| HITMAN Berlin Level -2 through Level 4 floor maps | `private/recon/maps/hitman-berlin/` | HITMAPS | Third-party source map; private draft review use approved by owner | Yes, private only |
| Sniper Elite 5 main-campaign and DLC surface maps | `private/recon/maps/sniper-elite-5/*-guides4gamers-surface.jpg` | Guides4Gamers | Third-party source map; private draft review use approved by owner | Yes, private only |
| Sniper Elite: Resistance campaign and DLC surface maps | `private/recon/maps/sniper-elite-resistance/*-guides4gamers-surface.jpg` | Guides4Gamers | Third-party source map; private draft review use approved by owner | Yes, private only |
| HITMAN Dubai draft schematic | `private/recon/maps/hitman-dubai-draft.svg` | Vaexil.tv-created neutral draft asset | Vaexil-created draft schematic | No |
| Sniper Elite 5 The Atlantic Wall draft schematic | `private/recon/maps/se5-atlantic-wall-draft.svg` | Vaexil.tv-created neutral draft asset | Vaexil-created draft schematic | No |
| Sniper Elite: Resistance Behind Enemy Lines draft schematic | `private/recon/maps/ser-behind-enemy-lines-draft.svg` | Vaexil.tv-created neutral draft asset | Vaexil-created draft schematic | No |
| Draft map placeholder | `private/recon/maps/draft-map-placeholder.svg` | Vaexil.tv-created neutral draft asset | Vaexil-created placeholder | No |
| Neutral common icons | `public/recon/icons/common/` | Vaexil.tv-created neutral icons | Vaexil-created placeholders | No |

No official game icons, screenshots, publisher map art, third-party guide text,
or third-party API data were imported. The only third-party marker-coordinate
imports currently approved are the private Sniper Elite 5 and Sniper Elite:
Resistance Guides4Gamers draft marker seeds in
`src/data/recon/marker-seeds.json`; they are not public content.

Cross-check records in `src/data/recon/source-cross-checks.json` may cite
Gamer Guides, Wand, GameSpot, Push Square, and similar guides as secondary
review sources. Those records are review metadata only: they may store source
labels, URLs, count comparisons, source gaps, and next steps, but not copied
coordinates, route prose, screenshots, icons, or guide-specific descriptions.
Sniper Elite visual comparison status and the owner manual-review queue are
summarized in `docs/recon/VISUAL_CROSS_CHECKS.md`.

## Owner Decisions Remaining

- Decide whether any private source map can ever be published publicly and what
  attribution/license posture would be required.
- Decide where final high-resolution Vaexil-authored schematic maps will be
  produced and reviewed.
- Decide whether final public map assets should live in the repo under
  `public/recon/maps/` or in configured storage/CDN.
- Decide whether any publisher/community assets are worth requesting permission
  for later.
- Decide the review threshold for moving a draft map from private admin preview
  to public Recon.

## Recommended Next Steps

1. Use the private source maps for admin coordinate tooling and first-hand review
   only.
2. Keep exact marker placement unpublished until it is validated through Vaexil
   gameplay or explicitly approved private draft source material.
3. Create final public plates as a separate asset review step.
4. Record every final asset in `src/data/recon/asset-manifest.json`.
5. Record floor/interior view coverage in `src/data/recon/map-views.json`.
6. Keep `src/data/recon/source-packets.json` current before moving a map toward
   publication.
7. Update `public/recon/ATTRIBUTIONS.md` before any third-party licensed asset
   is approved for public use.
8. Generate scratch-only visual comparison material with
   `node scripts/build-recon-visual-review-pack.mjs` when manually checking
   Sniper Elite map alignment, then keep the generated files out of Git.
