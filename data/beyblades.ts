import raw from "./beyblades.json";

export type BeybladeType = "Attack" | "Defense" | "Stamina" | "Balance";
export type BeybladeSeries = "Metal Fusion" | "Metal Masters" | "Metal Fury";

export interface Beyblade {
  id: string;
  name: string;
  code: string;
  combo: string;
  type: BeybladeType;
  series: BeybladeSeries;
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

export const SERIES: BeybladeSeries[] = ["Metal Fusion", "Metal Masters", "Metal Fury"];
