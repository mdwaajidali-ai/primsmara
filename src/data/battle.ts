import { Card, Element } from '@/data/cards';

// Element advantage matrix: attacker element -> list of elements it's strong against
export const ELEMENT_ADVANTAGES: Record<Element, Element[]> = {
  fire: ['air', 'earth'],
  water: ['fire'],
  earth: ['water', 'light'],
  air: ['earth'],
  light: ['dark'],
  dark: ['light', 'air'],
};

export const ELEMENT_WEAKNESS: Record<Element, Element[]> = {
  fire: ['water'],
  water: ['earth', 'air'],
  earth: ['fire', 'air'],
  air: ['fire', 'dark'],
  light: ['earth', 'dark'],
  dark: ['light'],
};

export interface BattleCard extends Card {
  currentHp: number;
  maxHp: number;
  manaCost: number;
}

export interface BattlePlayer {
  name: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  hand: BattleCard[];
  deck: BattleCard[];
  field: BattleCard[]; // cards on the battlefield (max 3)
  graveyard: BattleCard[];
}

export interface BattleLog {
  message: string;
  type: 'attack' | 'play' | 'info' | 'advantage' | 'defeat' | 'damage' | 'heal';
  turn: number;
}

export interface BattleState {
  player: BattlePlayer;
  enemy: BattlePlayer;
  turn: number;
  phase: 'draw' | 'play' | 'attack' | 'enemy_turn' | 'game_over';
  winner: 'player' | 'enemy' | null;
  log: BattleLog[];
  selectedFieldCard: number | null; // index in player.field
  selectedEnemyTarget: number | null; // index in enemy.field
}

// Convert a deck Card into a BattleCard
export function toBattleCard(card: Card): BattleCard {
  const hp = card.defense + Math.floor(card.attack * 0.5);
  return {
    ...card,
    currentHp: hp,
    maxHp: hp,
    manaCost: Math.max(1, Math.ceil((card.attack + card.defense) / 40)),
  };
}

// Calculate damage with element advantages
export function calculateDamage(attacker: BattleCard, defender: BattleCard): { damage: number; effective: 'super' | 'weak' | 'normal' } {
  let damage = attacker.attack;
  let effective: 'super' | 'weak' | 'normal' = 'normal';

  if (ELEMENT_ADVANTAGES[attacker.element]?.includes(defender.element)) {
    damage = Math.floor(damage * 1.5);
    effective = 'super';
  } else if (ELEMENT_WEAKNESS[attacker.element]?.includes(defender.element)) {
    damage = Math.floor(damage * 0.6);
    effective = 'weak';
  }

  // Defense reduces damage
  const reduction = Math.floor(defender.defense * 0.3);
  damage = Math.max(5, damage - reduction);

  return { damage, effective };
}

// Initialize battle state from player deck and AI deck
export function initBattle(playerCards: Card[], enemyCards: Card[]): BattleState {
  const playerBattle = playerCards.map(toBattleCard);
  const enemyBattle = enemyCards.map(toBattleCard);

  // Shuffle
  const shuffled = (arr: BattleCard[]) => [...arr].sort(() => Math.random() - 0.5);

  const pDeck = shuffled(playerBattle);
  const eDeck = shuffled(enemyBattle);

  // Draw initial hand (4 cards)
  const pHand = pDeck.splice(0, 4);
  const eHand = eDeck.splice(0, 4);

  return {
    player: {
      name: 'You',
      hp: 100,
      maxHp: 100,
      mana: 3,
      maxMana: 3,
      hand: pHand,
      deck: pDeck,
      field: [],
      graveyard: [],
    },
    enemy: {
      name: 'AI Rival',
      hp: 100,
      maxHp: 100,
      mana: 3,
      maxMana: 3,
      hand: eHand,
      deck: eDeck,
      field: [],
      graveyard: [],
    },
    turn: 1,
    phase: 'play',
    winner: null,
    log: [{ message: 'Battle begins!', type: 'info', turn: 1 }],
    selectedFieldCard: null,
    selectedEnemyTarget: null,
  };
}

// Draw a card from deck to hand
export function drawCard(player: BattlePlayer): { card: BattleCard | null; player: BattlePlayer } {
  if (player.deck.length === 0) return { card: null, player };
  const card = player.deck[0];
  return {
    card,
    player: {
      ...player,
      deck: player.deck.slice(1),
      hand: [...player.hand, card],
    },
  };
}

// Play a card from hand to field
export function playCard(player: BattlePlayer, handIndex: number): { success: boolean; player: BattlePlayer } {
  const card = player.hand[handIndex];
  if (!card) return { success: false, player };
  if (player.mana < card.manaCost) return { success: false, player };
  if (player.field.length >= 3) return { success: false, player };

  return {
    success: true,
    player: {
      ...player,
      mana: player.mana - card.manaCost,
      hand: player.hand.filter((_, i) => i !== handIndex),
      field: [...player.field, { ...card }],
    },
  };
}

// Attack with a field card against an enemy field card or directly
export function performAttack(
  attackerPlayer: BattlePlayer,
  defenderPlayer: BattlePlayer,
  attackerIdx: number,
  targetIdx: number | 'direct'
): {
  attackerPlayer: BattlePlayer;
  defenderPlayer: BattlePlayer;
  log: BattleLog[];
  turn: number;
} {
  const attacker = attackerPlayer.field[attackerIdx];
  const logs: BattleLog[] = [];

  if (targetIdx === 'direct') {
    // Direct attack on player HP
    const damage = Math.max(5, attacker.attack - 10);
    const newHp = Math.max(0, defenderPlayer.hp - damage);
    logs.push({ message: `${attacker.name} attacks directly for ${damage} damage!`, type: 'damage', turn: 0 });
    return {
      attackerPlayer,
      defenderPlayer: { ...defenderPlayer, hp: newHp },
      log: logs,
      turn: 0,
    };
  }

  const defender = defenderPlayer.field[targetIdx];
  const { damage, effective } = calculateDamage(attacker, defender);

  if (effective === 'super') {
    logs.push({ message: `${attacker.element} is super effective against ${defender.element}!`, type: 'advantage', turn: 0 });
  } else if (effective === 'weak') {
    logs.push({ message: `${attacker.element} is weak against ${defender.element}...`, type: 'info', turn: 0 });
  }

  logs.push({ message: `${attacker.name} attacks ${defender.name} for ${damage} damage!`, type: 'attack', turn: 0 });

  const newDefenderHp = defender.currentHp - damage;
  let newDefenderField = [...defenderPlayer.field];
  let newGraveyard = [...defenderPlayer.graveyard];

  if (newDefenderHp <= 0) {
    logs.push({ message: `${defender.name} is destroyed!`, type: 'defeat', turn: 0 });
    newGraveyard.push(defender);
    newDefenderField = newDefenderField.filter((_, i) => i !== targetIdx);
  } else {
    newDefenderField[targetIdx] = { ...defender, currentHp: newDefenderHp };
  }

  // Counter-attack damage to attacker
  const counterDmg = Math.floor(defender.attack * 0.3);
  const newAttackerHp = attacker.currentHp - counterDmg;
  let newAttackerField = [...attackerPlayer.field];
  let attackerGraveyard = [...attackerPlayer.graveyard];

  if (counterDmg > 0) {
    logs.push({ message: `${defender.name} counters for ${counterDmg} damage!`, type: 'attack', turn: 0 });
  }

  if (newAttackerHp <= 0) {
    logs.push({ message: `${attacker.name} is destroyed in the exchange!`, type: 'defeat', turn: 0 });
    attackerGraveyard.push(attacker);
    newAttackerField = newAttackerField.filter((_, i) => i !== attackerIdx);
  } else {
    newAttackerField[attackerIdx] = { ...attacker, currentHp: newAttackerHp };
  }

  return {
    attackerPlayer: { ...attackerPlayer, field: newAttackerField, graveyard: attackerGraveyard },
    defenderPlayer: { ...defenderPlayer, field: newDefenderField, graveyard: newGraveyard },
    log: logs,
    turn: 0,
  };
}

// AI decision making
export function aiTurn(state: BattleState): BattleState {
  let enemy = { ...state.enemy };
  let player = { ...state.player };
  const logs: BattleLog[] = [];

  // 1. Draw a card
  const { card: drawn, player: afterDraw } = drawCard(enemy);
  enemy = afterDraw;
  if (drawn) {
    logs.push({ message: `AI Rival draws a card.`, type: 'info', turn: state.turn });
  }

  // 2. Play cards from hand (prioritize highest attack affordable)
  const playableCards = enemy.hand
    .map((c, i) => ({ card: c, index: i }))
    .filter(({ card }) => card.manaCost <= enemy.mana && enemy.field.length < 3)
    .sort((a, b) => b.card.attack - a.card.attack);

  for (const { index } of playableCards) {
    if (enemy.field.length >= 3) break;
    // Recalculate index after potential removals
    const currentIndex = enemy.hand.findIndex(c => c.id === playableCards.find(p => p.index === index)?.card.id);
    if (currentIndex === -1) continue;
    const card = enemy.hand[currentIndex];
    if (enemy.mana < card.manaCost) continue;

    const { success, player: afterPlay } = playCard(enemy, currentIndex);
    if (success) {
      enemy = afterPlay;
      logs.push({ message: `AI Rival plays ${card.name}!`, type: 'play', turn: state.turn });
    }
  }

  // 3. Attack with field cards
  for (let i = enemy.field.length - 1; i >= 0; i--) {
    if (i >= enemy.field.length) continue;
    const attacker = enemy.field[i];

    if (player.field.length > 0) {
      // Target weakest or element-advantaged card
      let bestTarget = 0;
      let bestScore = -Infinity;
      for (let t = 0; t < player.field.length; t++) {
        const target = player.field[t];
        let score = -target.currentHp;
        if (ELEMENT_ADVANTAGES[attacker.element]?.includes(target.element)) score += 50;
        if (score > bestScore) { bestScore = score; bestTarget = t; }
      }

      const result = performAttack(
        { ...enemy, field: [...enemy.field] },
        { ...player, field: [...player.field] },
        i,
        bestTarget
      );
      result.log.forEach(l => logs.push({ ...l, turn: state.turn }));
      enemy = result.attackerPlayer;
      player = result.defenderPlayer;
    } else {
      // Direct attack
      const damage = Math.max(5, attacker.attack - 10);
      player = { ...player, hp: Math.max(0, player.hp - damage) };
      logs.push({ message: `${attacker.name} attacks you directly for ${damage} damage!`, type: 'damage', turn: state.turn });
    }
  }

  // Check win condition
  let winner = state.winner;
  if (player.hp <= 0) winner = 'enemy';

  return {
    ...state,
    player,
    enemy,
    log: [...state.log, ...logs],
    winner,
    phase: winner ? 'game_over' : 'play',
  };
}

// Generate AI deck from all cards
export function generateAIDeck(playerLevel: number): Card[] {
  const { cards } = require('@/data/cards');
  const allCards = [...cards] as Card[];

  // Scale difficulty with player level
  const deckSize = Math.min(10, 6 + Math.floor(playerLevel / 3));

  // Weighted random selection favoring better cards at higher levels
  const sorted = allCards.sort((a, b) => (b.attack + b.defense) - (a.attack + a.defense));
  const pool = playerLevel <= 3
    ? sorted.slice(Math.floor(sorted.length * 0.4)) // weaker cards for low level
    : playerLevel <= 7
    ? sorted.slice(Math.floor(sorted.length * 0.1))
    : sorted; // all cards at high level

  const deck: Card[] = [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (let i = 0; i < deckSize && i < shuffled.length; i++) {
    deck.push(shuffled[i]);
  }
  return deck;
}
