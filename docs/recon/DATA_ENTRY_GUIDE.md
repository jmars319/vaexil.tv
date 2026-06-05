# Recon Data Entry Guide

Recon data should be factual, reviewed, and source-conscious. Do not invent real
guide facts to make a map feel complete.

## Add A Map

1. Add the game to `src/data/recon/games.json` if it does not already exist.
2. Add a draft map record to `src/data/recon/maps.json`.
3. Add a matching private placeholder or draft asset record to
   `src/data/recon/asset-manifest.json`.
4. Add floor, surface, or interior views to `src/data/recon/map-views.json`.
5. Add or update the map's source packet in
   `src/data/recon/source-packets.json`.
6. Add or update source cross-check status in
   `src/data/recon/source-cross-checks.json` for Sniper Elite maps.
7. Add optional marker-detail seed records in
   `src/data/recon/marker-details.json` only after the marker ids exist.
8. Keep the map status as `draft`.
9. Keep the asset visibility as `private` until it is approved for public use.
10. Run `npm run db:seed` so libSQL/Turso receives the updated seed records.
11. Run `npm run recon:upload-assets -- --write --verify` when private asset
    files under `private/recon/` need to be copied to R2.

Public map pages do not render until the map is `published` and the map asset is
`approved` plus `public`.

## Add Marker Categories

Marker categories live in `src/data/recon/category-registry.ts`.

Each category needs:

- stable key
- display label
- short description
- default icon key
- default visibility
- applicable games
- applicable modes

Add or replace icons through `src/data/recon/icon-manifest.json` and
`public/recon/icons/common/` unless a game-specific icon is legally approved.

## Capture Coordinates

1. Sign in to `/admin`.
2. Open `/admin/recon`.
3. Choose a draft map.
4. Use the map navigator when moving through a same-game review pass.
5. Choose the correct map view before clicking:
   - HITMAN maps should use floor views such as `B1`, `1F`, `2F`, `3F`,
     `4F`, `5F`, or `Roof` instead of flattening all markers onto one plate.
   - Sniper Elite maps should separate `surface` from underground, bunker,
     dam, tunnel, or interior review layers when those spaces matter.
6. Use layer groups and presets to isolate the marker category being checked.
7. Use marker search or the visible-marker results panel to recenter existing
   markers before correcting or comparing nearby positions.
8. Click the map to capture `x` and `y`.
9. Confirm the normalized coordinates and floor/layer shown under the form.
10. Add label, category, mode, variant, and notes.
11. Save the marker as pending review.

Use `/admin/recon/maps/[mapSlug]/preview` or the `Public preview` button on the
capture page to check the simplified visitor-facing presentation before a map is
published. The preview is admin-only: it may load private base maps through the
protected asset route, but it filters marker media the same way public pages do.
Source packets and cross-check notes stay out of this public-style view; add
short marker-detail records when a map needs visitor-facing how-to guidance.

Coordinate rules:

- `x = 0` is the left edge, `x = 100` is the right edge.
- `y = 0` is the top edge, `y = 100` is the bottom edge.
- Do not enter raw pixels as canonical marker data.
- Floor/layer values should match the selected `map-views.json` `floor`
  value unless first-hand review proves a more precise label is needed.

## Private Source Maps And Temporary References

HITMAPS and Guides4Gamers source maps may be committed only when they are
explicit private review assets in `src/data/recon/asset-manifest.json` with
`imported: true`, `visibility: private`, and `status: candidate`. They are for
admin coordinate capture and map review only. They are not public map plates.
Owner-approved private draft imports may seed coordinates and short factual
labels for admin review, but they do not make guide prose, checklist data, UI,
API nodes, icons, screenshots, or public publication rights reusable.

Source-derived marker seeds may be committed only when `docs/recon/ASSET_SOURCING.md`
and `src/data/recon/source-packets.json` record a specific owner-approved
private draft import. Keep those markers `draft`/`unverified`, record the
coordinate transform in tags or notes, and cross-check obvious placement drift
with an overlay before using them in admin review.

For Sniper Elite maps, source cross-check records live in
`src/data/recon/source-cross-checks.json`. They record which secondary sources
were checked, local marker/workbench counts, visual-review status, known gaps,
and next review steps.
They must not store copied third-party coordinates or guide prose. Rebuild the
SE5/Resistance comparison records with
`node scripts/build-recon-source-cross-checks.mjs --write` after marker
import/category changes, then manually update any map-specific review notes that
came from a real position pass. Refresh legacy V2R/SE3/SE4 source-gap records
with `node scripts/import-legacy-sniper-elite-recon.mjs --write`.

The Sniper Elite V2 Remastered, Sniper Elite 3, and Sniper Elite 4 seed records
are intentionally source-limited placeholders for this pass. They have private
Vaexil draft plates, source packets, and source-gap cross-check records, but no
coordinate marker seeds. Add legacy marker positions only after an approved
private source import or first-hand gameplay pass records the map view,
category, source basis, and remaining uncertainty.

Guides4Gamers, HITMAPS, publisher screenshots, and other map images may still be
opened or briefly stored in scratch space as draw-under references. Scratch
references that are not recorded in the asset manifest must not be committed,
hotlinked, traced exactly, or used for copied marker coordinates/text.
For Sniper Elite visual comparison, run
`node scripts/build-recon-visual-review-pack.mjs` and follow
`docs/recon/VISUAL_CROSS_CHECKS.md`. The generated pack is scratch-only and
must stay out of Git.

## Marker Detail Notes

Marker detail records live in `src/data/recon/marker-details.json` and are
seeded into `recon_marker_details`. Use them for short, reviewable location
hints, how-to steps, requirements, uncertainty notes, and approved media asset
ids. They should expand or structure existing marker descriptions; they should
not copy guide prose from another site.

The viewer shows marker details only after a marker is selected. Desktop uses an
anchored popover and mobile uses a bottom sheet, so keep each detail concise and
scannable. If a detail links media, private assets must remain under
`private/recon/` and load through `/admin/recon/assets/[assetId]`; public pages
must use only `public` plus `approved` assets.

## Verify And Publish

Coordinate capture is only a staging tool. A pending marker suggestion is not
public.

Before publishing a marker:

- verify the location through first-hand gameplay or permitted source material
- confirm the map plate is the correct version
- confirm mode and variant
- ensure notes describe uncertainty instead of hiding it
- confirm the map's source cross-check does not show an unresolved source gap
  for the marker category being published
- set the marker status to `published` only after review

Source packets should be reviewed before publication. Each published map needs
official source context, reference source context, uncertainty notes, and a clear
list of source material that was not copied.

Full marker publishing UI is intentionally deferred. Until that exists, direct
database edits should be done carefully and only after review.

## Avoid Unverified Facts

- Do not copy coordinates from HITMAPS, Sniper Elite Maps, Guides4Gamers, or
  other reference sites unless a specific owner-approved private draft import is
  documented in the asset-sourcing notes and source packet.
- Do not copy guide text, walkthrough prose, screenshots, icons, or public UI
  from third-party maps.
- Do not mark a point verified because it seems plausible.
- Use `pending` or `draft` until the location has been checked.
- Prefer short factual notes over confident but untested claims.
