# Recon Visual Cross-Checks

This document records the Sniper Elite 5 and Sniper Elite: Resistance visual
source comparison pass. It does not make any map public and does not mark exact
marker coordinates as verified. It only records whether each private draft map
has been compared against secondary visual/count references far enough for a
manual owner review pass.

## Source Rules

- Keep Guides4Gamers source plates and marker seeds private/admin-only.
- Use SniperElite5Maps, eXputer, Gamer Guides, Wand, MapMaster, PowerPyx,
  GameSpot, Push Square, Game Rant, and similar sources only for visual
  comparison, count checks, source-gap detection, and manual review focus.
- Do not copy third-party coordinates, route prose, screenshots, icons, app
  data, guide descriptions, or public UI into Recon.
- Do not commit third-party comparison images that are not recorded private
  assets in `src/data/recon/asset-manifest.json`.

## Scratch Review Pack

Run this when a reviewer needs side-by-side visual material:

```bash
node scripts/build-recon-source-cross-checks.mjs --write
node scripts/build-recon-visual-review-pack.mjs
```

The visual review pack writes to the system temp directory by default and may
include copied third-party reference images. It must stay out of Git and must
not be published. The generated `INDEX.md`, `SUMMARY.json`, and contact sheets
are for manual owner review only.

## Current Coverage

`src/data/recon/source-cross-checks.json` is the generated status source. As of
the current pass:

- 26 Sniper Elite maps have source cross-check records.
- 25 maps have `visual_sources_compared`.
- 1 map has `partial_visual_sources_compared`: Mud and Thunder.
- 2 maps have recorded manual position-review passes: The Atlantic Wall and
  Behind Enemy Lines.
- 24 maps still need exact manual position review before any marker confidence
  upgrade.

| Game | Map | Source status | Visual review | Sources | Manual review emphasis |
| --- | --- | --- | --- | ---: | --- |
| Sniper Elite 5 | The Atlantic Wall | position cross checked | visual sources compared | 5 | Regression-check shoreline, beach, workbenches, medals, and utility clusters after any marker change. |
| Sniper Elite 5 | Occupied Residence | needs manual position review | visual sources compared | 5 | Review workbenches, starts/exfil, chateau/interior areas, and high-density utility layers. |
| Sniper Elite 5 | Spy Academy | needs manual position review | visual sources compared | 5 | Review vertical monastery/town layers, workbenches, medals, and dense interior points. |
| Sniper Elite 5 | War Factory | needs manual position review | visual sources compared | 5 | Review factory buildings, rail/yard regions, workbenches, and tool clusters. |
| Sniper Elite 5 | Festung Guernsey | needs manual position review | visual sources compared | 5 | Review bunker/coastal regions, tower/AA areas, workbenches, and route-adjacent tools. |
| Sniper Elite 5 | Liberation | needs manual position review | visual sources compared | 5 | Review town/river/crossing regions, workbenches, and long-route collectibles. |
| Sniper Elite 5 | Secret Weapons | needs manual position review | visual sources compared | 5 | Review V2 complex, dome/launch areas, workbenches, and interior/surface separation. |
| Sniper Elite 5 | Rubble and Ruin | needs manual position review | visual sources compared | 5 | Review city block geometry, subway/interior candidates, workbenches, and medals. |
| Sniper Elite 5 | Wolf Mountain | needs manual position review | visual sources compared | 5 | Review villa/approach routes, workbenches, and utility markers before publishing. |
| Sniper Elite 5 | Landing Force | needs manual position review | visual sources compared | 3 | Review fort/coastal-gun areas, submarine/AA areas, workbenches, and DLC collectible counts. |
| Sniper Elite 5 | Conqueror | needs manual position review | visual sources compared | 3 | Review fortress blocks, courtyards, workbenches, and DLC collectible-count expectations. |
| Sniper Elite 5 | Rough Landing | needs manual position review | visual sources compared | 3 | Review runway/crash-site regions, workbenches, and sparse-map edge placement. |
| Sniper Elite 5 | Kraken Awakes | needs manual position review | visual sources compared | 3 | Review port/submarine-pen regions, workbenches, and industrial interior candidates. |
| Sniper Elite: Resistance | Behind Enemy Lines | position cross checked | visual sources compared | 6 | Regression-check corrected campaign-cell transform, dam/road edges, workbench, and interior layer. |
| Sniper Elite: Resistance | Dead Drop | needs manual position review | visual sources compared | 6 | Review by town quadrants; workbenches, starts/exfil, and high-density utility clusters first. |
| Sniper Elite: Resistance | Sonderzuge Sabotage | needs manual position review | visual sources compared | 6 | Review rail/yard regions, bridges, workbenches, and dense collectible clusters by quadrant. |
| Sniper Elite: Resistance | Collision Course | needs manual position review | visual sources compared | 6 | Review coastal/fortified areas, workbenches, interiors, and route-sensitive marker clusters. |
| Sniper Elite: Resistance | Devil's Cauldron | needs manual position review | visual sources compared | 6 | Review mountain/tunnel candidates, workbenches, and high-density collectible clusters by region. |
| Sniper Elite: Resistance | Assault on Fort Rouge | needs manual position review | visual sources compared | 6 | Review fort levels, courtyards, workbenches, and vertical/interior areas. |
| Sniper Elite: Resistance | Lock, Stock and Barrels | needs manual position review | visual sources compared | 6 | Review valley/bridge routes, workbenches, and interior/underground candidates. |
| Sniper Elite: Resistance | End of the Line | needs manual position review | visual sources compared | 6 | Review rail/terminal areas, starts/exfil, workbenches, and sparse edge markers. |
| Sniper Elite: Resistance | All or Nothing | needs manual position review | visual sources compared | 4 | Confirm whether a minimal mission note is better than a full map because normal collectible coverage is intentionally sparse. |
| Sniper Elite: Resistance | Lights, Camera, Achtung! | needs manual position review | visual sources compared | 4 | Review studio lots/interiors, workbenches, and dense set-piece marker groups. |
| Sniper Elite: Resistance | Vercors Vendetta | needs manual position review | visual sources compared | 3 | Review village/road regions, workbenches, and DLC collectible-count expectations. |
| Sniper Elite: Resistance | Striking Range | needs manual position review | visual sources compared | 4 | Review all marker positions manually; independent visual coverage exists, but fewer secondary sources are recorded than campaign maps. |
| Sniper Elite: Resistance | Mud and Thunder | needs manual position review | partial visual sources compared | 3 | Treat as first-hand review priority; current secondary checks are guide-based rather than a full independent map surface. |

## Manual Review Standard

For each map, compare the scratch contact sheet, the admin draft map, and the
linked source records before changing marker confidence. Review in this order:

1. Workbenches, starting points, exfiltration points, objectives, and
   medal-related markers.
2. Collectibles by map quadrant or named district.
3. Utility layers such as satchels, crowbars, bolt cutters, keys, alarms,
   generators, phones, medical items, and ammo.
4. Underground, tunnel, bunker, dam, interior, or vertical areas that may need
   separate map views.
5. Any marker near water, title margins, cropped borders, or obvious negative
   space.

Do not move a map or marker toward public publication until the source check is
clean for that category and a first-hand gameplay or owner-approved review pass
has been recorded.
