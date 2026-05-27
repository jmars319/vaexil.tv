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
- `/admin/recon/maps/[mapSlug]/preview` is the protected public-style preview
  for the simplified published map layout.
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
- `recon_source_packets`: compact per-map JSON research notes imported from the
  source-packet seed file.
- `recon_source_cross_checks`: compact per-map JSON cross-check and visual review
  notes imported from the source cross-check seed file.
- `recon_marker_details`: compact per-marker JSON guidance for location hints,
  how-to steps, requirements, review notes, and optional approved media asset
  links.

Marker coordinates are normalized:

- `x` is `0` to `100` from left to right.
- `y` is `0` to `100` from top to bottom.

The viewer calculates pixel positions from map dimensions at render time. Do not
store only raw pixels.

Runtime requests call `ensureDb()` only for schema migration. They do not import
or upsert large Recon seed JSON. Use `npm run db:seed` as the explicit local or
controlled migration step after changing games, maps, assets, markers, source
packets, source cross-checks, or marker-detail seed files.

Source packets are served from `recon_source_packets` with a temporary JSON
fallback in `src/data/recon/source-packets.json`. They are reviewable research
records for map-level official sources, reference sources, approximate areas,
candidate POIs, uncertainty, and copyright-sensitive material to avoid. They are
not marker data and should not be treated as verified coordinates.

Sniper Elite source cross-check records are served from
`recon_source_cross_checks` with a temporary JSON fallback in
`src/data/recon/source-cross-checks.json`. They summarize secondary source
coverage, count checks, source gaps, and manual position-review state for each
private draft Sniper Elite map. They are admin review metadata, not copied
third-party marker data.
`docs/recon/VISUAL_CROSS_CHECKS.md` records the current visual comparison
coverage and manual review queue, while
`scripts/build-recon-visual-review-pack.mjs` creates scratch-only side-by-side
reference sheets outside the repo.

Marker details are served from `recon_marker_details` with a temporary JSON
fallback in `src/data/recon/marker-details.json`. The payload is intentionally
small: `markerId`, `mapId`, `locationHint`, `howToSteps`, `requirements`,
`notes`, and optional `mediaAssetIds`. Existing marker descriptions remain the
fallback and should continue to carry uncertainty. Do not copy third-party guide
prose or screenshots into marker-detail payloads.

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

The protected public preview route is not a publication shortcut. It uses the
same simplified public map component and public-safe media filtering, but it can
load private base-map assets through the authenticated admin asset route and can
show current review markers so the published presentation can be evaluated
before status changes. It intentionally does not show source packets or
cross-check notes; those remain admin-review material. Public-style pages show
concise how-to guide cards from reviewed marker-detail payloads instead.

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
guide prose, checklist data, icons, UI, or API nodes unless the source packet and
asset-sourcing notes record a specific owner-approved private draft import. The
Sniper Elite 5 and Sniper Elite: Resistance Guides4Gamers imports are approved
only as private draft source plates and marker seeds. Main-campaign cells use the
corrected 3x3 campaign-cell transform rather than full campaign-composite
coordinates; DLC/extra maps use their own source-map coordinate transform. They
remain `draft`/`unverified`.

Reference images from HITMAPS, Guides4Gamers, publisher screenshots, or other
guide sites may also be used temporarily as draw-under material while authoring a
Vaexil plate. Temporary references that are not recorded in the asset manifest
must remain outside Git.

Draft assets belong outside `public/`, currently under `private/recon/` locally.
In Cloudflare R2, the standard target is the private bucket
`vaexil-tv-media-private` with `R2_RECON_KEY_PREFIX=recon/`, so the effective
object keys are `recon/private/recon/...`. The legacy `vaexil-recon-assets`
bucket remains a read fallback until the standardized bucket is manually
verified. The admin asset route is authenticated and no-store; it reads from R2
when `RECON_ASSET_STORE=r2` and falls back to local files in development. Before
a map becomes public, create an approved public-ready asset under the reserved
`public/recon/` prefix, update the asset record to `visibility = public` and
`status = approved`, then publish the map.

Do not publish third-party maps or import/copy third-party icons, marker
coordinates, guide text, or API data unless a compatible license or explicit
permission is recorded first.

## Admin Workflow

The first Recon admin pass is coordinate capture, not a full CMS.

Draft marker seeds may also populate the admin viewer when a private import is
explicitly approved. They stay in `recon_markers` with `status = draft` and do
not publish to public map pages.

The admin viewer includes navigation aids inspired by established interactive
map patterns without copying their UI or data:

- the admin map page has a same-game map navigator with previous/next controls
  and a horizontal map rail
- the map viewer keeps floor/surface/interior view tabs outside the layer
  system so HITMAN floors and Sniper Elite underground/interior views stay
  explicit
- layer controls are grouped into navigation, objectives, collectibles, tools,
  systems, supplies, and other categories with per-layer marker counts
- presets switch quickly between default, core, collectible, tool, all, and no
  layers
- marker search filters the active layers, while marker-list or map-marker
  selection recenters the map on the selected point
- marker details open in a desktop popover or mobile bottom sheet instead of a
  permanent sidebar, so the map remains the primary surface
- marker-detail media may point to `recon_assets`, but private media stays behind
  the authenticated admin asset route and public pages render only approved
  public assets
- the public preview strips out source/cross-check notes and replaces them with
  how-to guide cards for markers that have structured guide detail

These controls are intended to make review faster and clearer; they do not
change marker verification or publication rules.

1. Open `/admin/recon`.
2. Use the game-grouped index to choose the correct title and check its source
   cross-check status.
3. Choose a draft map.
4. Use `Public preview` when you need to review the simplified visitor-facing
   map presentation without opening the draft map publicly.
5. Choose the correct floor/surface/interior view.
6. Click the private draft map to capture normalized coordinates.
7. Add label, category, mode, variant, optional floor, and factual notes.
8. Save as a pending marker suggestion.
9. Verify separately before converting any suggestion into a published marker.

Publishing markers and maps remains an explicit future admin workflow. Nothing
from coordinate capture publishes automatically.

The current draft targets are HITMAN Dubai, HITMAN Berlin, all thirteen Sniper
Elite 5 main-campaign/DLC maps, and all thirteen Sniper Elite: Resistance
main-campaign/DLC maps. The HITMAN targets have private floor source maps for
admin review. The Sniper Elite targets have private surface source maps, with
separate approximate Vaexil-authored interior/underground review plates only
where those have been explicitly modeled.

## Freelancer Guide Bridge

The existing Freelancer Free Items guide remains the stable canonical guide.
Recon links back to it as the current guide. The guide links to Recon as an
experimental preview. Recon should only replace the table after maps, marker
entry, verification, and admin publishing become accurate and low-friction.
