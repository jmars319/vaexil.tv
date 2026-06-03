import type { ReconViewerCategory } from "@/components/recon-map-viewer-types";

type LayerGroupDefinition = {
  key: string;
  label: string;
  categoryKeys: string[];
};

export const layerGroups: LayerGroupDefinition[] = [
  {
    key: "navigation",
    label: "Navigation",
    categoryKeys: [
      "entrance",
      "exit",
      "starting_location",
      "exfiltration",
      "passage",
      "transition",
      "shortcut",
    ],
  },
  {
    key: "objectives",
    label: "Objectives",
    categoryKeys: [
      "main_objective",
      "optional_objective",
      "target_spawn",
      "target_path_point",
      "suspect_spawn",
      "suspect_zone",
      "kill_list_target",
      "medal_related",
      "sniper",
      "officer",
      "poi",
    ],
  },
  {
    key: "collectibles",
    label: "Collectibles",
    categoryKeys: [
      "personal_letter",
      "classified_document",
      "hidden_item",
      "stone_eagle",
      "cardboard_pigeon",
      "gnome",
      "propaganda_poster",
    ],
  },
  {
    key: "tools",
    label: "Tools",
    categoryKeys: [
      "workbench",
      "rifle_workbench",
      "smg_workbench",
      "pistol_workbench",
      "weapon",
      "tool",
      "satchel_charge",
      "bolt_cutters",
      "crowbar",
      "fuse_box",
      "key",
      "key_or_code",
      "poison",
      "poison_pickup",
    ],
  },
  {
    key: "systems",
    label: "Systems",
    categoryKeys: [
      "camera_recorder",
      "security_room",
      "safe",
      "supplier",
      "courier",
      "lookout",
      "assassin",
      "alarm",
      "alarm_siren",
      "vehicle",
    ],
  },
  {
    key: "supplies",
    label: "Supplies",
    categoryKeys: [
      "ammunition",
      "medical_item",
      "supply_pouch",
      "explosives",
    ],
  },
];

export const coreLayerKeys = new Set([
  "entrance",
  "exit",
  "starting_location",
  "exfiltration",
  "main_objective",
  "optional_objective",
  "target_spawn",
  "kill_list_target",
  "medal_related",
  "workbench",
  "rifle_workbench",
  "smg_workbench",
  "pistol_workbench",
  "passage",
  "transition",
]);

export const collectibleLayerKeys = new Set([
  "personal_letter",
  "classified_document",
  "hidden_item",
  "stone_eagle",
  "cardboard_pigeon",
  "gnome",
  "propaganda_poster",
]);

export const toolLayerKeys = new Set([
  "weapon",
  "tool",
  "satchel_charge",
  "bolt_cutters",
  "crowbar",
  "fuse_box",
  "key",
  "key_or_code",
  "poison",
  "poison_pickup",
]);

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function formatCoordinate(value: number) {
  return value.toFixed(2);
}

export type ReconLayerSection = {
  key: string;
  label: string;
  categories: ReconViewerCategory[];
};
