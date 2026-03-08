import { motion, AnimatePresence } from 'framer-motion';
import { Card, ELEMENT_COLORS, RARITY_COLORS, RARITY_STARS } from '@/data/cards';
import { CARD_IMAGES } from '@/data/cardImages';
import { ElementIcon } from '@/components/ElementIcon';
import { Star, Swords, Shield, X, ArrowLeftRight } from 'lucide-react';

interface CardComparisonProps {
  cards: [Card | null, Card | null];
  isOpen: boolean;
  onClose: () => void;
  onClearSlot: (index: 0 | 1) => void;
}

function StatBar({ label, valueA, valueB, icon, color }: { label: string; valueA: number | null; valueB: number | null; icon: React.ReactNode; color: string }) {
  const max = Math.max(valueA ?? 0, valueB ?? 0, 1);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-display text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <span className="font-display font-bold text-foreground w-8 text-right">{valueA ?? '—'}</span>
          <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: valueA != null ? `${(valueA / max) * 100}%` : '0%' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden flex justify-end">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: valueB != null ? `${(valueB / max) * 100}%` : '0%' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
          <span className="font-display font-bold text-foreground w-8">{valueB ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}

function CompareSlot({ card, onClear, label }: { card: Card | null; onClear: () => void; label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-3">
      {card ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-[200px]"
        >
          <div
            className="aspect-[2.5/3.5] rounded-xl overflow-hidden border-2 relative"
            style={{ borderColor: card.elementColor }}
          >
            <img src={CARD_IMAGES[card.id]} alt={card.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 40%, transparent 50%, rgba(0,0,0,0.7) 85%)' }} />
            <div className="absolute bottom-0 inset-x-0 p-3">
              <h3 className="font-display text-sm font-bold text-foreground drop-shadow-md truncate">{card.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <ElementIcon element={card.element} size={12} style={{ color: ELEMENT_COLORS[card.element] }} />
                <span className="text-xs capitalize text-muted-foreground">{card.element}</span>
                <span className="mx-1 text-muted-foreground">·</span>
                {Array.from({ length: RARITY_STARS[card.rarity] }).map((_, i) => (
                  <Star key={i} size={10} fill={RARITY_COLORS[card.rarity]} color={RARITY_COLORS[card.rarity]} />
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onClear}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground shadow-lg hover:opacity-80 transition-opacity"
          >
            <X size={14} />
          </button>
        </motion.div>
      ) : (
        <div className="w-full max-w-[200px] aspect-[2.5/3.5] rounded-xl border-2 border-dashed border-border flex items-center justify-center">
          <span className="text-sm text-muted-foreground font-body">{label}</span>
        </div>
      )}
    </div>
  );
}

export default function CardComparison({ cards, isOpen, onClose, onClearSlot }: CardComparisonProps) {
  const [cardA, cardB] = cards;
  const totalA = cardA ? cardA.attack + cardA.defense : null;
  const totalB = cardB ? cardB.attack + cardB.defense : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <ArrowLeftRight size={20} className="text-primary" />
                Compare Cards
              </h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-start gap-4 mb-6">
              <CompareSlot card={cardA} onClear={() => onClearSlot(0)} label="Select 1st card" />
              <div className="flex items-center justify-center pt-16">
                <span className="font-display font-bold text-muted-foreground text-lg">VS</span>
              </div>
              <CompareSlot card={cardB} onClear={() => onClearSlot(1)} label="Select 2nd card" />
            </div>

            {(cardA || cardB) && (
              <div className="space-y-4 pt-4 border-t border-border">
                <StatBar
                  label="Attack"
                  valueA={cardA?.attack ?? null}
                  valueB={cardB?.attack ?? null}
                  icon={<Swords size={14} style={{ color: '#F87171' }} />}
                  color="#F87171"
                />
                <StatBar
                  label="Defense"
                  valueA={cardA?.defense ?? null}
                  valueB={cardB?.defense ?? null}
                  icon={<Shield size={14} style={{ color: '#60A5FA' }} />}
                  color="#60A5FA"
                />
                <StatBar
                  label="Total"
                  valueA={totalA}
                  valueB={totalB}
                  icon={<Star size={14} className="text-primary" />}
                  color="hsl(var(--primary))"
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
