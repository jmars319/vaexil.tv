import type { RaidGuide, RaidGuideEncounter } from "@/data/destiny-raid-guides";

const lastWishEncounters: RaidGuideEncounter[] = [
  {
    slug: "kalli",
    title: "1. Kalli, the Corrupted",
    summary:
      "A symbol-to-plate opener where six called plates create the safe doors needed to survive Kalli's Obliterate.",
    objective:
      "Read the center symbols, capture the matching plates, kill Ravenous Taken Knights for doors, damage Kalli, and shelter before the wipe.",
    roles: [
      { name: "Plate players", count: "6", job: "Claim one called symbol plate, stand in the safe sector, kill the Knight, and rotate to center." },
      { name: "Symbol caller", count: "1", job: "Read the six center symbols and confirm the matching plates before players commit." },
      { name: "Floater / recovery", count: "Any", job: "Help pressured plates, force Kalli off a plate, or cover a dead player's symbol." },
    ],
    rhythm: [
      "Read the six called center symbols before anyone leaves.",
      "Each player takes a matching perimeter plate and stands only in the sector without a Taken Blight above it.",
      "Kill the spawned Ravenous Taken Knight so one safe door opens below Kalli.",
      "Damage at center, then each Guardian enters a separate open door for Obliterate.",
    ],
    pressure: [
      "Wrong plates waste time and can fail the weekly challenge.",
      "Kalli teleports onto plates and can distract players from the safe sector.",
      "One unkilled Knight means one fewer door during Obliterate.",
    ],
    recoveries: [
      "If a plate player dies, a nearby player finishes that plate and Knight before reviving.",
      "If two players enter one door, one immediately moves to another open door.",
      "For Summoning Ritual, wait for the explicit 'all nine complete' call before damaging.",
    ],
    loadout:
      "Use fast Taken add clear, a Major-killing special for Knights and challenge Ogres, and forgiving close-to-mid-range damage for Kalli's small head.",
  },
  {
    slug: "shuro-chi",
    title: "2. Shuro Chi, the Corrupted",
    summary:
      "A timed ascent through six damage rooms and two image rooms built around crystal triangles, Taken Essence interrupts, and plate images.",
    objective:
      "Break Shuro Chi's shield, remove one health segment per room, solve three image panels per image room, and beat the floor timer.",
    roles: [
      { name: "Crystal players", count: "3", job: "Step on crystal plates, pick up prisms, and shoot the next carrier in the agreed direction." },
      { name: "Essence carriers", count: "2 rotating", job: "Hold Taken Essence for late Obliterate interrupts without stranding the team in Greed lockouts." },
      { name: "Image steppers", count: "4", job: "Stand on the missing cells for each projected image and rotate if a plate rejects a repeat." },
      { name: "Add clear / guards", count: "2-3", job: "Delete Eyes of Riven and Phalanxes while protecting plate and crystal players." },
    ],
    rhythm: [
      "Clear the room until crystal plates activate.",
      "Form the prism triangle in one consistent direction and remove exactly one health segment.",
      "Use Taken Essence super action only if Obliterate must be interrupted.",
      "In image rooms, step on the four missing cells for each of the three projections before climbing.",
    ],
    pressure: [
      "The floor timer keeps moving while players discuss image plates.",
      "Crystal teams fail when they reverse direction mid-run.",
      "Which Witch / Coliseum Champion fails from ranged Arc blast damage anywhere in the encounter.",
    ],
    recoveries: [
      "If an image plate rejects a player, rotate that player to a different missing cell.",
      "If Shuro Chi begins Obliterate early, use Taken Essence super action as late as safely possible.",
      "If challenge is active, reset immediately after visible ranged blast contact.",
    ],
    loadout:
      "Favor high-coverage add clear, quick Major deletion for Eyes and Phalanxes, mobility, self-healing, and burst damage that reliably removes one health segment.",
  },
  {
    slug: "morgeth",
    title: "3. Morgeth, the Spirekeeper",
    summary:
      "A Taken Strength control encounter where players collect safely, rescue trapped holders with Taken Essence, and damage before Morgeth's meter fills.",
    objective:
      "Collect the required Taken Strength without anyone reaching three stacks, rescue Umbral Enervation traps, and finish Morgeth before the wipe meter completes.",
    roles: [
      { name: "Strength runners", count: "4-5", job: "Collect assigned Taken Strength and call stack count after each pickup." },
      { name: "Zero-stack rescuers", count: "1-2", job: "Stay at zero stacks when possible, take Eye of Riven Essence, and free trapped holders." },
      { name: "Damage caller", count: "1", job: "Call the final pickup, damage position, Axion clear, and emergency Essence reset." },
    ],
    rhythm: [
      "Split left and right, then take the first center Strength to begin.",
      "Collect two waves of Strength while calling stack counts.",
      "A zero-stack rescuer uses Eye of Riven Essence grenade action to free trapped players.",
      "Take the final center Strength only when it will not create a third stack, then damage Morgeth.",
    ],
    pressure: [
      "A third Taken Strength stack kills the holder.",
      "Rescuers inherit the trapped player's Strength and can die if they rescue while already stacked.",
      "Forever Fight adds pressure by keeping the four smaller Ogres alive.",
    ],
    recoveries: [
      "If a runner reaches two stacks early, that player stops collecting and the team reassigns later orbs.",
      "If the wipe meter is nearly full, use saved Taken Essence super action on Morgeth.",
      "If an Ogre is low during Forever Fight, stop area damage and reposition instead of finishing it.",
    ],
    loadout:
      "Bring mobile add clear, a fast Eye-of-Riven kill option, sustained boss damage from the agreed perch, and enough control to preserve challenge Ogres.",
  },
  {
    slug: "vault",
    title: "4. The Vault",
    summary:
      "A three-phase symbol-routing puzzle where Stairs, Tree, and Rocks determine Penumbra or Antumbra requirements, then runners cleanse matching plates.",
    objective:
      "Read the three room symbol sets, determine each plate's Penumbra/Antumbra requirement, deliver matching Essence, and stop Mights before center.",
    roles: [
      { name: "Plate readers", count: "3", job: "Read room, center, left, and right symbols for Stairs, Tree, and Rocks." },
      { name: "Essence runners", count: "3", job: "Carry Penumbra or Antumbra through tunnels to the matching plate and cleanse." },
      { name: "Might defenders", count: "3", job: "Kill Mights of Riven before they enter or slam the center chamber." },
    ],
    rhythm: [
      "All three readers publish full symbol sets from their plates.",
      "If another plate's center matches your left, that destination needs Penumbra; if it matches your right, it needs Antumbra.",
      "Repeat the final map aloud, such as 'Stairs P, Tree A, Rocks P.'",
      "Run each Essence to the matching plate and complete three correct cleanses per phase for three phases.",
    ],
    pressure: [
      "A single reversed left/right call sends the runner to the wrong plate.",
      "Mights can fail Keep Out as soon as they enter center.",
      "The previous phase's requirements do not persist into the next phase.",
    ],
    recoveries: [
      "If a runner has no obvious destination, stop in a safe tunnel and repeat the final P/A map.",
      "If a runner takes the wrong tunnel, use the outer loop and call remaining time.",
      "After a wrong cleanse, immediately re-read the next phase instead of carrying the bad map forward.",
    ],
    loadout:
      "Use Major deletion, tunnel mobility, and crowd control. There is no boss DPS phase, so survival and quick Eye/Might handling matter most.",
  },
  {
    slug: "riven",
    title: "5. Riven of a Thousand Voices",
    summary:
      "The intended Riven encounter is an eye-callout and cleanse exchange between Crystal and Tree teams, followed by six top-room eyes, descent damage, and the final mouth/blight finish.",
    objective:
      "Transfer eye calls across rooms, cleanse the lens-called symbols, assign the six top-room eyes, damage sores during descent, and finish inside Riven.",
    roles: [
      { name: "Crystal room team", count: "3", job: "Handle either Riven stagger/eyes or Eye-of-Riven lens cleanse when that side arrives." },
      { name: "Tree room team", count: "3", job: "Mirror Crystal, transfer calls, and preserve fixed room language." },
      { name: "Eye recorders", count: "1 per room", job: "Record the two glowing eyes from each stagger without shooting early." },
      { name: "Essence carrier + lens reader", count: "2 per Eye room", job: "Guide the carrier to the lens-called symbol and cleanse with grenade action." },
      { name: "Top eye shooters", count: "6", job: "Each owns one called eye for the coordinated six-eye shot." },
    ],
    rhythm: [
      "Split Crystal and Tree, descend, and call which room has Riven versus the Eye of Riven.",
      "Stagger Riven by damaging the exposed tentacle or mouth, then record the two glowing eyes for the other room.",
      "The Eye room kills Eye of Riven, uses the lens to guide the carrier to the matching symbol, and cleanses.",
      "At the top, record three pairs of eyes, assign all six shooters, shoot together, then descend for sore damage and the Ascendant finish.",
    ],
    pressure: [
      "Eye numbers are recorded first and shot later; shooting early wipes the team.",
      "Groups using different eye diagrams will produce correct-sounding but incompatible calls.",
      "The wall-hug damage skip bypasses the main mechanic and is patch-sensitive.",
    ],
    recoveries: [
      "If an eye call is uncertain, do not shoot; compare against the shared diagram and delay for a correct shot.",
      "If the lens symbol is unclear, give clock direction and distance from room center before the carrier spends Essence.",
      "If top eyes are not assigned, stop damage calls and assign every number before countdown.",
    ],
    loadout:
      "Use accurate non-splash eye weapons, fast Eye/Ogre clear, ranged burst for mouth or tentacle staggers, and descent damage that can also clear Axion Darts.",
  },
  {
    slug: "queenswalk",
    title: "6. Queenswalk - the Heart of Riven",
    summary:
      "A rotating Heart relay where Fate's Chosen carries the Heart while outside players stay in the aura and absorbed players extend time from inside.",
    objective:
      "Move the Heart from Riven's mouth through the raid, preserve aura safety, time the pulse handoffs, collect Taken Strength inside, and deposit in the Techeun room.",
    roles: [
      { name: "Heart carrier / Fate's Chosen", count: "1 rotating", job: "Pick up the Heart when selected, keep moving, and count the 15-second timer." },
      { name: "Outside support", count: "Remaining outside", job: "Stay in the aura, clear only blockers, and back out before the pulse." },
      { name: "Heart-realm team", count: "Absorbed players", job: "Collect Taken Strength safely, preserve the last orb until late, and kill Mights." },
      { name: "Route caller", count: "1", job: "Call doors, blight crossing, Vault route, Stairs, and final deposit." },
    ],
    rhythm: [
      "The selected Fate's Chosen picks up the Heart and calls 'Heart 15.'",
      "Outside players stay in the aura and move with the carrier, then spread at about five seconds.",
      "At zero, the carrier and anyone caught in the pulse are absorbed.",
      "The next Fate's Chosen, not simply the nearest player, picks up the dropped Heart and continues to Vault, Stairs, and deposit.",
    ],
    pressure: [
      "Drifting outside the aura builds Creeping Darkness quickly.",
      "Taking the final Heart-realm Strength too early wastes the extension for that carrier.",
      "Nearest-player assumptions after a drop can lose the relay because the game selects Fate's Chosen.",
    ],
    recoveries: [
      "If players drift out, stop shooting distant adds and collapse back into the aura.",
      "If too many players are absorbed, continue as long as one outside player remains and inside players divide Strength safely.",
      "If the carrier dies or drops Heart early, wait for the new Fate's Chosen call before pickup.",
    ],
    loadout:
      "Use movement-friendly subclasses, close-range add clear, and survival tools. The best setup deletes Mights or doorway packs without slowing the carrier.",
  },
];

export const lastWishRaidGuide: RaidGuide = {
  slug: "last-wish",
  path: ["last-wish"],
  href: "/guides/destiny2/raids/last-wish",
  title: "Last Wish Raid Guide",
  shortTitle: "Last Wish",
  game: "Destiny 2",
  raid: "Last Wish",
  mode: "Standard",
  description:
    "A Last Wish guide for symbols, Taken Essence, Wall of Wishes, Kalli through Queenswalk, Riven eye calls, Rivensbane, loot, and raid-night assignments.",
  sourcePacket: "Last_Wish_Complete_Guide.docx / PDF, July 2026 verification edition",
  sourceDownload: {
    label: "Download Last Wish source PDF",
    href: "/downloads/guides/destiny2/raids/last-wish/last-wish-complete-guide.pdf",
  },
  tags: ["Destiny 2", "Raid", "Rivensbane", "Wall of Wishes", "Guide"],
  stats: [
    { label: "Encounters", value: "6" },
    { label: "Core language", value: "Symbols + Essence" },
    { label: "Key puzzle", value: "Vault P/A + Riven eyes" },
    { label: "Best use", value: "Teaching and Rivensbane prep" },
  ],
  systems: [
    {
      title: "One symbol vocabulary",
      body:
        "Last Wish uses a 16-symbol vocabulary across Kalli, the Vault, Riven cleanse rooms, and the Wall of Wishes. Use one short callout set for the full run instead of switching to descriptions mid-raid.",
    },
    {
      title: "Taken Essence has two jobs",
      body:
        "Grenade action rescues Morgeth traps and cleanses Vault or Riven symbols. Super action interrupts Shuro Chi or resets Morgeth. Assign backups because Greed and post-use lockouts can prevent the same player from carrying again.",
    },
    {
      title: "Wall of Wishes is utility, not the guide",
      body:
        "The wall grants checkpoints, modifiers, eggs, keys, and Petra's Run, but a single wrong panel invalidates the wish. Use a verified pattern sheet and have a second player audit before submission.",
    },
    {
      title: "Riven intended method stays canonical",
      body:
        "The guide includes the common wall-hug damage skip, but the permanent walkthrough teaches eye transfer, lens cleanses, six-eye resolution, descent damage, Ascendant movement, and the mouth/blight finish.",
    },
    {
      title: "Queenswalk follows Fate's Chosen",
      body:
        "When the carrier is absorbed or dies, the next Fate's Chosen player must take the Heart. Do not assume the closest outside player can safely pick it up.",
    },
    {
      title: "Loot and Deepsight are raid-wide",
      body:
        "Current Last Wish legendary weapons are craftable through the raid-wide pool, while One Thousand Voices remains tied to Ethereal Key final chests. The full source PDF keeps the longer loot, Deepsight, mod, and checklist notes.",
    },
  ],
  encounters: lastWishEncounters,
  quickReferences: [
    {
      title: "Room names",
      items: [
        {
          text: "Vault rooms: Stairs at banner, Tree left, Rocks right.",
          encounters: ["vault"],
        },
        {
          text: "Riven rooms: Crystal and Tree.",
          encounters: ["riven"],
        },
        "Left and right are from rally or entrance while facing the encounter.",
        "Do not replace room names with player names mid-run.",
      ],
    },
    {
      title: "Weekly challenges",
      items: [
        {
          text: "Kalli: Summoning Ritual - complete all nine plates before damage.",
          encounters: ["kalli"],
        },
        {
          text: "Shuro Chi: Which Witch / Coliseum Champion - avoid ranged Arc blast damage.",
          encounters: ["shuro-chi"],
        },
        {
          text: "Morgeth: Forever Fight - keep the four smaller Ogres alive.",
          encounters: ["morgeth"],
        },
        {
          text: "Vault: Keep Out - no Might of Riven may enter center.",
          encounters: ["vault"],
        },
        {
          text: "Riven: Strength of Memory - no Guardian repeats the same eye number.",
          encounters: ["riven"],
        },
      ],
    },
    {
      title: "Critical calls",
      items: [
        {
          text: "Vault: 'Stairs P, Tree A, Rocks P.'",
          encounters: ["vault"],
        },
        {
          text: "Riven: 'Eyes L2, R4' means record only until the receiving room.",
          encounters: ["riven"],
        },
        {
          text: "Riven top: 'Six eyes assigned' before countdown.",
          encounters: ["riven"],
        },
        {
          text: "Queenswalk: 'Heart 15' and '5, back.'",
          encounters: ["queenswalk"],
        },
      ],
    },
  ],
  pullChecklist: [
    "Choose one 16-symbol vocabulary before Kalli.",
    "Confirm challenge, triumph, or Petra's Run conditions before rallying.",
    "Assign room names, Essence backups, and wipe-protection calls.",
    "Confirm Riven eye diagram before the first Riven pull.",
    "Download or open the full source PDF when the team needs loot, wish, or checklist detail.",
  ],
};
