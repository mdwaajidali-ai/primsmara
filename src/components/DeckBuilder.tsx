import { motion, AnimatePresence } from 'framer-motion';
import { Card, RARITY_COLORS, RARITY_STARS } from '@/data/cards';
import { CARD_IMAGES } from '@/data/cardImages';
import { Star, Swords, Shield, X, Trash2 } from 'lucide-react';

interface DeckBuilderProps {
  deck: Card[];
  onRemove: (cardId: number) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
  maxSize: number;
}

export default function DeckBuilder({ deck, onRemove, onClear, isOpen, onToggle, maxSize }: DeckBuilderProps) {
  const totalAtk = deck.reduce((sum, c) => sum + c.attack, 0);
  const totalDef = deck.reduce((sum, c) => sum + c.defense, 0);
  const avgAtk = deck.length ? Math.round(totalAtk / deck.length) : 0;
  const avgDef = deck.length ? Math.round(totalDef / deck.length) : 0;

  return (
    <>
      {/* Floating toggle button */}
      <motion.button
        onClick={onToggle}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full font-display font-bold text-sm shadow-lg border border-border transition-colors"
        style={{
          background: deck.length > 0
            ? 'linear-gradient(135deg, hsl(270 60% 40%), hsl(270 60% 25%))'
            : 'hsl(var(--secondary))',
          color: deck.length > 0 ? 'white' : 'hsl(var(--foreground))',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Swords size={18} />
        Deck {deck.length}/{maxSize}
      </motion.button>

      {/* Slide-out panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={onToggle}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 z-50 flex flex-col border-r border-border"
              style={{ background: 'hsl(var(--card))' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-display text-lg font-bold text-foreground">Deck Builder</h2>
                <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              {/* Stats summary */}
              <div className="p-4 border-b border-border space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-body">Cards</span>
                  <span className="font-display font-bold text-foreground">{deck.length} / {maxSize}</span>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)))' }}
                    initial={false}
                    animate={{ width: `${(deck.length / maxSize) * 100}%` }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Swords size={14} className="text-destructive" />
                      <span className="text-xs text-muted-foreground font-body">Total ATK</span>
                    </div>
                    <span className="font-display text-xl font-bold text-foreground">{totalAtk}</span>
                    <div className="text-xs text-muted-foreground font-body">avg {avgAtk}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Shield size={14} className="text-blue-400" />
                      <span className="text-xs text-muted-foreground font-body">Total DEF</span>
                    </div>
                    <span className="font-display text-xl font-bold text-foreground">{totalDef}</span>
                    <div className="text-xs text-muted-foreground font-body">avg {avgDef}</div>
                  </div>
                </div>
              </div>

              {/* Card list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <AnimatePresence mode="popLayout">
                  {deck.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-40 text-center"
                    >
                      <Swords size={32} className="text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground font-body">Click cards in the gallery to add them to your deck</p>
                    </motion.div>
                  ) : (
                    deck.map((card) => (
                      <motion.div
                        key={card.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                      >
                        <img
                          src={CARD_IMAGES[card.id]}
                          alt={card.name}
                          className="w-10 h-10 object-contain rounded"
                          draggable={false}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-display text-sm font-bold text-foreground truncate">{card.name}</span>
                            <div className="flex gap-0.5 flex-shrink-0">
                              {Array.from({ length: RARITY_STARS[card.rarity] }).map((_, i) => (
                                <Star key={i} size={8} fill={RARITY_COLORS[card.rarity]} color={RARITY_COLORS[card.rarity]} />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                            <span className="flex items-center gap-1">
                              <Swords size={10} className="text-destructive" /> {card.attack}
                            </span>
                            <span className="flex items-center gap-1">
                              <Shield size={10} className="text-blue-400" /> {card.defense}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemove(card.id)}
                          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
                        >
                          <X size={14} className="text-destructive" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              {deck.length > 0 && (
                <div className="p-4 border-t border-border">
                  <button
                    onClick={onClear}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-body font-semibold hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 size={14} />
                    Clear Deck
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
