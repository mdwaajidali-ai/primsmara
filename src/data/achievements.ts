export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  goldReward: number;
  condition: (stats: AchievementStats) => boolean;
  category: 'collection' | 'battle' | 'progression';
}

export interface AchievementStats {
  totalCards: number;
  uniqueCards: number;
  totalWins: number;
  totalLosses: number;
  totalBattles: number;
  level: number;
  gold: number;
  packsOpened: number;
  streak: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Collection
  {
    id: 'first_card',
    name: 'First Steps',
    description: 'Own your first card',
    icon: 'Sparkles',
    goldReward: 50,
    condition: (s) => s.uniqueCards >= 1,
    category: 'collection',
  },
  {
    id: 'collector_5',
    name: 'Budding Collector',
    description: 'Own 5 unique cards',
    icon: 'Layers',
    goldReward: 100,
    condition: (s) => s.uniqueCards >= 5,
    category: 'collection',
  },
  {
    id: 'collector_10',
    name: 'Card Enthusiast',
    description: 'Own 10 unique cards',
    icon: 'Library',
    goldReward: 200,
    condition: (s) => s.uniqueCards >= 10,
    category: 'collection',
  },
  {
    id: 'collector_20',
    name: 'Master Collector',
    description: 'Own all 20 cards',
    icon: 'Crown',
    goldReward: 500,
    condition: (s) => s.uniqueCards >= 20,
    category: 'collection',
  },

  // Battle
  {
    id: 'first_win',
    name: 'Victor',
    description: 'Win your first battle',
    icon: 'Trophy',
    goldReward: 75,
    condition: (s) => s.totalWins >= 1,
    category: 'battle',
  },
  {
    id: 'wins_5',
    name: 'Warrior',
    description: 'Win 5 battles',
    icon: 'Swords',
    goldReward: 150,
    condition: (s) => s.totalWins >= 5,
    category: 'battle',
  },
  {
    id: 'wins_10',
    name: 'Champion',
    description: 'Win 10 battles',
    icon: 'Medal',
    goldReward: 300,
    condition: (s) => s.totalWins >= 10,
    category: 'battle',
  },
  {
    id: 'battle_veteran',
    name: 'Battle Veteran',
    description: 'Fight 20 battles total',
    icon: 'Shield',
    goldReward: 200,
    condition: (s) => s.totalBattles >= 20,
    category: 'battle',
  },

  // Progression
  {
    id: 'level_3',
    name: 'Rising Star',
    description: 'Reach level 3',
    icon: 'Star',
    goldReward: 100,
    condition: (s) => s.level >= 3,
    category: 'progression',
  },
  {
    id: 'level_5',
    name: 'Seasoned Player',
    description: 'Reach level 5',
    icon: 'Flame',
    goldReward: 250,
    condition: (s) => s.level >= 5,
    category: 'progression',
  },
  {
    id: 'level_10',
    name: 'Legend',
    description: 'Reach level 10',
    icon: 'Zap',
    goldReward: 500,
    condition: (s) => s.level >= 10,
    category: 'progression',
  },
  {
    id: 'streak_3',
    name: 'Dedicated',
    description: 'Log in 3 days in a row',
    icon: 'CalendarCheck',
    goldReward: 100,
    condition: (s) => s.streak >= 3,
    category: 'progression',
  },
  {
    id: 'streak_7',
    name: 'Committed',
    description: 'Log in 7 days in a row',
    icon: 'CalendarHeart',
    goldReward: 300,
    condition: (s) => s.streak >= 7,
    category: 'progression',
  },
  {
    id: 'rich',
    name: 'Gold Hoarder',
    description: 'Have 1000 gold at once',
    icon: 'Coins',
    goldReward: 100,
    condition: (s) => s.gold >= 1000,
    category: 'progression',
  },
];
