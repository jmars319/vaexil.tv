# Sniper Elite 5 G4G Marker Audit

Last reviewed: 2026-06-16

This audit tracks whether local Recon has every marker currently exposed by
Guides4Gamers for Sniper Elite 5. The local markers and imported marker context
remain private draft review data until first-hand Vaexil validation confirms
exact in-game placement and meaning.

## Source Basis

- Guides4Gamers campaign map payload: `https://guides4gamers.com/sniper-elite-5/maps/campaign-maps/`
- Guides4Gamers DLC map payloads:
  - `https://guides4gamers.com/sniper-elite-5/maps/wolf-mountain/`
  - `https://guides4gamers.com/sniper-elite-5/maps/landing-force/`
  - `https://guides4gamers.com/sniper-elite-5/maps/conqueror/`
  - `https://guides4gamers.com/sniper-elite-5/maps/rough-landing/`
  - `https://guides4gamers.com/sniper-elite-5/maps/kraken-awakes/`
- Cross-check references:
  - `https://www.gamerguides.com/sniper-elite-5/maps`
  - `https://exputer.com/guides/sniper-elite-5-interactive-map/`
  - `https://www.pushsquare.com/guides/sniper-elite-5-all-workbenches-locations`

## Current Live Payload Counts

| Map | G4G markers represented |
| --- | ---: |
| The Atlantic Wall | 79 |
| Occupied Residence | 62 |
| Spy Academy | 78 |
| War Factory | 74 |
| Festung Guernsey | 86 |
| Liberation | 72 |
| Secret Weapons | 100 |
| Rubble and Ruin | 76 |
| Wolf Mountain | 65 |
| Landing Force | 73 |
| Conqueror | 86 |
| Rough Landing | 62 |
| Kraken Awakes | 80 |
| **Total** | **993** |

## Private Marker Context

The local admin seed includes 993 private marker-detail records for Sniper Elite
5. Each marker has a useful admin detail hint: live Guides4Gamers marker prose
when available, otherwise the local draft marker note generated from marker
category/source context. The import also includes 422 unique private marker
context screenshots attached to the matching marker details.

Those records are intentionally tagged `visibility: private`, and their image
assets are tagged `visibility: private` / `status: candidate`, so they are
available in admin capture views as source context but are suppressed from
public-style Recon views.

Run:

```bash
npm run import:recon-se5-g4g-details
```

This refreshes `src/data/recon/marker-details.json`,
`src/data/recon/asset-manifest.json`, and the local private screenshots under
`private/recon/markers/sniper-elite-5/`.

## Verification Command

Run:

```bash
npm run audit:recon-se5-g4g
```

The audit fetches the live Guides4Gamers JSON payloads, derives expected local
marker IDs, map IDs, source marker IDs, normalized labels, coordinates,
categories, icon keys, and source URLs, then compares them against
`src/data/recon/marker-seeds.json`.
