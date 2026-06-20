# Recon Map Image Availability Audit

Last checked: 2026-06-16

## Scope

This audit covers the current Recon data in `src/data/recon/games.json`,
`src/data/recon/maps.json`, and `src/data/recon/asset-manifest.json`. It also
calls out the larger HITMAN World of Assassination source-image scope, because
the Recon game record says HITMAN World of Assassination and now includes the
core WOA location set rather than only the original Dubai and Berlin drafts.

Current Recon games:

- HITMAN World of Assassination
- Sniper Elite 3
- Sniper Elite 4
- Sniper Elite 5
- Sniper Elite: Resistance

Current Recon map entries: 74.

Confirmed high-quality no-marker-icon source plates for current Recon entries:
74.

Remaining clean source-image gaps in the current Recon map data: 0.

Expanded HITMAN WOA scope: HITMAPS exposes 37 SVG-backed mission pages/variants
for HITMAN 2016, HITMAN 2, and HITMAN 3 locations, collapsing to 24 unique clean
floor-map sets. Recon now has all 24 of those sets as private local review
assets, totaling 128 floor PNGs.

For this audit, "no icons" means no POI, collectible, objective, checklist, or
guide marker overlays. Some source plates still include baked-in map title text,
grid lines, original floor shapes, or decorative source-map labels.

## Summary

| Game | Recon maps | Clean source plate status | Source family |
| --- | ---: | --- | --- |
| HITMAN World of Assassination | 24 | Covered for core WOA SVG-backed map sets; 128 private floor PNGs | HITMAPS floor plates |
| Sniper Elite 3 | 12 | Covered | MapGenie/GameMappers |
| Sniper Elite 4 | 12 | Covered | MapGenie/GameMappers |
| Sniper Elite 5 | 13 | Covered | Guides4Gamers tile composites |
| Sniper Elite: Resistance | 13 | Covered | Guides4Gamers tile composites |

## HITMAN World of Assassination

Recon stores 24 core WOA map sets for HITMAN. Dubai and Berlin were the original
drafts:

| Recon map | Current source image coverage | Notes |
| --- | --- | --- |
| Dubai | Covered by HITMAPS floor plates, level -1 through level 5, under `private/recon/maps/hitman-dubai/` | Local PNG floors are 2048x2048 with no marker icons. Source page: `https://www.hitmaps.com/games/hitman3/dubai/on-top-of-the-world/` |
| Berlin | Covered by HITMAPS floor plates, level -2 through level 4, under `private/recon/maps/hitman-berlin/` | Local PNG floors are 1471x2048 with no marker icons. Source page: `https://www.hitmaps.com/games/hitman3/berlin/apex-predator/` |

The added local map set now matches the supported-game scope implied by "HITMAN
World of Assassination" for core SVG-backed WOA locations. HITMAPS confirms
clean SVG floor plates for the following 24 unique WOA map sets. The direct
clean floor URL pattern is:

`https://media.hitmaps.com/img/<hitmaps-game-slug>/maps/<map-folder>/<floor>.svg`

I checked every floor in each listed range on 2026-06-16, and every URL returned
HTTP 200. These are floor/base-map image overlays; HITMAPS markers are rendered
as separate interactive data layers. The local copies are rasterized to
2048px-class PNGs under `private/recon/maps/<map-id>/` and wired through
`maps.json`, `map-views.json`, `asset-manifest.json`, and `source-packets.json`.

| WOA map set | HITMAPS media folder | Floors checked | Recon/local status | Source page |
| --- | --- | --- | --- | --- |
| ICA Facility - Freeform Training | `hitman/freeform-training` | 0..3 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman/ica-facility/freeform-training/` |
| ICA Facility - The Final Test | `hitman/the-final-test` | 0..3 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman/ica-facility/the-final-test/` |
| Paris - The Showstopper | `hitman/paris` | 0..3 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman/paris/the-showstopper/` |
| Sapienza - World of Tomorrow | `hitman/sapienza` | 0..7 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman/sapienza/world-of-tomorrow/` |
| Marrakesh - A Gilded Cage | `hitman/marrakesh` | 0..3 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman/marrakesh/a-gilded-cage/` |
| Bangkok - Club 27 | `hitman/bangkok` | 0..5 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman/bangkok/club-27/` |
| Colorado - Freedom Fighters | `hitman/colorado` | 0..3 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman/colorado/freedom-fighters/` |
| Hokkaido - Situs Inversus | `hitman/hokkaido` | 0..3 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman/hokkaido/situs-inversus/` |
| Hawke's Bay - Nightcall | `hitman2/hawkes_bay` | 0..2 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman2/hawkes-bay/nightcall/` |
| Miami - The Finish Line | `hitman2/miami` | -1..3 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman2/miami/finish-line/` |
| Santa Fortuna - Three-Headed Serpent | `hitman2/santa_fortuna` | -1..2 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman2/santa-fortuna/three-headed-serpent/` |
| Mumbai - Chasing a Ghost | `hitman2/mumbai` | -1..7 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman2/mumbai/chasing-a-ghost/` |
| Whittleton Creek - Another Life | `hitman2/whittleton_creek` | -1..2 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman2/whittleton-creek/another-life/` |
| Ambrose Island - Shadows in the Water | `hitman2/shadows-in-the-water` | 0..4 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman2/ambrose-island/shadows-in-the-water/` |
| Isle of Sgàil - The Ark Society | `hitman2/isle_sgail` | 0..8 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman2/isle-of-sgail/ark-society/` |
| New York - Golden Handshake | `hitman2/golden-handshake` | -1..3 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman2/new-york/golden-handshake/` |
| Haven Island - The Last Resort | `hitman2/the-last-resort` | -3..3 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman2/haven-island/the-last-resort/` |
| Dubai - On Top Of The World | `hitman3/on-top-of-the-world` | -1..5 | Already in Recon/local assets | `https://www.hitmaps.com/games/hitman3/dubai/on-top-of-the-world/` |
| Dartmoor - Death In The Family | `hitman3/death-in-the-family` | 0..3 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman3/dartmoor/death-in-the-family/` |
| Dartmoor - The Dartmoor Garden Show | `hitman3/the-dartmoor-garden-show` | 0..0 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman3/dartmoor/the-dartmoor-garden-show/` |
| Berlin - Apex Predator | `hitman3/apex-predator` | -2..4 | Already in Recon/local assets | `https://www.hitmaps.com/games/hitman3/berlin/apex-predator/` |
| Chongqing - End Of An Era | `hitman3/end-of-an-era` | -3..5 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman3/chongqing/end-of-an-era/` |
| Mendoza - The Farewell | `hitman3/the-farewell` | 0..6 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman3/mendoza/the-farewell/` |
| Carpathian Mountains - Untouchable | `hitman3/untouchable` | 0..3 | Added to Recon/local assets; clean PNG floors present | `https://www.hitmaps.com/games/hitman3/carpathian-mountains/untouchable/` |

Additional HITMAN mission variants also exist on HITMAPS but share the same base
map folders listed above, for example Holiday Hoarders, The Icon, Landslide, A
House Built on Sand, The Source, Patient Zero, The Mills Reverie, A Silver
Tongue, Embrace of the Serpent, Illusions of Grandeur, A Bitter Pill, and other
variant pages. Counting those pages separately gives 37 SVG-backed mission
pages/variants, but still 24 unique floor-map sets.

HITMAPS also exposes three Sniper Assassin missions: Himmelstein, Hantu Port,
and Siberia. I did not count them in the 24 WOA SVG floor-map sets because their
API records use tiled maps instead of the clean single-SVG floor overlay pattern
above. If Recon should support HITMAN Sniper Assassin mode too, those need a
separate tile-stitching or first-hand capture pass.

## Sniper Elite 3

All current Sniper Elite 3 Recon maps have 2048px-class MapGenie source plates
under `private/recon/maps/sniper-elite-3/`.

| Recon map | Current source image coverage |
| --- | --- |
| Siege of Tobruk | Covered |
| Gaberoun | Covered |
| Halfaya Pass | Covered |
| Fort Rifugio | Covered |
| Siwa Oasis | Covered |
| Kasserine Pass | Covered |
| Ponts Du Fahs Airfield | Covered |
| Ratte Factory | Covered |
| Hunt The Grey Wolf | Covered |
| In Shadows | Covered |
| Belly of the Beast | Covered |
| Confrontation | Covered |

Source family references:

- MapGenie-backed SE3 map reference: `https://mapgenie.io/sniper-elite-3/maps/afrika`
- GameMappers SE3 page: `https://gamemappers.com/sniper-elite-3-map/`

## Sniper Elite 4

All current Sniper Elite 4 Recon maps have 2048px-class MapGenie source plates
under `private/recon/maps/sniper-elite-4/`.

| Recon map | Current source image coverage |
| --- | --- |
| San Celini Island | Covered |
| Bitanti Village | Covered |
| Regilino Viaduct | Covered |
| Lorino Dockyard | Covered |
| Abrunza Monastery | Covered |
| Magazzeno Facility | Covered |
| Giovi Fiorini Mansion | Covered |
| Allagra Fortress | Covered |
| Target Fuhrer | Covered |
| Deathstorm Part 1: Inception | Covered |
| Deathstorm Part 2: Infiltration | Covered |
| Deathstorm Part 3: Obliteration | Covered |

Source family references:

- MapGenie-backed SE4 map reference: `https://mapgenie.io/sniper-elite-4/maps/italia`
- GameMappers SE4 page: `https://gamemappers.com/sniper-elite-4-map/`
- Secondary visual reference: `https://sniperelite4maps.de/`

## Sniper Elite 5

All current Sniper Elite 5 Recon maps have 2048x2048 Guides4Gamers tile
composites under `private/recon/maps/sniper-elite-5/`. The local composites are
base-map plates without POI marker icons.

| Recon map | Current source image coverage |
| --- | --- |
| The Atlantic Wall | Covered |
| Occupied Residence | Covered |
| Spy Academy | Covered |
| War Factory | Covered |
| Festung Guernsey | Covered |
| Liberation | Covered |
| Secret Weapons | Covered |
| Rubble and Ruin | Covered |
| Wolf Mountain | Covered |
| Landing Force | Covered |
| Conqueror | Covered |
| Rough Landing | Covered |
| Kraken Awakes | Covered |

Source family references:

- Campaign maps: `https://guides4gamers.com/sniper-elite-5/maps/campaign-maps/`
- Wolf Mountain: `https://guides4gamers.com/sniper-elite-5/maps/wolf-mountain/`
- Landing Force: `https://guides4gamers.com/sniper-elite-5/maps/landing-force/`
- Conqueror: `https://guides4gamers.com/sniper-elite-5/maps/conqueror/`
- Rough Landing: `https://guides4gamers.com/sniper-elite-5/maps/rough-landing/`
- Kraken Awakes: `https://guides4gamers.com/sniper-elite-5/maps/kraken-awakes/`

## Sniper Elite: Resistance

All current Sniper Elite: Resistance Recon maps have 2048x2048 Guides4Gamers
tile composites under `private/recon/maps/sniper-elite-resistance/`. The local
composites are base-map plates without POI marker icons.

| Recon map | Current source image coverage |
| --- | --- |
| Behind Enemy Lines | Covered |
| Dead Drop | Covered |
| Sonderzuge Sabotage | Covered |
| Collision Course | Covered |
| Devil's Cauldron | Covered |
| Assault on Fort Rouge | Covered |
| Lock, Stock and Barrels | Covered |
| End of the Line | Covered |
| All or Nothing | Covered |
| Lights, Camera, Achtung! | Covered |
| Vercors Vendetta | Covered |
| Striking Range | Covered |
| Mud and Thunder | Covered |

Source family references:

- Campaign maps: `https://guides4gamers.com/sniper-elite-resistance/maps/campaign-maps/`
- Lights, Camera, Achtung!: `https://guides4gamers.com/sniper-elite-resistance/maps/lights-camera-achtung/`
- Vercors Vendetta: `https://guides4gamers.com/sniper-elite-resistance/maps/vercors-vendetta/`
- Striking Range: `https://guides4gamers.com/sniper-elite-resistance/maps/striking-range/`
- Mud and Thunder: `https://guides4gamers.com/sniper-elite-resistance/maps/mud-and-thunder/`

## Practical Next Step

There are no clean-source gaps in the current Recon game set. Keep future game
additions gated on full-map-set coverage before adding them to Recon.
