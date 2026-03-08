import { cards, Card, Rarity, RARITY_COLORS, RARITY_STARS, ELEMENT_COLORS } from '@/data/cards';
import { CARD_IMAGES } from '@/data/cardImages';

export interface PackTier {
  id: string;
  name: string;
  description: string;
  cost: number;
  cardCount: number;
  dropRates: Record<Rarity, number>; // percentages that sum to 100
  gradient: string;
  glow: string;
}

export const PACK_TIERS: PackTier[] = [
  {
    id: 'basic',
    name: 'Basic Pack',
    description: '3 cards with a chance at uncommon',
    cost: 100,
    cardCount: 3,
    dropRates: { common: 70, uncommon: 25, rare: 4, legendary: 1, mythic: 0 },
    gradient: 'linear-gradient(135deg, #6B7280, #9CA3AF)',
    glow: 'rgba(156,163,175,0.3)',
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    description: '5 cards with guaranteed rare+',
    cost: 300,
    cardCount: 5,
    dropRates: { common: 40, uncommon: 30, rare: 20, legendary: 8, mythic: 2 },
    gradient: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    glow: 'rgba(96,165,250,0.4)',
  },
  {
    id: 'legendary',
    name: 'Legendary Pack',
    description: '5 cards with high legendary chance',
    cost: 750,
    cardCount: 5,
    dropRates: { common: 10, uncommon: 20, rare: 35, legendary: 25, mythic: 10 },
    gradient: 'linear-gradient(135deg, #A78BFA, #F59E0B)',
    glow: 'rgba(167,139,250,0.5)',
  },
  {
    id: 'mythic',
    name: 'Mythic Pack',
    description: '5 cards with guaranteed mythic!',
    cost: 1500,
    cardCount: 5,
    dropRates: { common: 5, uncommon: 10, rare: 25, legendary: 35, mythic: 25 },
    gradient: 'linear-gradient(135deg, #FBBF24, #EF4444, #8B5CF6)',
    glow: 'rgba(251,191,36,0.5)',
  },
];

// Card shop prices based on rarity
export const CARD_PRICES: Record<Rarity, number> = {
  common: 50,
  uncommon: 100,
  rare: 200,
  legendary: 500,
  mythic: 1000,
};

export function rollPackCards(tier: PackTier): Card[] {
  const result: Card[] = [];
  const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];

  for (let i = 0; i < tier.cardCount; i++) {
    const roll = Math.random() * 100;
    let cumulative = 0;
    let selectedRarity: Rarity = 'common';

    for (const rarity of rarities) {
      cumulative += tier.dropRates[rarity];
      if (roll < cumulative) {
        selectedRarity = rarity;
        break;
      }
    }

    const cardsOfRarity = cards.filter(c => c.rarity === selectedRarity);
    if (cardsOfRarity.length > 0) {
      const card = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
      result.push(card);
    } else {
      // Fallback to any card
      result.push(cards[Math.floor(Math.random() * cards.length)]);
    }
  }

  return result;
}
