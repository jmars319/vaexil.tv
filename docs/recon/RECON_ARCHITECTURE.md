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
- `/recon/hitman/[mapSlug]` only renders published maps with approved public
  assets.
- `/recon/sniper-elite-5/[missionSlug]` only renders published maps with
  approved public assets.
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

Initial Recon assets are neutral Vaexil-created placeholders and custom neutral
icons. Future game map plates should be Vaexil-authored schematic maps created
from first-hand gameplay review and manual validation.

Draft assets belong outside `public/`, currently under `private/recon/`. The
admin asset route is authenticated and no-store. Before a map becomes public,
move the approved public-ready asset to `public/recon/maps/`, update the asset
record to `visibility = public` and `status = approved`, then publish the map.

Do not import or copy third-party maps, icons, marker coordinates, guide text, or
API data unless a compatible license or explicit permission is recorded first.

## Admin Workflow

The first Recon admin pass is coordinate capture, not a full CMS.

1. Open `/admin/recon`.
2. Choose a draft map.
3. Click the private draft map to capture normalized coordinates.
4. Add label, category, mode, variant, optional floor, and factual notes.
5. Save as a pending marker suggestion.
6. Verify separately before converting any suggestion into a published marker.

Publishing markers and maps remains an explicit future admin workflow. Nothing
from coordinate capture publishes automatically.

## Freelancer Guide Bridge

The existing Freelancer Free Items guide remains the stable canonical guide.
Recon links back to it as the current guide. The guide links to Recon as an
experimental preview. Recon should only replace the table after maps, marker
entry, verification, and admin publishing become accurate and low-friction.
