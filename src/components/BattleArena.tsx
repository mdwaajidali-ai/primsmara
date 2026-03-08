import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, cards as allCards, ELEMENT_COLORS, RARITY_COLORS, RARITY_STARS } from '@/data/cards';
import { CARD_IMAGES } from '@/data/cardImages';
import {
  BattleState, BattleCard, initBattle, drawCard, playCard, performAttack, aiTurn, toBattleCard,
  ELEMENT_ADVANTAGES,
} from '@/data/battle';
import { ElementIcon } from '@/components/ElementIcon';
import { X, Swords, Shield, Heart, Zap, Star, Trophy, Skull, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface BattleArenaProps {
  isOpen: boolean;
  onClose: () => void;
  playerDeck: Card[];
  playerLevel: number;
  onBattleEnd: (won: boolean) => void;
}

function HpBar({ current, max, label, color }: { current: number; max: number; label: string; color: string }) {
  const pct = Math.max(0, (current / max) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-display font-bold text-foreground">{label}</span>
        <span className="text-xs font-display font-bold text-foreground">{current}/{max}</span>
      </div>
      <div className="h-3 rounded-full bg-secondary overflow-hidden border border-border">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function ManaBar({ current, max }: { current: number; max: number }) {
  return (
    <div className="flex items-center gap-1">
      <Zap size={14} className="text-blue-400" />
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full border transition-all duration-300 ${
            i < current ? 'bg-blue-500 border-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.5)]' : 'bg-secondary border-border'
          }`}
        />
      ))}
    </div>
  );
}

function BattleCardSlot({
  card,
  onClick,
  selected,
  isEnemy,
  targetable,
}: {
  card: BattleCard;
  onClick?: () => void;
  selected?: boolean;
  isEnemy?: boolean;
  targetable?: boolean;
}) {
  const hpPct = (card.currentHp / card.maxHp) * 100;
  const hpColor = hpPct > 60 ? '#22C55E' : hpPct > 30 ? '#EAB308' : '#EF4444';

  return (
    <motion.div
      initial={{ scale: 0, rotateY: 180 }}
      animate={{ scale: 1, rotateY: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={onClick ? { scale: 1.05, y: -4 } : undefined}
      onClick={onClick}
      className={`relative w-24 sm:w-28 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
        selected ? 'ring-2 ring-primary shadow-[0_0_15px_rgba(234,179,8,0.4)]' : ''
      } ${targetable ? 'ring-2 ring-destructive shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''}`}
      style={{ borderColor: card.elementColor }}
    >
      <div className="relative h-28 sm:h-32">
        <img src={CARD_IMAGES[card.id]} alt={card.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 40%, transparent 50%, rgba(0,0,0,0.8) 80%)' }} />
        <div className="absolute top-1 left-1 right-1">
          <p className="font-display text-[9px] font-bold text-foreground drop-shadow-md truncate">{card.name}</p>
        </div>
        <div className="absolute top-1 right-1">
          <ElementIcon element={card.element} size={12} style={{ color: card.elementColor }} />
        </div>
        <div className="absolute bottom-1 left-1 right-1">
          {/* HP bar */}
          <div className="h-1.5 rounded-full bg-black/50 overflow-hidden mb-1">
            <motion.div
              className="h-full rounded-full"
              style={{ background: hpColor }}
              animate={{ width: `${hpPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-display font-bold text-foreground drop-shadow-md flex items-center gap-0.5">
              <Swords size={8} />{card.attack}
            </span>
            <span className="text-[8px] font-display font-bold text-foreground drop-shadow-md flex items-center gap-0.5">
              <Shield size={8} />{card.defense}
            </span>
            <span className="text-[8px] font-display font-bold drop-shadow-md flex items-center gap-0.5" style={{ color: hpColor }}>
              <Heart size={8} />{card.currentHp}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HandCard({ card, onClick, disabled }: { card: BattleCard; onClick: () => void; disabled: boolean }) {
  return (
    <motion.div
      whileHover={!disabled ? { y: -16, scale: 1.08 } : undefined}
      onClick={!disabled ? onClick : undefined}
      className={`relative w-20 sm:w-24 rounded-lg overflow-hidden border-2 transition-all ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'
      }`}
      style={{ borderColor: card.elementColor }}
    >
      <div className="relative h-28 sm:h-32">
        <img src={CARD_IMAGES[card.id]} alt={card.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 50%, rgba(0,0,0,0.85) 80%)' }} />
        <div className="absolute top-1 left-1 right-1">
          <p className="font-display text-[8px] font-bold text-foreground drop-shadow-md truncate">{card.name}</p>
        </div>
        <div className="absolute bottom-1 left-1 right-1">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-display font-bold text-foreground drop-shadow-md">{card.attack}⚔</span>
            <span className="text-[8px] font-display font-bold text-blue-400 drop-shadow-md flex items-center gap-0.5">
              <Zap size={8} />{card.manaCost}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function BattleArena({ isOpen, onClose, playerDeck, playerLevel, onBattleEnd }: BattleArenaProps) {
  const [state, setState] = useState<BattleState | null>(null);
  const [animating, setAnimating] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Generate AI deck based on player level
  const generateAIDeck = useCallback((): Card[] => {
    const deckSize = Math.min(10, 6 + Math.floor(playerLevel / 3));
    const sorted = [...allCards].sort((a, b) => (b.attack + b.defense) - (a.attack + a.defense));
    const pool = playerLevel <= 3
      ? sorted.slice(Math.floor(sorted.length * 0.4))
      : playerLevel <= 7
      ? sorted.slice(Math.floor(sorted.length * 0.1))
      : sorted;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, deckSize);
  }, [playerLevel]);

  // Initialize battle
  useEffect(() => {
    if (isOpen && !state) {
      const aiDeck = generateAIDeck();
      setState(initBattle(playerDeck, aiDeck));
    }
    if (!isOpen) setState(null);
  }, [isOpen, playerDeck, generateAIDeck]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [state?.log.length]);

  const handlePlayCard = useCallback((handIndex: number) => {
    if (!state || state.phase !== 'play' || animating) return;
    const card = state.player.hand[handIndex];
    if (!card) return;
    if (state.player.mana < card.manaCost) {
      toast.error(`Not enough mana! Need ${card.manaCost}.`);
      return;
    }
    if (state.player.field.length >= 3) {
      toast.error('Field is full! (max 3 cards)');
      return;
    }

    const { success, player } = playCard(state.player, handIndex);
    if (success) {
      setState(prev => prev ? {
        ...prev,
        player,
        log: [...prev.log, { message: `You play ${card.name}!`, type: 'play', turn: prev.turn }],
      } : prev);
    }
  }, [state, animating]);

  const handleSelectFieldCard = useCallback((idx: number) => {
    if (!state || state.phase !== 'play' || animating) return;
    setState(prev => prev ? {
      ...prev,
      selectedFieldCard: prev.selectedFieldCard === idx ? null : idx,
      selectedEnemyTarget: null,
    } : prev);
  }, [state, animating]);

  const handleSelectTarget = useCallback((idx: number | 'direct') => {
    if (!state || state.selectedFieldCard === null || animating) return;

    setAnimating(true);
    const result = performAttack(state.player, state.enemy, state.selectedFieldCard, idx);
    const logs = result.log.map(l => ({ ...l, turn: state.turn }));

    // Check if enemy is dead from direct attack
    let winner = state.winner;
    if (result.defenderPlayer.hp <= 0) winner = 'player';

    setState(prev => prev ? {
      ...prev,
      player: result.attackerPlayer,
      enemy: result.defenderPlayer,
      log: [...prev.log, ...logs],
      selectedFieldCard: null,
      selectedEnemyTarget: null,
      winner,
      phase: winner ? 'game_over' : prev.phase,
    } : prev);

    setTimeout(() => setAnimating(false), 400);
  }, [state, animating]);

  const handleEndTurn = useCallback(() => {
    if (!state || animating || state.phase === 'game_over') return;

    setAnimating(true);

    // Start next turn: increment turn, increase max mana (cap at 10), refill mana, draw a card
    const nextTurn = state.turn + 1;
    const newMaxMana = Math.min(10, state.player.maxMana + 1);
    const { card: drawnCard, player: afterDraw } = drawCard(state.player);

    const playerAfterRefresh: typeof state.player = {
      ...afterDraw,
      maxMana: newMaxMana,
      mana: newMaxMana,
    };

    const drawLog: typeof state.log = drawnCard
      ? [{ message: `You draw ${drawnCard.name}!`, type: 'info' as const, turn: nextTurn }]
      : state.player.deck.length === 0
      ? [{ message: `Your deck is empty!`, type: 'info' as const, turn: nextTurn }]
      : [];

    // AI turn
    const enemyMaxMana = Math.min(10, state.enemy.maxMana + 1);
    const intermediateState: BattleState = {
      ...state,
      player: playerAfterRefresh,
      enemy: { ...state.enemy, maxMana: enemyMaxMana, mana: enemyMaxMana },
      turn: nextTurn,
      phase: 'enemy_turn',
      log: [...state.log, { message: `--- Turn ${nextTurn} ---`, type: 'info', turn: nextTurn }, ...drawLog],
      selectedFieldCard: null,
      selectedEnemyTarget: null,
    };

    // Delay AI turn for suspense
    setTimeout(() => {
      const afterAI = aiTurn(intermediateState);
      setState(afterAI);
      setAnimating(false);
    }, 1200);

    setState(intermediateState);
  }, [state, animating]);

  const handleBattleClose = useCallback(() => {
    if (state?.winner) {
      onBattleEnd(state.winner === 'player');
    }
    onClose();
  }, [state, onBattleEnd, onClose]);

  if (!isOpen || !state) return null;

  const isGameOver = state.phase === 'game_over';
  const isEnemyTurn = state.phase === 'enemy_turn';
  const canAct = state.phase === 'play' && !animating;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="relative z-10 w-full max-w-6xl max-h-[95vh] mx-2 sm:mx-4 rounded-2xl border border-border overflow-hidden flex flex-col"
        style={{ background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(222 47% 4%) 100%)' }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50">
          <div className="flex items-center gap-3">
            <Swords size={18} className="text-primary" />
            <span className="font-display text-sm font-bold text-foreground">Turn {state.turn}</span>
            {isEnemyTurn && (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-xs font-display text-destructive"
              >
                Enemy turn...
              </motion.span>
            )}
          </div>
          <button onClick={handleBattleClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main battlefield */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Enemy zone */}
            <div className="px-4 py-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <HpBar current={state.enemy.hp} max={state.enemy.maxHp} label="AI Rival" color="#EF4444" />
                </div>
                <ManaBar current={state.enemy.mana} max={state.enemy.maxMana} />
              </div>
              <div className="text-[10px] font-body text-muted-foreground mb-1">
                Hand: {state.enemy.hand.length} | Deck: {state.enemy.deck.length}
              </div>
              {/* Enemy field */}
              <div className="flex items-center justify-center gap-3 min-h-[140px] py-2">
                <AnimatePresence>
                  {state.enemy.field.map((card, i) => (
                    <BattleCardSlot
                      key={`enemy-${card.id}-${i}`}
                      card={card}
                      isEnemy
                      targetable={state.selectedFieldCard !== null && canAct}
                      onClick={state.selectedFieldCard !== null && canAct ? () => handleSelectTarget(i) : undefined}
                    />
                  ))}
                </AnimatePresence>
                {state.enemy.field.length === 0 && (
                  <div
                    className={`w-24 h-32 rounded-lg border-2 border-dashed flex items-center justify-center ${
                      state.selectedFieldCard !== null && canAct
                        ? 'border-destructive/50 cursor-pointer hover:bg-destructive/10'
                        : 'border-border/30'
                    }`}
                    onClick={state.selectedFieldCard !== null && canAct ? () => handleSelectTarget('direct') : undefined}
                  >
                    <span className="text-[10px] font-display text-muted-foreground text-center">
                      {state.selectedFieldCard !== null ? 'Direct\nAttack!' : 'Empty'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="px-4">
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="text-center -mt-2">
                <span className="px-3 py-0.5 bg-card text-[10px] font-display text-muted-foreground rounded-full border border-border">
                  ⚔ BATTLEFIELD ⚔
                </span>
              </div>
            </div>

            {/* Player zone */}
            <div className="px-4 py-2 flex-1 flex flex-col">
              {/* Player field */}
              <div className="flex items-center justify-center gap-3 min-h-[140px] py-2">
                <AnimatePresence>
                  {state.player.field.map((card, i) => (
                    <BattleCardSlot
                      key={`player-${card.id}-${i}`}
                      card={card}
                      selected={state.selectedFieldCard === i}
                      onClick={canAct ? () => handleSelectFieldCard(i) : undefined}
                    />
                  ))}
                </AnimatePresence>
                {state.player.field.length < 3 && (
                  <div className="w-24 h-32 rounded-lg border-2 border-dashed border-border/30 flex items-center justify-center">
                    <span className="text-[10px] font-display text-muted-foreground">Play a card</span>
                  </div>
                )}
              </div>

              {/* Player stats */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <HpBar current={state.player.hp} max={state.player.maxHp} label="You" color="#22C55E" />
                </div>
                <ManaBar current={state.player.mana} max={state.player.maxMana} />
              </div>

              {/* Player hand */}
              <div className="flex items-end justify-center gap-2 py-2 overflow-x-auto">
                {state.player.hand.map((card, i) => (
                  <HandCard
                    key={`hand-${card.id}-${i}`}
                    card={card}
                    onClick={() => handlePlayCard(i)}
                    disabled={!canAct || card.manaCost > state.player.mana || state.player.field.length >= 3}
                  />
                ))}
                {state.player.hand.length === 0 && (
                  <span className="text-xs font-display text-muted-foreground py-8">No cards in hand</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 py-2">
                {state.selectedFieldCard !== null && state.enemy.field.length === 0 && canAct && (
                  <motion.button
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    onClick={() => handleSelectTarget('direct')}
                    className="px-4 py-2 rounded-lg font-display font-bold text-sm text-destructive-foreground flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                  >
                    <Swords size={14} />
                    Direct Attack!
                  </motion.button>
                )}
                <button
                  onClick={handleEndTurn}
                  disabled={!canAct}
                  className={`px-6 py-2.5 rounded-lg font-display font-bold text-sm flex items-center gap-2 transition-all ${
                    canAct
                      ? 'text-primary-foreground hover:brightness-110'
                      : 'bg-secondary text-muted-foreground cursor-not-allowed'
                  }`}
                  style={canAct ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--ring)))' } : undefined}
                >
                  <ChevronRight size={16} />
                  End Turn
                </button>
              </div>
            </div>
          </div>

          {/* Battle log sidebar */}
          <div className="w-48 sm:w-56 border-l border-border flex flex-col bg-secondary/30">
            <div className="px-3 py-2 border-b border-border">
              <span className="font-display text-xs font-bold text-foreground">Battle Log</span>
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              {state.log.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-[10px] font-body leading-tight ${
                    entry.type === 'attack' ? 'text-orange-400' :
                    entry.type === 'advantage' ? 'text-green-400 font-bold' :
                    entry.type === 'defeat' ? 'text-destructive font-bold' :
                    entry.type === 'damage' ? 'text-red-400' :
                    entry.type === 'play' ? 'text-blue-400' :
                    entry.type === 'heal' ? 'text-green-400' :
                    'text-muted-foreground'
                  }`}
                >
                  {entry.message}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Over overlay */}
        <AnimatePresence>
          {isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.5, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-border"
                style={{ background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(222 47% 6%) 100%)' }}
              >
                {state.winner === 'player' ? (
                  <>
                    <Trophy size={48} className="text-primary" />
                    <h2 className="font-display text-3xl font-bold text-primary">Victory!</h2>
                    <p className="font-body text-muted-foreground">You defeated the AI Rival!</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="text-center">
                        <p className="font-display text-xl font-bold text-primary">+50 XP</p>
                        <p className="text-[10px] font-body text-muted-foreground">Experience</p>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-xl font-bold text-primary">+100 Gold</p>
                        <p className="text-[10px] font-body text-muted-foreground">Reward</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Skull size={48} className="text-destructive" />
                    <h2 className="font-display text-3xl font-bold text-destructive">Defeat</h2>
                    <p className="font-body text-muted-foreground">The AI Rival was too strong...</p>
                    <div className="text-center mt-2">
                      <p className="font-display text-xl font-bold text-muted-foreground">+10 XP</p>
                      <p className="text-[10px] font-body text-muted-foreground">Consolation</p>
                    </div>
                  </>
                )}
                <button
                  onClick={handleBattleClose}
                  className="mt-4 px-8 py-3 rounded-lg font-display font-bold text-primary-foreground shine-sweep relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--ring)))' }}
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
