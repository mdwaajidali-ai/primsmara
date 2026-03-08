import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, cards, RARITY_COLORS, RARITY_STARS } from '@/data/cards';
import { CARD_IMAGES } from '@/data/cardImages';
import { Star, Swords, Shield, X } from 'lucide-react';
import { playFlipSound, playShimmerSound, playFanfare } from '@/lib/sounds';

interface PackOpeningProps {
  isOpen: boolean;
  onClose: (revealedIds: number[]) => void;
  soundEnabled: boolean;
}

export default function PackOpening({ isOpen, onClose, soundEnabled }: PackOpeningProps) {
  const [phase, setPhase] = useState<'pack' | 'opening' | 'revealing' | 'done'>('pack');
  const [packCards, setPackCards] = useState<Card[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [flipped, setFlipped] = useState<boolean[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setPhase('pack');
      setPackCards([]);
      setRevealedCount(0);
      setFlipped([]);
      return;
    }
    // Select 5 random unique cards
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setPackCards(shuffled.slice(0, 5));
    setFlipped(new Array(5).fill(false));

    // Animate phases
    const t1 = setTimeout(() => setPhase('opening'), 600);
    const t2 = setTimeout(() => {
      setPhase('revealing');
      if (soundEnabled) playShimmerSound();
    }, 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isOpen, soundEnabled]);

  useEffect(() => {
    if (phase !== 'revealing' || packCards.length === 0) return;
    if (revealedCount >= 5) {
      const t = setTimeout(() => setPhase('done'), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setRevealedCount(c => c + 1);
    }, 1200);
    return () => clearTimeout(t);
  }, [phase, revealedCount, packCards]);

  // Auto-flip each card shortly after it arrives
  useEffect(() => {
    if (revealedCount === 0) return;
    const idx = revealedCount - 1;
    const t = setTimeout(() => {
      setFlipped(f => { const n = [...f]; n[idx] = true; return n; });
      if (soundEnabled) {
        playFlipSound();
        const c = packCards[idx];
        if (c && (c.rarity === 'legendary' || c.rarity === 'mythic')) {
          setTimeout(() => playFanfare(), 200);
        }
      }
    }, 500);
    return () => clearTimeout(t);
  }, [revealedCount, soundEnabled, packCards]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose(packCards.map(c => c.id));
  }, [onClose, packCards]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/90" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-foreground/30"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Pack graphic */}
        <AnimatePresence>
          {(phase === 'pack' || phase === 'opening') && (
            <motion.div
              initial={{ y: -300, opacity: 0 }}
              animate={phase === 'opening'
                ? { scale: 1.2, opacity: 0, transition: { duration: 0.4 } }
                : { y: 0, opacity: 1, transition: { type: 'spring', bounce: 0.4, duration: 0.6 } }
              }
              exit={{ scale: 1.3, opacity: 0 }}
              className="w-72 h-96 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #EAB308, #F97316, #EF4444, #8B5CF6)',
                boxShadow: '0 0 40px rgba(234,179,8,0.4)',
              }}
            >
              <span className="font-display text-3xl font-bold text-foreground drop-shadow-lg">HoloCards</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Light burst */}
        <AnimatePresence>
          {phase === 'opening' && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent 70%)' }}
            />
          )}
        </AnimatePresence>

        {/* Revealed cards */}
        {(phase === 'revealing' || phase === 'done') && (
          <div className="flex items-end gap-2">
            {packCards.slice(0, phase === 'done' ? 5 : revealedCount).map((card, i) => {
              const fanAngle = (i - 2) * 5;
              return (
                <motion.div
                  key={card.id}
                  initial={{ y: -600, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, rotate: phase === 'done' ? fanAngle : 0 }}
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                  style={{ perspective: 800 }}
                >
                  <div
                    className="relative overflow-hidden rounded-xl"
                    style={{
                      width: 180,
                      height: 252,
                      transformStyle: 'preserve-3d',
                      transform: flipped[i] ? 'rotateY(0deg)' : 'rotateY(180deg)',
                      transition: 'transform 0.8s ease-in-out',
                    }}
                  >
                    {/* Back */}
                    <div
                      className="absolute inset-0 rounded-xl flex items-center justify-center"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background: 'linear-gradient(135deg, hsl(220 20% 12%), hsl(220 25% 5%))',
                        border: '3px solid hsl(220 20% 20%)',
                      }}
                    >
                      <span className="font-display text-xl font-bold opacity-20">HC</span>
                    </div>

                    {/* Front */}
                    <div
                      className="absolute inset-0 rounded-xl overflow-hidden"
                      style={{
                        backfaceVisibility: 'hidden',
                        border: `3px solid ${card.elementColor}`,
                        boxShadow: `0 0 20px ${card.elementColor}50`,
                      }}
                    >
                      <div className="absolute inset-0">
                        <img src={CARD_IMAGES[card.id]} alt={card.name} className="w-full h-full object-cover" draggable={false} />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.8) 85%)' }} />
                      </div>
                      <div className="relative z-[5] flex flex-col h-full p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-display text-xs font-bold text-foreground truncate mr-1 drop-shadow-md">{card.name}</h3>
                          <div className="flex gap-0.5 flex-shrink-0">
                            {Array.from({ length: RARITY_STARS[card.rarity] }).map((_, j) => (
                              <Star key={j} size={8} fill={RARITY_COLORS[card.rarity]} color={RARITY_COLORS[card.rarity]} />
                            ))}
                          </div>
                        </div>
                        <div className="flex-1" />
                        <div className="flex items-center justify-center gap-3 mt-1 pt-1 border-t border-foreground/10 backdrop-blur-sm bg-black/30 -mx-3 px-3 -mb-3 pb-2 rounded-b-xl">
                          <div className="flex items-center gap-1">
                            <Swords size={12} style={{ color: '#F87171' }} />
                            <span className="font-display font-bold text-xs text-foreground">{card.attack}</span>
                          </div>
                          <div className="w-px h-4 bg-foreground/20" />
                          <div className="flex items-center gap-1">
                            <Shield size={12} style={{ color: '#60A5FA' }} />
                            <span className="font-display font-bold text-xs text-foreground">{card.defense}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Glow burst on flip */}
                  {flipped[i] && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0.8 }}
                      animate={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, ${card.elementColor}80, transparent 70%)`,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 100,
                        height: 100,
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Collect button */}
        {phase === 'done' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 px-8 py-3 font-display font-bold text-primary-foreground rounded-lg relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #EAB308, #F97316)' }}
            onClick={() => onClose(packCards.map(c => c.id))}
          >
            Collect
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
