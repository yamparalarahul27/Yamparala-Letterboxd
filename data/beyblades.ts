import raw from "./beyblades.json";

export type BeybladeType = "Attack" | "Defense" | "Stamina" | "Balance";

export interface Beyblade {
  id: string;
  name: string;
  code: string;
  combo: string;
  type: BeybladeType;
  owner: string;
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

export const BEYBLADES: Beyblade[] = raw.beyblades as Beyblade[];
