import type { BeybladeType, CharacterRole } from "./beyblades";

export const TYPE_COLORS: Record<BeybladeType, { fg: string; bg: string; border: string }> = {
  Attack: { fg: "#FF4752", bg: "rgba(255,71,82,0.12)", border: "rgba(255,71,82,0.30)" },
  Defense: { fg: "#4F9DFF", bg: "rgba(79,157,255,0.12)", border: "rgba(79,157,255,0.30)" },
  Stamina: { fg: "#4ADE80", bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.30)" },
  Balance: { fg: "#E5B84B", bg: "rgba(229,184,75,0.12)", border: "rgba(229,184,75,0.30)" },
};

export const ROLE_COLORS: Record<CharacterRole, string> = {
  Protagonist: "#FF4752",
  Rival: "#E5B84B",
  Antagonist: "#9D5DFF",
  Supporting: "#4F9DFF",
};

export const TYPE_DEFINITIONS: { type: BeybladeType; tagline: string; description: string }[] = [
  {
    type: "Attack",
    tagline: "Hit fast. Hit hard.",
    description:
      "Aggressive movement, flat or rubber tips. High damage output but burns through stamina quickly.",
  },
  {
    type: "Defense",
    tagline: "Outlast the impact.",
    description:
      "Heavy fusion wheels, wide tips. Absorbs attacks and keeps spinning where attackers fall.",
  },
  {
    type: "Stamina",
    tagline: "Spin them dry.",
    description:
      "Sharp or metal sharp tips with low friction. Wins by outlasting opponents in long matches.",
  },
  {
    type: "Balance",
    tagline: "All four corners.",
    description:
      "A blend of attack, defense, and stamina — adaptable across most matchups.",
  },
];

export const ANATOMY_PARTS = [
  {
    name: "Face Bolt",
    short: "01",
    purpose:
      "The top sticker — the Beyblade's identity. A spirit beast logo bolted onto the energy ring.",
  },
  {
    name: "Energy Ring",
    short: "02",
    purpose:
      "Plastic ring beneath the Face Bolt. Determines spin direction and adds minor balance.",
  },
  {
    name: "Fusion Wheel",
    short: "03",
    purpose:
      "The heavy metal disc — the heart of the Beyblade. Its shape and weight define attack power.",
  },
  {
    name: "Spin Track",
    short: "04",
    purpose:
      "Sets the height of the wheel. Lower = aggressive attacks; taller = defensive coverage.",
  },
  {
    name: "Performance Tip",
    short: "05",
    purpose:
      "The contact point with the stadium. Defines movement: flat, sharp, ball, rubber, and more.",
  },
];
