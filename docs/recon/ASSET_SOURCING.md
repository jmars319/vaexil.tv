# Recon Asset Sourcing

Recon v1 imports no third-party map images, API data, marker coordinates, icons,
or guide text. The only committed Recon visual assets are Vaexil-created neutral
placeholder/icon assets.

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

## Imported Assets

| Asset | Path | Source | License/status | Imported |
| --- | --- | --- | --- | --- |
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
2. Create each real map plate from first-hand gameplay review, not from copied
   reference-site maps.
3. Record every final asset in `src/data/recon/asset-manifest.json`.
4. Update `public/recon/ATTRIBUTIONS.md` before any third-party licensed asset
   is approved.
