# Recon Architecture

Recon is the Vaexil.tv interactive map and guide foundation for games covered on
stream. It is static curated knowledge: map plates, markers, field notes, and
guide text that are entered and reviewed by Vaexil/admins.

Recon is not AI-based, predictive, an API client for reference sites, or a clone
of HITMAPS, Sniper Elite Maps, Guides4Gamers, or any other map project.

## Routes

- `/recon` is the public Recon landing page.
- `/recon/hitman` is the public HITMAN Recon game page.
- `/recon/sniper-elite-5` is the public Sniper Elite 5 Recon game page.
- `/recon/sniper-elite-resistance` is the public Sniper Elite: Resistance Recon
  game page.
- `/recon/hitman/[mapSlug]` only renders published maps with approved public
  assets.
- `/recon/sniper-elite-5/[missionSlug]` only renders published maps with
  approved public assets.
- `/recon/sniper-elite-resistance/[missionSlug]` only renders published maps
  with approved public assets.
- `/admin/recon` is the protected Recon admin index.
- `/admin/recon/maps/[mapSlug]` is the protected coordinate capture surface.
- `/admin/recon/assets/[assetId]` serves private draft assets only after admin
  authentication.

Draft map URLs should 404 publicly. Draft assets must not be placed in
`public/`.

## Data Model

Recon uses the existing libSQL/Turso database through `src/lib/db.ts` and
`src/lib/repository.ts`.

Core tables:

- `recon_games`: enabled game registry.
- `recon_maps`: map/mission records with `draft` or `published` status.
- `recon_assets`: map/icon/overlay provenance and visibility records.
- `recon_markers`: reviewed marker data for published map layers.
- `recon_guides`: future written guide entries linked to maps and markers.
- `recon_marker_suggestions`: non-public coordinate captures and marker
  suggestions.

Marker coordinates are normalized:

- `x` is `0` to `100` from left to right.
- `y` is `0` to `100` from top to bottom.

The viewer calculates pixel positions from map dimensions at render time. Do not
store only raw pixels.

Source packets live in `src/data/recon/source-packets.json`. They are
reviewable research records for map-level official sources, reference sources,
approximate areas, candidate POIs, uncertainty, and copyright-sensitive material
to avoid. They are not marker data and should not be treated as verified
coordinates.

Draft view metadata lives in `src/data/recon/map-views.json`. Views map a
logical selector such as `B1`, `1F`, `2F`, `surface`, or `underground` to a
private asset. HITMAN maps should not flatten multi-floor spaces into one plate;
Dubai currently keeps private floor views from Level -1 through Level 5, and
Berlin keeps private floor views from Level -2 through Level 4. Sniper Elite
maps may be mostly surface-level, but underground, bunker, dam, tunnel, or
interior spaces should get separate views when they affect marker review.

## Publishing Rules

Public map pages require all of the following:

- game is enabled
- map is enabled
- map status is `published`
- map has an asset
- asset visibility is `public`
- asset status is `approved`

Marker visibility requires marker status `published`. Draft, pending, verified,
or rejected markers are not public.

## Asset Workflow

Recon assets include neutral Vaexil-created placeholders, custom neutral icons,
and private candidate source maps that the owner has approved for admin review.
Future public game map plates should still go through a separate publication
review and may be Vaexil-authored schematic maps created from first-hand gameplay
review and manual validation.

Private source maps from HITMAPS or Guides4Gamers may be committed only under
`private/recon/` with `imported: true`, `visibility = private`, and
`status = candidate`. They are admin-only review surfaces for coordinate capture,
not public assets. Do not use them to copy marker coordinates, marker labels,
guide prose, checklist data, icons, UI, or API nodes.

Reference images from HITMAPS, Guides4Gamers, publisher screenshots, or other
guide sites may also be used temporarily as draw-under material while authoring a
Vaexil plate. Temporary references that are not recorded in the asset manifest
must remain outside Git.

Draft assets belong outside `public/`, currently under `private/recon/`. The
admin asset route is authenticated and no-store. Before a map becomes public,
move the approved public-ready asset to `public/recon/maps/`, update the asset
record to `visibility = public` and `status = approved`, then publish the map.

Do not publish third-party maps or import/copy third-party icons, marker
coordinates, guide text, or API data unless a compatible license or explicit
permission is recorded first.

## Admin Workflow

The first Recon admin pass is coordinate capture, not a full CMS.

1. Open `/admin/recon`.
2. Choose a draft map.
3. Choose the correct floor/surface/interior view.
4. Click the private draft map to capture normalized coordinates.
5. Add label, category, mode, variant, optional floor, and factual notes.
6. Save as a pending marker suggestion.
7. Verify separately before converting any suggestion into a published marker.

Publishing markers and maps remains an explicit future admin workflow. Nothing
from coordinate capture publishes automatically.

The current draft targets are HITMAN Dubai, HITMAN Berlin, Sniper Elite 5 The
Atlantic Wall, and Sniper Elite: Resistance Behind Enemy Lines. The HITMAN
targets have private floor source maps for admin review. The Sniper Elite
targets have private surface source maps plus separate approximate
Vaexil-authored interior/underground review plates.

## Freelancer Guide Bridge

The existing Freelancer Free Items guide remains the stable canonical guide.
Recon links back to it as the current guide. The guide links to Recon as an
experimental preview. Recon should only replace the table after maps, marker
entry, verification, and admin publishing become accurate and low-friction.
