import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, RARITY_COLORS, RARITY_STARS } from '@/data/cards';
import { ElementIcon } from './ElementIcon';
import { CARD_IMAGES } from '@/data/cardImages';
import { Star, Swords, Shield, X } from 'lucide-react';

interface CardDetailProps {
  card: Card | null;
  onClose: () => void;
}

export default function CardDetail({ card, onClose }: CardDetailProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!card) return;
    const interval = setInterval(() => setTime(t => t + 16), 16);
    return () => clearInterval(interval);
  }, [card]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!card) return null;

  const rotateY = Math.sin(time / 2000) * 12;
  const rotateX = Math.cos(time / 3000) * 5;
  const foilAngle = (time / 30) % 360;
  const bgPosX = 50 + Math.sin(time / 2000) * 30;
  const bgPosY = 50 + Math.cos(time / 3000) * 30;
  const lightX = 50 + Math.sin(time / 1500) * 40;
  const lightY = 50 + Math.cos(time / 2500) * 40;

  const rarityIdx = { common: 0, uncommon: 1, rare: 2, legendary: 3, mythic: 4 }[card.rarity];
  const foilOpacity = [0.1, 0.15, 0.2, 0.3, 0.4][rarityIdx];
  const blendMode = card.rarity === 'mythic' ? 'hard-light' : 'color-dodge';
  const sparkleCount = card.rarity === 'rare' ? 8 : card.rarity === 'legendary' ? 18 : card.rarity === 'mythic' ? 30 : 0;

  const CARD_W = 375;
  const CARD_H = CARD_W * (3.5 / 2.5);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <div className="relative z-10 flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
          {/* Card name */}
          <h2 className="font-display text-3xl font-bold text-foreground">{card.name}</h2>

          {/* Element + rarity badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: `${card.elementColor}20`, border: `1px solid ${card.elementColor}40` }}>
              <ElementIcon element={card.element} size={16} style={{ color: card.elementColor }} />
              <span className="font-body text-sm capitalize text-foreground">{card.element}</span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: RARITY_STARS[card.rarity] }).map((_, i) => (
                <Star key={i} size={14} fill={RARITY_COLORS[card.rarity]} color={RARITY_COLORS[card.rarity]} />
              ))}
              <span className="ml-1 text-sm capitalize text-foreground/70">{card.rarity}</span>
            </div>
          </div>

          {/* Card + stats */}
          <div className="flex items-center gap-8">
            {/* ATK */}
            <div className="flex flex-col items-center gap-1">
              <Swords size={32} style={{ color: '#F87171' }} />
              <span className="font-display text-3xl font-bold text-foreground">{card.attack}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Attack</span>
            </div>

            {/* Card */}
            <div style={{ perspective: 800, width: CARD_W, height: CARD_H }}>
              <div
                className="relative w-full h-full rounded-xl overflow-hidden"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                  border: card.rarity === 'mythic' ? undefined : `3px solid ${card.elementColor}`,
                  boxShadow: `0 0 25px ${card.elementColor}60`,
                }}
              >
                {card.rarity === 'mythic' && (
                  <div className="absolute -inset-[3px] rounded-xl mythic-shimmer pointer-events-none" style={{ zIndex: -1 }} />
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, hsl(220 20% 12%), hsl(220 25% 5%))' }} />

                <div className="relative z-[5] flex flex-col h-full p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-lg font-bold text-foreground">{card.name}</h3>
                    <div className="flex gap-0.5">
                      {Array.from({ length: RARITY_STARS[card.rarity] }).map((_, i) => (
                        <Star key={i} size={14} fill={RARITY_COLORS[card.rarity]} color={RARITY_COLORS[card.rarity]} />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <ElementIcon element={card.element} size={120} style={{ color: card.elementColor, filter: 'drop-shadow(0 0 20px currentColor)' }} />
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-foreground/10">
                    <div className="flex items-center gap-2">
                      <Swords size={20} style={{ color: '#F87171' }} />
                      <span className="font-display font-bold text-foreground">{card.attack}</span>
                    </div>
                    <div className="w-px h-6 bg-foreground/20" />
                    <div className="flex items-center gap-2">
                      <Shield size={20} style={{ color: '#60A5FA' }} />
                      <span className="font-display font-bold text-foreground">{card.defense}</span>
                    </div>
                  </div>
                </div>

                {/* Foil */}
                <div
                  className="absolute inset-0 pointer-events-none z-10 rounded-xl"
                  style={{
                    background: `linear-gradient(${foilAngle}deg, rgba(255,0,0,${foilOpacity}), rgba(255,127,0,${foilOpacity}), rgba(255,255,0,${foilOpacity}), rgba(0,255,0,${foilOpacity}), rgba(0,127,255,${foilOpacity}), rgba(127,0,255,${foilOpacity}), rgba(255,0,127,${foilOpacity}))`,
                    backgroundSize: '200% 200%',
                    backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                    mixBlendMode: blendMode as any,
                  }}
                />

                {/* Light */}
                <div
                  className="absolute inset-0 pointer-events-none z-20 rounded-xl"
                  style={{
                    background: `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 30%, transparent 60%)`,
                  }}
                />

                {/* Sparkles */}
                {Array.from({ length: sparkleCount }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute pointer-events-none z-20 rounded-full bg-foreground"
                    style={{
                      left: `${Math.random() * 90 + 5}%`,
                      top: `${Math.random() * 90 + 5}%`,
                      width: Math.random() * 2 + 2,
                      height: Math.random() * 2 + 2,
                      animation: `sparkle 1.5s ease-in-out ${Math.random() * 1.5}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* DEF */}
            <div className="flex flex-col items-center gap-1">
              <Shield size={32} style={{ color: '#60A5FA' }} />
              <span className="font-display text-3xl font-bold text-foreground">{card.defense}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Defense</span>
            </div>
          </div>

          {/* Description */}
          <p className="max-w-md text-center text-muted-foreground mt-2">{card.description}</p>

          {/* Close */}
          <button onClick={onClose} className="mt-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
            <X size={20} className="text-foreground" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
