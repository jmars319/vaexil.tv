# Recon Data Entry Guide

Recon data should be factual, reviewed, and source-conscious. Do not invent real
guide facts to make a map feel complete.

## Add A Map

1. Add the game to `src/data/recon/games.json` if it does not already exist.
2. Add a draft map record to `src/data/recon/maps.json`.
3. Add a matching private placeholder or draft asset record to
   `src/data/recon/asset-manifest.json`.
4. Keep the map status as `draft`.
5. Keep the asset visibility as `private` until it is approved for public use.
6. Run the seed flow or load the app so the database upserts the seed records.

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
4. Click the map to capture `x` and `y`.
5. Confirm the normalized coordinates shown under the form.
6. Add label, category, mode, variant, and notes.
7. Save the marker as pending review.

Coordinate rules:

- `x = 0` is the left edge, `x = 100` is the right edge.
- `y = 0` is the top edge, `y = 100` is the bottom edge.
- Do not enter raw pixels as canonical marker data.

## Verify And Publish

Coordinate capture is only a staging tool. A pending marker suggestion is not
public.

Before publishing a marker:

- verify the location through first-hand gameplay or permitted source material
- confirm the map plate is the correct version
- confirm mode and variant
- ensure notes describe uncertainty instead of hiding it
- set the marker status to `published` only after review

Full marker publishing UI is intentionally deferred. Until that exists, direct
database edits should be done carefully and only after review.

## Avoid Unverified Facts

- Do not copy coordinates from HITMAPS, Sniper Elite Maps, Guides4Gamers, or
  other reference sites.
- Do not copy guide text or labels from third-party maps.
- Do not mark a point verified because it seems plausible.
- Use `pending` or `draft` until the location has been checked.
- Prefer short factual notes over confident but untested claims.
