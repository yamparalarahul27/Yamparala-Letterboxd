import beyRaw from "./beyblades.json";
import charRaw from "./characters.json";

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

export const BEYBLADES: Beyblade[] = beyRaw.beyblades as Beyblade[];

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
