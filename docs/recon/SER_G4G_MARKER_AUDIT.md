# Sniper Elite: Resistance G4G Marker Audit

Last reviewed: 2026-06-16

This audit tracks whether local Recon has every marker currently exposed by
Guides4Gamers for Sniper Elite: Resistance. The local markers remain
private draft review data until first-hand Vaexil validation confirms exact
in-game placement and meaning.

## Source Basis

- Guides4Gamers campaign map payload: `https://guides4gamers.com/sniper-elite-resistance/maps/campaign-maps/`
- Guides4Gamers DLC map payloads:
  - `https://guides4gamers.com/sniper-elite-resistance/maps/lights-camera-achtung/`
  - `https://guides4gamers.com/sniper-elite-resistance/maps/vercors-vendetta/`
  - `https://guides4gamers.com/sniper-elite-resistance/maps/striking-range/`
  - `https://guides4gamers.com/sniper-elite-resistance/maps/mud-and-thunder/`
- Cross-check references:
  - `https://mapmaster.io/games/sniper-elite-resistance`
  - `https://www.pushsquare.com/guides/sniper-elite-resistance-guide-100percent-collectibles-walkthrough`

## Current Live Payload Counts

| Map | G4G markers represented |
| --- | ---: |
| Behind Enemy Lines | 36 |
| Dead Drop | 236 |
| Sonderzüge Sabotage | 342 |
| Collision Course | 141 |
| Devil's Cauldron | 262 |
| Assault on Fort Rouge | 235 |
| Lock, Stock and Barrels | 229 |
| End of the Line | 95 |
| All or Nothing | 1 |
| Lights, Camera, Achtung! | 251 |
| Vercors Vendetta | 216 |
| Striking Range | 62 |
| Mud and Thunder | 90 |
| **Total** | **2196** |

Guides4Gamers currently exposes only 36 markers for `Behind Enemy Lines` and
1 marker for `All or Nothing`; the local low counts on those maps are a
source-payload reflection, not a local import miss.

The campaign-map collectible counts also match the independent public
collectible breakdown: 35 Personal Letters, 35 Classified Documents, 22 Hidden
Items, 21 Stone Eagles, and 22 Workbenches.

## Private Marker Context

The local admin seed also includes 2,196 private marker-detail records imported
from the Guides4Gamers marker descriptions, with one private context screenshot
per marker. Those records are intentionally tagged `visibility: private` and
their image assets are tagged `visibility: private` / `status: candidate`, so
they are available in admin capture views as source context but are suppressed
from public-style Recon views.

Run:

```bash
npm run import:recon-ser-g4g-details
```

This refreshes `src/data/recon/marker-details.json`,
`src/data/recon/asset-manifest.json`, and the local private screenshots under
`private/recon/markers/sniper-elite-resistance/`.

## Verification Command

Run:

```bash
npm run audit:recon-ser-g4g
```

The audit fetches the live Guides4Gamers JSON payloads, derives expected local
marker IDs, map IDs, source marker IDs, normalized labels, coordinates,
categories, icon keys, and source URLs, then compares them against
`src/data/recon/marker-seeds.json`.
