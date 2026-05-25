# Recon Asset Sourcing

Recon v1 imports no third-party map images, API data, marker coordinates, icons,
or guide text. The only committed Recon visual assets are Vaexil-created neutral
draft schematic and icon assets.

Third-party map images may be used as temporary visual references while drawing
Vaexil-authored plates. Treat them like a removable draw-under layer: store them
only in scratch space, keep them out of Git, do not trace exact geometry or copy
marker positions/text, and delete them after the Vaexil plate is drawn.

## Reviewed Sources

| Candidate source | URL | Asset type | License/status | Attribution requirement | Imported | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| HITMAPS website | https://www.hitmaps.com/ | Interactive HITMAN maps and markers | Third-party site; not a source for independent Recon data | Not used | No | Recon must not copy or depend on HITMAPS maps, marker coordinates, UI, or guide data. |
| HITMAPS API docs | https://hitmaps.readme.io/ | API/data access | Requires visible attribution when using API/services | Required if used | No | User requirement is no HITMAPS API or data dependency. |
| HITMAPS nodes API | https://hitmaps.readme.io/reference/v2gamesgamelocationslocationmissionsmissionnodes | Marker/node data | API data with attribution/service terms | Required if used | No | Marker coordinates/data are excluded to keep Recon independent. |
| HITMAPS GitHub repo | https://github.com/hitmaps/hitmaps | Code and project assets | Code license is separate from game images/text; repo notes HITMAN assets belong to IO Interactive | Depends on asset | No | A code license does not make proprietary game map imagery or marker data safe to import. |
| HITMAPS media browser | https://mediabrowser.hitmaps.com/images/ | Images | No independent Vaexil permission | Unknown/unsafe | No | No hotlinking, scraping, or importing third-party map media. |
| Sniper Elite 5 Maps | https://sniperelite5maps.de/ | Interactive Sniper Elite 5 maps and markers | Third-party site | Depends on license | No | Recon must not copy map images, marker coordinates, UI, or guide data. |
| Sniper Elite 5 Maps GitHub repo | https://github.com/lordfiSh/sniperelite5maps | Code/assets/data | CC BY-NC-SA posture is not suitable for unconstrained Vaexil.tv reuse | Attribution, non-commercial, share-alike if used | No | Non-commercial/share-alike obligations do not fit the independence goal. |
| Guides4Gamers Sniper Elite 5 | https://guides4gamers.com/sniper-elite-5/maps/campaign-maps/ | Maps, guide text, marker lists | Site terms restrict copying/reuse/scraping | Permission required | No | No copied guide text, maps, marker lists, or scraping. |
| Guides4Gamers Sniper Elite: Resistance | https://guides4gamers.com/sniper-elite-resistance/maps/campaign-maps/ | Maps, guide text, marker lists | Site terms restrict copying/reuse/scraping | Permission required | No | Temporary visual reference only; no committed images, marker lists, marker coordinates, or copied guide text. |
| IO Interactive HITMAN World of Assassination | https://ioi.dk/hitman | Official product/location context | Official source for facts, not reusable assets | Not used for assets | No | Source-packet citation only; no screenshots, art, or UI assets are imported. |
| Rebellion Sniper Elite 5 | https://shop.rebellion.com/products/sniper-elite-5 | Official product/feature context | Official source for facts, not reusable assets | Not used for assets | No | Source-packet citation only; no screenshots, art, or UI assets are imported. |
| Rebellion Sniper Elite: Resistance | https://shop.rebellion.com/products/sniper-elite-resistance | Official product/feature context | Official source for facts, not reusable assets | Not used for assets | No | Source-packet citation only; no screenshots, art, or UI assets are imported. |
| Push Square Sniper Elite guides | https://www.pushsquare.com/guides | Guide text, screenshots, collectible lists | Third-party editorial content | Not used for assets | No | Cross-check source only; do not copy screenshots, prose, marker coordinates, or guide routes. |

## Imported Assets

| Asset | Path | Source | License/status | Imported |
| --- | --- | --- | --- | --- |
| HITMAN Dubai draft schematic | `private/recon/maps/hitman-dubai-draft.svg` | Vaexil.tv-created neutral draft asset | Vaexil-created draft schematic | Yes |
| Sniper Elite 5 The Atlantic Wall draft schematic | `private/recon/maps/se5-atlantic-wall-draft.svg` | Vaexil.tv-created neutral draft asset | Vaexil-created draft schematic | Yes |
| Sniper Elite: Resistance Behind Enemy Lines draft schematic | `private/recon/maps/ser-behind-enemy-lines-draft.svg` | Vaexil.tv-created neutral draft asset | Vaexil-created draft schematic | Yes |
| Draft map placeholder | `private/recon/maps/draft-map-placeholder.svg` | Vaexil.tv-created neutral draft asset | Vaexil-created placeholder | Yes |
| Neutral common icons | `public/recon/icons/common/` | Vaexil.tv-created neutral icons | Vaexil-created placeholders | Yes |

No official game icons, screenshots, publisher map art, third-party map images,
third-party marker coordinates, third-party guide text, or third-party API data
were imported.

## Owner Decisions Remaining

- Decide where final high-resolution Vaexil-authored schematic maps will be
  produced and reviewed.
- Decide whether final public map assets should live in the repo under
  `public/recon/maps/` or in configured storage/CDN.
- Decide whether any publisher/community assets are worth requesting permission
  for later.
- Decide the review threshold for moving a draft map from private admin preview
  to public Recon.

## Recommended Next Steps

1. Keep using private placeholders for coordinate tooling until a real
   Vaexil-authored schematic map is ready.
2. Create each real map plate from first-hand gameplay review plus temporary
   reference-overlay review, not from committed or copied reference-site maps.
3. Record every final asset in `src/data/recon/asset-manifest.json`.
4. Record floor/interior view coverage in `src/data/recon/map-views.json`.
5. Keep `src/data/recon/source-packets.json` current before moving a map toward
   publication.
6. Update `public/recon/ATTRIBUTIONS.md` before any third-party licensed asset
   is approved.
