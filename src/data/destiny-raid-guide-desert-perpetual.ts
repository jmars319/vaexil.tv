import type { RaidGuide, RaidGuideEncounter } from "@/data/destiny-raid-guides";

const sharedDesertSystems = [
  {
    title: "Callouts must not rotate",
    body:
      "Default left and right use the rally banner or entrance perspective. Epoptes side rooms use Top, Left, and Right while looking inward. Agraios portals are numbered 1 through 5 clockwise from rally and keep that numbering for the run.",
  },
  {
    title: "Chronons drive most progress",
    body:
      "Cinnabar is red, Antimony is white, and Cobalt is blue. Chronons feed ring, hourglass, and portal mechanics, so color calls should be short and repeated before anyone interacts.",
  },
  {
    title: "Loadouts are jobs, not prescriptions",
    body:
      "Each section names the job first: precise eye damage, mobile add clear, short burst, long-range sustained DPS, or survival. Named weapons can change with artifact counters, surges, and balance updates.",
  },
];

const desertNormalEncounters: RaidGuideEncounter[] = [
  {
    slug: "epoptes",
    title: "Epoptes, Lord of Quanta",
    summary:
      "Two side-room teams break the Particle Lens and Wave Lens shields, then the full fireteam damages Epoptes while rotating shield-eye pairs during DPS.",
    objective:
      "Cross-call inside eyes, resolve the Top/Left/Right triangle with outside readers, break the main shield eyes, and keep selected DPS pairs on their shield jobs.",
    roles: [
      { name: "Left Inside", count: "1", job: "Follow the left-room light, read the room panel, and shoot confirmed cross-room eye calls." },
      { name: "Right Inside", count: "1", job: "Mirror the inside job on the right side and keep Top, Left, Right calls stable." },
      { name: "Left Outside", count: "1", job: "Read the left outside pillar and resolve opposite-side shots from the room-entrance perspective." },
      { name: "Right Outside", count: "1", job: "Read the right outside pillar and relay clean confirmations." },
      { name: "Add Clear", count: "2", job: "Delete Cyclops, protect readers, and be ready to replace a dead reader." },
    ],
    rhythm: [
      "Inside players take Temporality together, stay in the light, and call the glowing room-panel eye for the opposite Inside player to shoot.",
      "Repeat the cross-calls until the three-eye triangle appears above each room Hydra.",
      "Outside players enter the main boss light, call the missing Top/Left/Right position, and shoot the opposite pillar excluding the opposite Outside call.",
      "Inside players shoot their same-side triangle call, refresh as needed, then break both center eyes together.",
      "During DPS, three selected pairs each destroy six small eyes plus the center eye on their assigned Epoptes shield.",
    ],
    pressure: [
      "Rotated Top/Left/Right callouts cause the fastest confusion.",
      "Cyclops gate plate access and punish readers focused only on eye calls.",
      "Selected DPS pairs can lose time if they wait for the group to stop damaging before leaving.",
    ],
    recoveries: [
      "If a reader dies, pause calls and have the backup take that exact perspective.",
      "If a call is uncertain, hold fire instead of guessing into a failed shield.",
      "If perspective drifts, reset to Top, Left, Right from the side-room doorway.",
    ],
    loadout:
      "Favor precise low-splash eye damage, reliable Cyclops removal, and boss DPS that still lets selected players leave the group.",
  },
  {
    slug: "agraios",
    title: "Agraios, Inherent",
    summary:
      "A five-portal Alignment encounter where the team charges every portal, identifies the Temporality-matched proxy, reflects Variable Elimination, and extends central DPS windows.",
    objective:
      "Charge all five portals, use Plate Player reads to identify the proxy and four recharge portals, build Alignment Charge, then bubble the bait player before the lethal beam fires.",
    roles: [
      { name: "Plate Players", count: "3", job: "Take Cyclical, Absolute, and Constant; identify the active proxy and required blue portals." },
      { name: "Runners", count: "2", job: "Collect Chronons, charge portals, and run the DPS-extension route." },
      { name: "Flex Support", count: "1", job: "Cover add clear, Chronon pickup, portal charging, or laser bait as the phase demands." },
    ],
    rhythm: [
      "Kill the Hydra and five Time's Burden Minotaurs, then carry one Chronon through each inactive portal.",
      "After all five portals are active, kill the Wyverns and stage a second Chronon set.",
      "Plate Players take Temporality. The player matching the sniping proxy stands at that proxy's totem and gains Alignment Charge.",
      "The other two Plate Players call the blue portals; Runners and Flex recharge those four portals while Plate Players stay out of portals.",
      "The Alignment player crosses all five portals, bubbles the bait player at roughly 3-4 seconds, and reflects Variable Elimination into the proxy.",
      "During DPS, the Extender repeats the five-portal route to return Agraios to the center up to two more times.",
    ],
    pressure: [
      "Plate Players cannot safely charge portals after taking Temporality.",
      "Wyverns become the priority target as soon as the portals are active.",
      "Premature detain wastes the reflection and can end the damage setup.",
    ],
    recoveries: [
      "If portal calls break down, stop and re-anchor portal 1 from rally.",
      "If the four blue portals are disputed, hold recharges until both reading Plate Players agree.",
      "If Variable Elimination is active before the reflection is ready, break line of sight behind solid cover.",
    ],
    loadout:
      "Bring mobile add clear, reliable Minotaur and Wyvern damage, movement support for the Alignment route, and long-range or burst-heavy central DPS.",
  },
  {
    slug: "iatros",
    title: "Iatros, Inward-Turned",
    summary:
      "A synchronized hourglass, plate, and box-shooting encounter where three Shooters fire Bottom, Mid, and Top sets on the Diastole rhythm while one Climber builds the DPS route.",
    objective:
      "Fill the hourglass, send the Climber to the plate matching the ring color, fire synchronized box sets on Diastole 4, and clear Neomutation during DPS.",
    roles: [
      { name: "Shooters", count: "3", job: "Hold one pillar each and fire Bottom, Mid, then Top box sets together on Diastole." },
      { name: "Climber", count: "1", job: "Destroy the Vex prism, take the plate matching the ring color, climb the route, and interact with each white construct." },
      { name: "Runners", count: "2", job: "Kill Minotaurs, supply Chronons, maintain the hourglass, and clear Neomutation during DPS." },
    ],
    rhythm: [
      "Runners fill the hourglass by carrying the colors required by the ring.",
      "The Climber destroys the Vex prism below the ring and stands on the plate matching the ring color.",
      "Shooters fire Bottom together on Diastole 4, then the Climber climbs and interacts.",
      "Repeat the same synchronized timing for Mid and Top while the Climber controls the pace.",
      "DPS begins at the Climber's plate; one Runner clears the 12-second Neomutation timer with the required Chronon.",
    ],
    pressure: [
      "Failed box shots drain the hourglass faster than waiting for one clean Diastole 4 cycle.",
      "The Climber can lose the route if they wait too long on a vanishing platform.",
      "Neomutation is recoverable, but only inside its short timer.",
    ],
    recoveries: [
      "If a shot fails, reconfirm Bottom, Mid, or Top before the next Diastole cycle.",
      "If the Climber falls, maintain the hourglass and stop spending box shots until they are ready.",
      "If the hourglass is low, Runners stop damaging and prioritize the correct Chronon.",
    ],
    loadout:
      "Use precise hitscan weapons for boxes, fast Minotaur clear, and short-to-medium boss damage that lets the team survive on the Climber plate.",
  },
  {
    slug: "koregos",
    title: "Koregos, the Worldline",
    summary:
      "The final Normal encounter combines a lower-arena bomb read, a four-station upper puzzle, and mobile head damage with Chronon extensions.",
    objective:
      "Use Constant, Absolute, and Cyclical perspectives to confirm real bombs, solve each upper pylon overlap, and extend damage with matching Chronons.",
    roles: [
      { name: "Constant team", count: "3", job: "Two players stun Koregos by breaking antenna targets while the reader finds the called-color bombs." },
      { name: "Absolute", count: "1", job: "Read the ring color, confirm the real bomb pair, and destroy the two real bombs." },
      { name: "Cyclical pair", count: "2", job: "Identify the fake bomb, collect Chronons, and cross the ring together." },
      { name: "Upper puzzle trio", count: "3", job: "Send one Constant, one Cyclical, and one Absolute through pylons while the other three clear adds." },
    ],
    rhythm: [
      "Everyone takes assigned Temporality, then Constant shooters break four antenna targets to create Temporal Pools.",
      "Absolute calls the ring color; Constant finds the three matching bombs; Cyclical identifies the fake so Absolute can destroy the real pair.",
      "Repeat bomb reads until the hourglass is full, wait for Koregos to teleport, then break the Vex prism under the hourglass.",
      "At each upper pylon, Constant and Cyclical see two nodes each while Absolute takes the shared position; finish all four pylons before damage.",
      "Damage Koregos's head while rotating through safe spaces. The Extender matches the local ring color, grabs that Chronon, and crosses the ring to extend.",
    ],
    pressure: [
      "Digitalization is the wipe timer, so bomb reads need to be deliberate without stalling.",
      "Destroying an unconfirmed bomb can break the chain.",
      "Upper puzzle calls fail when players mix their own perspective with another role's view.",
    ],
    recoveries: [
      "If Temporality expires, restun Koregos for fresh pools before forcing another bomb read.",
      "If the wrong bomb is destroyed, stop the chain and re-establish the ring color before collecting a Chronon.",
      "If an upper overlap node is wrong, reset that pylon and reconfirm Constant, Cyclical, and Absolute views in order.",
      "If Koregos dies, move away from the body immediately to avoid the final detonation.",
    ],
    loadout:
      "Favor precise antenna and bomb damage, visible ping tools for the mechanic trio, Arc resistance for beams, and mobile sustained DPS for head damage.",
  },
];

const desertEpicEncounters: RaidGuideEncounter[] = [
  {
    slug: "epoptes",
    title: "Epic Epoptes, Lord of Quanta",
    summary:
      "Adds a same-side inside/outside eye relay, Detain Seekers, Cyclops inside rooms, and four boss shields during DPS while preserving the Normal triangle logic.",
    objective:
      "Relay two-number inside reads to outside partners, cross-shoot the final opposite-side outside call, clear Detain Seekers, then handle four rotating DPS shields.",
    roles: [
      { name: "Left Inside", count: "1", job: "Read two room-panel eyes and shoot the final number called by Right Outside." },
      { name: "Left Outside", count: "1", job: "Take the left plate with Inside, shoot the entrance panel, and call the one number that re-glows." },
      { name: "Right Inside", count: "1", job: "Read two room-panel eyes and shoot the final number called by Left Outside." },
      { name: "Right Outside", count: "1", job: "Take the right plate with Inside, resolve the entrance panel, and relay the final number." },
      { name: "Add Clear", count: "2", job: "Prioritize Cyclops, Detain Seekers, containment fields, and inherited pressure." },
    ],
    rhythm: [
      "Inside and Outside players take the same-side plate together; Inside enters while Outside follows the rotating light in the arena.",
      "Inside calls two eye numbers. Outside shoots both on the entrance panel and calls the one number that glows again.",
      "Left Inside shoots Right Outside's final call; Right Inside shoots Left Outside's final call; both fire together.",
      "Every completed shield-eye pair spawns Detain Seekers above the Hydra. Clear them before the next pair.",
      "After the relay, resolve the Normal Top/Left/Right triangle, then begin DPS while selected room pairs remove six small eyes plus center.",
    ],
    pressure: [
      "Detain Seekers can trap a player before the next synchronized eye shot.",
      "Cyclops may spawn inside side rooms after the relay begins.",
      "Earlier Agraios or Iatros clears can add Variable Elimination or Diastole on top of the eye relay.",
    ],
    recoveries: [
      "A detained Inside player cannot shoot out, so Add Clear or the Outside partner must destroy the containment field.",
      "If final numbers overlap, repeat by side: Left Outside final, Right Outside final, then shoot.",
      "If inherited pressure interrupts the relay, clear the interruption before continuing the next pair.",
    ],
    loadout:
      "Bring fast precise eye-panel weapons, Detain Seeker cleanup, and DPS that remains effective while selected players leave the group.",
  },
  {
    slug: "agraios",
    title: "Epic Agraios, Inherent",
    summary:
      "Adds a five-color portal sequence, two separate capsule systems, four boss copies, a longer Alignment sequence, and a Temporality-pair final stand.",
    objective:
      "Record the five-color portal sequence, recharge the called portals by recorded color, reflect Variable Elimination, damage the unnamed copy, and finish matching named copies in final stand.",
    roles: [
      { name: "Plate Players", count: "3", job: "Handle Temporality, the Normal blue-portal read, and the named proxy match." },
      { name: "Portal Players", count: "2", job: "Stand near assigned portals, report capsule requirements, and carry Chronons." },
      { name: "Recorder / Flex", count: "1", job: "Record the five-color sequence, support add clear, and cover missing portal calls." },
    ],
    rhythm: [
      "Carry known-color Chronons through the center ring to reveal portal capsule requirements and record the full five-color sequence.",
      "Charge every portal with its assigned color and kill the four Wyverns that spawn.",
      "Use the Normal alignment read: one Plate Player matches the named proxy while the other two identify the four portals to recharge.",
      "Recharge those four portals by recorded color, then check Minotaur-drop capsules during the laser phase for the needed colors.",
      "The Alignment player crosses all five portals, bubbles the bait player at roughly 3-4 seconds, and the team damages the unnamed Agraios copy.",
      "In final stand, place two players on each Temporality plate, kill the three matching headless named copies, then finish the center boss.",
    ],
    pressure: [
      "The portal-requirement capsules and Minotaur-drop capsules are separate systems.",
      "The real DPS target is the unnamed copy, not one of the three Temporality-named copies.",
      "Detain Seekers or Diastole can interrupt portal/capsule reads if those bosses were cleared earlier.",
    ],
    recoveries: [
      "If the sequence is disputed, stop charging and rebuild the five-letter record from confirmed reads.",
      "If a player carries the wrong color, do not force that portal; route the correct color first.",
      "If Diastole suspends the Alignment player, wait rather than trying to detain during the suspension.",
    ],
    loadout:
      "Use long-range DPS, precise capsule and Wyvern damage, movement tools for Alignment, and survivability for inherited Detain or Diastole pressure.",
  },
  {
    slug: "iatros",
    title: "Epic Iatros, Inward-Turned",
    summary:
      "Turns the ring into a repeating three-color sequence and gives Shooter A-B-C moving Temporality assignments that determine tower, while capsule colors determine box height.",
    objective:
      "Record the three-color ring sequence, call capsules in Shooter A-B-C order, map each Shooter's current Temporality to tower, and fire the called heights on Diastole 4.",
    roles: [
      { name: "Shooters A-C", count: "3", job: "Hold distinct Temporalities, follow the current buff to a tower, and shoot the called height." },
      { name: "Climber", count: "1", job: "Stay off plates, destroy the Vex prism, read capsule colors in A-B-C order, and climb." },
      { name: "Runners", count: "2", job: "Use Oculus, perform three paired Chronon reads, preserve the color sequence, and extend DPS." },
    ],
    rhythm: [
      "Runners use limited Temporal Oculus pools to read ring colors and carry three pairs through the ring, recording the repeating three-color order.",
      "Shooters A, B, and C take distinct Temporalities while the Climber stays off the plates.",
      "The Climber destroys the Vex prism, reads three capsule colors in Shooter order, and calls A, B, C.",
      "Each Shooter uses current Temporality for tower and called color for Bottom, Mid, or Top height, then all three fire on Diastole 4.",
      "After every set, Shooters re-read their buffs because Temporality may stay, swap, or rotate before the next tower.",
      "During DPS, Runners continue the recorded Chronon rotation and reset the sequence to the first color afterward.",
    ],
    pressure: [
      "Shooter order, tower assignment, and color height are separate inputs.",
      "Duplicate Shooter buffs usually mean a missed assignment, plate touch, or bug; do not invent a color-swap rule.",
      "Detain Seekers or Variable Elimination can interrupt ring pairs if those bosses were cleared earlier.",
    ],
    recoveries: [
      "If a Shooter loses track, call current Temporality first, then capsule color, then height.",
      "If the ring sequence is lost, reset to the first confirmed color after DPS rather than guessing mid-rotation.",
      "If an inherited mechanic appears, stabilize it before the synchronized Diastole shot.",
    ],
    loadout:
      "Bring precise box-shooting weapons, mobile Minotaur clear, and damage that works between ring runs without relying on close-range positioning during Diastole.",
  },
  {
    slug: "koregos",
    title: "Epic Koregos, Fractured in Time",
    summary:
      "Combines route-dependent room minigames, Banishment, Undoing buffs, Temporal Loci, crystal/core damage, and a six-player final ascent.",
    objective:
      "Use the first-three boss order to resolve Banishment, aligned Chronons, room minigames, Undoing, Temporal Loci, plate DPS, and the final ascent.",
    roles: [
      { name: "Banishment leads", count: "2", job: "Track portal pairs, center Oracle clears, and final ascent cube order." },
      { name: "Room pairs", count: "2 per room", job: "Resolve the active prior-boss room with the matching Temporality and inherited pressure." },
      { name: "Locus / core team", count: "2-3", job: "Expose outer crystals with the matching Temporality and destroy inner cores while unbuffed." },
      { name: "Timeline caller", count: "1", job: "Track route order, aligned colors, Undoing ownership, and Worldline Stability." },
    ],
    rhythm: [
      "Clear the first Banishment pair through the triangular portal together, then use one center Oracle for each remaining selected player.",
      "Read the active portal and capsule color before locking alignment; use Temporal Oculus to record the spinning ring color.",
      "Create four aligned Chronons, fill the loop hourglass, and complete the active prior-boss room with the matching Temporality.",
      "Earn Undoing, expose the matching Temporal Locus with the buffed player, and have unbuffed players destroy the inner core.",
      "After the third room loop, resolve plate DPS by exposing outer crystals and breaking inner cores while updating buff ownership after every transfer.",
      "For final ascent, kill the center Harpy only when all six are ready, then enter in roster order and interact with exactly one cube per player.",
    ],
    pressure: [
      "Wrong capsule alignment can force unnecessary add waves and waste Worldline Stability.",
      "Undoing or Temporality can be overwritten before an earlier Locus is reopened.",
      "Final ascent fails quickly if players enter before the first cube platform is stable.",
    ],
    recoveries: [
      "If Banishment portals are entered separately, call whether the second player can still enter or the team must stabilize outside.",
      "If an Undoing owner is overwritten, pause Locus exposure and reassign the matching room requirement.",
      "If final portal movement breaks, use roster order and have each player interact with exactly one cube.",
    ],
    loadout:
      "Use strong add clear, precise room-mechanic weapons, survivability for Banishment and final ascent, and long-range DPS for plate and final phases.",
  },
];

export const desertPerpetualRaidGuides: RaidGuide[] = [
  {
    slug: "desert-perpetual-normal",
    path: ["desert-perpetual", "normal"],
    href: "/guides/destiny2/raids/desert-perpetual/normal",
    title: "The Desert Perpetual - Normal Raid Guide",
    shortTitle: "Desert Perpetual: Normal",
    game: "Destiny 2",
    raid: "The Desert Perpetual",
    mode: "Normal",
    description:
      "A Desert Perpetual Normal guide for selectable routes, Chronon mechanics, encounter roles, Koregos execution, feats, rewards, and raid-night callouts.",
    sourcePacket: "Desert_Perpetual_Normal_Complete_Guide.docx / PDF, July 2026 verification edition",
    sourceDownload: {
      label: "Download Desert Perpetual Normal source PDF",
      href: "/downloads/guides/destiny2/raids/desert-perpetual-normal/desert-perpetual-normal-complete-guide.pdf",
    },
    tags: ["Destiny 2", "Raid", "Normal", "Guide", "Vaexil"],
    stats: [
      { label: "Encounters", value: "4" },
      { label: "Route", value: "Selectable first three" },
      { label: "Core language", value: "Chronons + Temporality" },
      { label: "Best use", value: "Teaching and raid-night reference" },
    ],
    systems: [
      ...sharedDesertSystems,
      {
        title: "Feats change preparation",
        body:
          "Battalions, Phase Race, Token Limit, Cutthroat Combat, and Challenge Mode are preparation categories. The activity launch screen stays authoritative for the active settings.",
      },
    ],
    encounters: desertNormalEncounters,
    quickReferences: [
      {
        title: "Shared callout anchors",
        items: [
          "Left/right from rally or entrance unless the guide explicitly says otherwise.",
          {
            text: "Epoptes triangle is Top, Left, Right from the side-room entrance looking inward.",
            encounters: ["epoptes"],
          },
          {
            text: "Agraios portals are 1 through 5 clockwise from rally.",
            encounters: ["agraios"],
          },
          {
            text: "Koregos upper-node perspective changes only when called explicitly.",
            encounters: ["koregos"],
          },
        ],
      },
      {
        title: "Mechanic anchors",
        items: [
          {
            text: "Agraios uses portal charge, blue portal reads, Alignment Charge, and Variable Elimination reflection.",
            encounters: ["agraios"],
          },
          {
            text: "Iatros uses fixed Bottom, Mid, Top box sets on Diastole.",
            encounters: ["iatros"],
          },
          {
            text: "Koregos uses Constant, Absolute, and Cyclical perspectives for bomb reads and upper overlap nodes.",
            encounters: ["koregos"],
          },
          "Challenge and feat settings should be confirmed on the launch screen before rallying.",
        ],
      },
    ],
    pullChecklist: [
      "Confirm encounter route and weekly feat or challenge settings.",
      "Assign primary roles and backup roles before rallying.",
      "Repeat perspective rules for the current room.",
      "Call loadout jobs, not just weapon names.",
      "Name the wipe timer or emergency timer players should watch.",
    ],
  },
  {
    slug: "desert-perpetual-epic",
    path: ["desert-perpetual", "epic"],
    href: "/guides/destiny2/raids/desert-perpetual/epic",
    title: "The Desert Perpetual - Epic Raid Guide",
    shortTitle: "Desert Perpetual: Epic",
    game: "Destiny 2",
    raid: "The Desert Perpetual",
    mode: "Epic",
    description:
      "A route-aware Epic guide for inherited mechanics, Detain Seekers, Variable Elimination, Diastole suspension, Koregos room order, anomaly objectives, and assignment discipline.",
    sourcePacket: "Desert_Perpetual_Epic_Complete_Guide.docx / PDF, July 2026 verification edition",
    sourceDownload: {
      label: "Download Desert Perpetual Epic source PDF",
      href: "/downloads/guides/destiny2/raids/desert-perpetual-epic/desert-perpetual-epic-complete-guide.pdf",
    },
    tags: ["Destiny 2", "Raid", "Epic", "Inherited Mechanics", "Guide"],
    stats: [
      { label: "Encounters", value: "4" },
      { label: "Route", value: "Order changes pressure" },
      { label: "Epic rule", value: "Mechanics accumulate" },
      { label: "Best use", value: "Experienced team prep" },
    ],
    systems: [
      ...sharedDesertSystems,
      {
        title: "Mechanics accumulate",
        body:
          "Each defeated first-three boss adds an Epic pressure mechanic to every later encounter. Epoptes adds Detain Seekers, Agraios adds Variable Elimination, and Iatros adds Diastole suspension.",
      },
      {
        title: "Koregos follows your route",
        body:
          "The final encounter revisits earlier rooms in the order the team cleared them. Write the route down before the pull so Undoing buffs and room calls are not memory-based.",
      },
      {
        title: "Capsule alignment uses the same colors",
        body:
          "Epic Agraios, Epic Iatros, and Epic Koregos layer capsule reads onto the same Cinnabar, Antimony, and Cobalt language used by the rest of the raid.",
      },
    ],
    encounters: desertEpicEncounters,
    quickReferences: [
      {
        title: "Common teaching route",
        items: [
          "Epoptes first: adds Detain Seekers early.",
          "Agraios second: adds Variable Elimination after the team has settled.",
          "Iatros third: delays the most disruptive Diastole suspension until Koregos.",
          "This is strategy, not a mechanical requirement.",
        ],
      },
      {
        title: "Inherited mechanics",
        items: [
          {
            text: "Detain Seekers can trap a player until teammates destroy the field.",
            encounters: ["epoptes", "agraios", "iatros", "koregos"],
          },
          {
            text: "Variable Elimination forces cover or a timed reflection while other mechanics continue.",
            encounters: ["agraios", "iatros", "koregos"],
          },
          {
            text: "Diastole suspension can interrupt movement, ability use, and timing calls.",
            encounters: ["iatros", "koregos"],
          },
        ],
      },
    ],
    pullChecklist: [
      "Write down first, second, and third boss order.",
      "Assign inherited-mechanic callers separately from base encounter callers.",
      "Name backup players for Detain, Variable Elimination, and Diastole interruptions.",
      "Confirm whether challenge, feat, or anomaly objectives are active.",
      "Review the Koregos room order before launching the final encounter.",
    ],
  },
];
