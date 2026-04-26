import metalFusionRaw from "./beyblades/metal-fusion.json";
import metalMastersRaw from "./beyblades/metal-masters.json";
import metalFuryRaw from "./beyblades/metal-fury.json";
import charRaw from "./characters.json";
import tipsRaw from "./parts/tips.json";
import wheelsRaw from "./parts/wheels.json";
import ringsRaw from "./parts/rings.json";
import tracksRaw from "./parts/tracks.json";

// ── Beyblade ─────────────────────────────────────────────────────────────
export type BeybladeType = "Attack" | "Defense" | "Stamina" | "Balance";
export type BeybladeSeries = "Metal Fusion" | "Metal Masters" | "Metal Fury";

export interface Beyblade {
  id: string;
  name: string;
  code: string;
  combo: string;
  type: BeybladeType;
  series: BeybladeSeries;
  owner: string; // free-text fallback (from sync); use ownerId + getCharacter for joins
  ownerId: string | null;
  energyRing: string;
  fusionWheel: string;
  spinTrack: string;
  performanceTip: string;
  stats: { attack: number; defense: number; stamina: number };
  weight: string;
  debut: string;
  description: string;
  image: string | null;
  source: string | null;
}

export const BEYBLADES: Beyblade[] = [
  ...(metalFusionRaw.beyblades as Beyblade[]),
  ...(metalMastersRaw.beyblades as Beyblade[]),
  ...(metalFuryRaw.beyblades as Beyblade[]),
];

export const SERIES: BeybladeSeries[] = ["Metal Fusion", "Metal Masters", "Metal Fury"];

// ── Character ────────────────────────────────────────────────────────────
export type CharacterRole = "Protagonist" | "Rival" | "Antagonist" | "Supporting";

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  team: string | null;
  bio: string;
  image: string | null;
  source: string | null;
}

export const CHARACTERS: Character[] = charRaw.characters as Character[];

const charById = new Map(CHARACTERS.map((c) => [c.id, c]));
export function getCharacter(id: string | null | undefined): Character | undefined {
  if (!id) return undefined;
  return charById.get(id);
}

export function getBeysOwnedBy(characterId: string): Beyblade[] {
  return BEYBLADES.filter((b) => b.ownerId === characterId);
}

// ── Part ─────────────────────────────────────────────────────────────────
export type PartType = "tip" | "wheel" | "ring" | "track";

export interface Part {
  id: string;
  type: PartType;
  name: string;
  fullName?: string;
  info: string;
  image: string | null;
  source: string | null;
}

export const TIPS: Part[] = tipsRaw.tips as Part[];
export const WHEELS: Part[] = wheelsRaw.wheels as Part[];
export const RINGS: Part[] = ringsRaw.rings as Part[];
export const TRACKS: Part[] = tracksRaw.tracks as Part[];
export const PARTS: Part[] = [...TIPS, ...WHEELS, ...RINGS, ...TRACKS];

const PART_TYPE_LABEL: Record<PartType, string> = {
  tip: "Performance Tip",
  wheel: "Fusion Wheel",
  ring: "Energy Ring",
  track: "Spin Track",
};

export function partTypeLabel(t: PartType): string {
  return PART_TYPE_LABEL[t];
}

const partsByType: Record<PartType, Part[]> = {
  tip: TIPS,
  wheel: WHEELS,
  ring: RINGS,
  track: TRACKS,
};

export function getPartsByType(t: PartType): Part[] {
  return partsByType[t];
}

export function getPart(type: PartType, id: string): Part | undefined {
  return partsByType[type].find((p) => p.id === id);
}

// Resolve a Bey's part display string (e.g. "Storm", "Pegasus I", "Horn 145")
// to a Part record. Tries name, fullName, then id (lowercase).
export function findPart(type: PartType, displayName: string): Part | undefined {
  if (!displayName) return undefined;
  const list = partsByType[type];
  const lc = displayName.toLowerCase();
  return (
    list.find((p) => p.name === displayName) ||
    list.find((p) => p.fullName === displayName) ||
    list.find((p) => p.id.toLowerCase() === lc) ||
    list.find((p) => p.name.toLowerCase() === lc)
  );
}

// Beyblades that use a specific part (matched by display string).
export function getBeysUsingPart(type: PartType, partName: string): Beyblade[] {
  const key: keyof Beyblade =
    type === "tip"
      ? "performanceTip"
      : type === "wheel"
        ? "fusionWheel"
        : type === "ring"
          ? "energyRing"
          : "spinTrack";
  return BEYBLADES.filter((b) => b[key] === partName);
}
