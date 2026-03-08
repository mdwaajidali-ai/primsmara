export type Element = 'fire' | 'water' | 'earth' | 'air' | 'light' | 'dark';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic';

export interface Card {
  id: number;
  name: string;
  element: Element;
  rarity: Rarity;
  attack: number;
  defense: number;
  description: string;
  elementColor: string;
}

export const ELEMENT_COLORS: Record<Element, string> = {
  fire: '#EF4444',
  water: '#3B82F6',
  earth: '#78716C',
  air: '#06B6D4',
  light: '#EAB308',
  dark: '#7C3AED',
};

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9CA3AF',
  uncommon: '#34D399',
  rare: '#60A5FA',
  legendary: '#A78BFA',
  mythic: '#FBBF24',
};

export const RARITY_STARS: Record<Rarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  legendary: 4,
  mythic: 5,
};

export const RARITY_ORDER: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  legendary: 3,
  mythic: 4,
};

export const cards: Card[] = [
  { id: 1, name: "Ember Sprite", element: "fire", rarity: "common", attack: 25, defense: 15, description: "A tiny flame spirit that dances in campfires. Mostly harmless but surprisingly persistent.", elementColor: "#EF4444" },
  { id: 2, name: "Aqua Wisp", element: "water", rarity: "common", attack: 20, defense: 25, description: "A droplet of living water that floats through morning mist. Refreshingly cool to the touch.", elementColor: "#3B82F6" },
  { id: 3, name: "Stone Pebble", element: "earth", rarity: "common", attack: 15, defense: 35, description: "A small sentient rock. It doesn't do much, but it's incredibly hard to break.", elementColor: "#78716C" },
  { id: 4, name: "Breeze Dancer", element: "air", rarity: "common", attack: 20, defense: 20, description: "A playful wind spirit that loves to scatter leaves and ruffle hair.", elementColor: "#06B6D4" },
  { id: 5, name: "Glimmer Mote", element: "light", rarity: "uncommon", attack: 30, defense: 25, description: "A spark of pure starlight captured in crystalline form.", elementColor: "#EAB308" },
  { id: 6, name: "Shadow Wisp", element: "dark", rarity: "uncommon", attack: 35, defense: 20, description: "A fragment of twilight that whispers secrets from the edges of dreams.", elementColor: "#7C3AED" },
  { id: 7, name: "Blaze Hound", element: "fire", rarity: "uncommon", attack: 45, defense: 30, description: "A loyal fire dog whose bark is literally worse than its bite — it shoots fireballs.", elementColor: "#F97316" },
  { id: 8, name: "Tidal Serpent", element: "water", rarity: "uncommon", attack: 40, defense: 35, description: "A sleek sea snake that rides the ocean currents. Deceptively fast.", elementColor: "#0EA5E9" },
  { id: 9, name: "Iron Golem", element: "earth", rarity: "rare", attack: 35, defense: 65, description: "A walking fortress of stone and metal. Slow but nearly indestructible.", elementColor: "#92400E" },
  { id: 10, name: "Storm Falcon", element: "air", rarity: "rare", attack: 55, defense: 30, description: "A raptor born from thunderclouds. Its wingbeats create sonic booms.", elementColor: "#0891B2" },
  { id: 11, name: "Radiant Knight", element: "light", rarity: "rare", attack: 50, defense: 50, description: "A warrior of pure light who protects the innocent. Balanced in all things.", elementColor: "#F59E0B" },
  { id: 12, name: "Void Stalker", element: "dark", rarity: "rare", attack: 60, defense: 25, description: "A predator from the space between dimensions. Strikes without warning.", elementColor: "#6D28D9" },
  { id: 13, name: "Inferno Dragon", element: "fire", rarity: "rare", attack: 65, defense: 40, description: "A young dragon whose flames can melt steel. Proud and territorial.", elementColor: "#DC2626" },
  { id: 14, name: "Tsunami Lord", element: "water", rarity: "legendary", attack: 70, defense: 60, description: "Commander of all ocean currents. Entire fleets bow before its power.", elementColor: "#1D4ED8" },
  { id: 15, name: "World Titan", element: "earth", rarity: "legendary", attack: 55, defense: 85, description: "An ancient being whose footsteps create mountains and whose sighs carve valleys.", elementColor: "#78350F" },
  { id: 16, name: "Tempest Archon", element: "air", rarity: "legendary", attack: 75, defense: 50, description: "Master of all winds. Can summon hurricanes with a gesture and clear skies with a whisper.", elementColor: "#0E7490" },
  { id: 17, name: "Celestial Phoenix", element: "light", rarity: "legendary", attack: 80, defense: 55, description: "A divine bird that burns with the light of a thousand suns. Reborn from its own radiance.", elementColor: "#D97706" },
  { id: 18, name: "Abyssal Overlord", element: "dark", rarity: "mythic", attack: 90, defense: 70, description: "Ruler of the endless dark. Reality bends and warps in its presence. Few have seen it and returned.", elementColor: "#4C1D95" },
  { id: 19, name: "Primordial Flame", element: "fire", rarity: "mythic", attack: 95, defense: 60, description: "The first fire that ever burned. It existed before the stars and will outlast them all.", elementColor: "#991B1B" },
  { id: 20, name: "Astral Weaver", element: "light", rarity: "mythic", attack: 85, defense: 80, description: "The cosmic spider that spins the threads of fate. Each strand connects a soul to its destiny.", elementColor: "#854D0E" },
];
