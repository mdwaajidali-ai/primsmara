import { useMemo } from 'react';
import { Card, RARITY_COLORS, RARITY_STARS } from '@/data/cards';
import { CARD_IMAGES } from '@/data/cardImages';
import { Star, Swords, Shield } from 'lucide-react';
import { useCardTilt } from '@/hooks/useCardTilt';

interface HoloCardProps {
  card: Card;
  onClick?: () => void;
  flipDelay?: number;
  isFlipped?: boolean;
  highlighted?: boolean;
}

const CARD_WIDTH = 250;
const CARD_HEIGHT = CARD_WIDTH * (3.5 / 2.5);

export default function HoloCard({ card, onClick, flipDelay = 0, isFlipped = true, highlighted = false }: HoloCardProps) {
  const { tilt, ref, onMouseMove, onMouseEnter, onMouseLeave } = useCardTilt(15);

  const rarityIdx = { common: 0, uncommon: 1, rare: 2, legendary: 3, mythic: 4 }[card.rarity];
  const foilOpacity = [0.1, 0.15, 0.2, 0.3, 0.4][rarityIdx];
  const blendMode = card.rarity === 'mythic' ? 'hard-light' : 'color-dodge';
  const sparkleCount = card.rarity === 'rare' ? 8 : card.rarity === 'legendary' ? 18 : card.rarity === 'mythic' ? 30 : 0;

  const glowSpread = { common: 15, uncommon: 15, rare: 15, legendary: 20, mythic: 25 }[card.rarity];
  const glowOpacity = { common: 0.3, uncommon: 0.35, rare: 0.4, legendary: 0.5, mythic: 0.6 }[card.rarity];

  const foilAngle = Math.atan2(tilt.mouseY, tilt.mouseX) * (180 / Math.PI);
  const bgPosX = 50 + (tilt.mouseXPercent - 50) * 0.5;
  const bgPosY = 50 + (tilt.mouseYPercent - 50) * 0.5;

  const sparkles = useMemo(() =>
    Array.from({ length: sparkleCount }, (_, i) => ({
      left: Math.random() * 90 + 5,
      top: Math.random() * 90 + 5,
      delay: Math.random() * 1.5,
      size: Math.random() * 2 + 2,
    })),
    [sparkleCount]
  );

  const isMythic = card.rarity === 'mythic';
  const isLegendary = card.rarity === 'legendary';

  return (
    <div
      style={{ perspective: 800, width: CARD_WIDTH, height: CARD_HEIGHT }}
      className="relative cursor-pointer"
    >
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(${tilt.isHovering ? -8 : 0}px)`,
          transition: tilt.isHovering ? 'transform 150ms ease-out' : 'transform 300ms ease-out',
          animation: isFlipped ? `cardFlipIn 800ms ease-in-out ${flipDelay}ms both` : undefined,
        }}
      >
        {/* Mythic aura */}
        {isMythic && (
          <div
            className="absolute -inset-3 rounded-2xl mythic-aura pointer-events-none"
            style={{
              background: `radial-gradient(ellipse, ${card.elementColor}30, transparent 70%)`,
              filter: 'blur(15px)',
            }}
          />
        )}

        {/* Card back (for flip animation) */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, hsl(220 20% 12%), hsl(220 25% 5%))',
            border: '3px solid hsl(220 20% 20%)',
          }}
        >
          <div className="flex items-center justify-center w-full h-full">
            <div className="font-display text-2xl font-bold opacity-20 tracking-widest">HC</div>
          </div>
        </div>

        {/* Card front */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            border: isMythic ? '3px solid transparent' : `3px solid ${card.elementColor}`,
            boxShadow: `0 0 ${glowSpread}px ${card.elementColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')}${tilt.isHovering && (isLegendary || isMythic) ? `, 0 0 30px ${card.elementColor}60` : ''}`,
          }}
        >
          {/* Mythic rainbow border */}
          {isMythic && (
            <div className="absolute -inset-[3px] rounded-xl mythic-shimmer pointer-events-none" style={{ zIndex: -1 }} />
          )}

          {/* Card background */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, hsl(220 20% 12%), hsl(220 25% 5%))' }} />

          {/* Content */}
          <div className="relative z-[5] flex flex-col h-full p-4">
            {/* Top: name + rarity */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-sm font-bold text-foreground truncate mr-2">{card.name}</h3>
              <div className="flex gap-0.5 flex-shrink-0">
                {Array.from({ length: RARITY_STARS[card.rarity] }).map((_, i) => (
                  <Star key={i} size={12} fill={RARITY_COLORS[card.rarity]} color={RARITY_COLORS[card.rarity]} />
                ))}
              </div>
            </div>

            {/* Center: element icon */}
            <div className="flex-1 flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  background: `radial-gradient(circle, ${card.elementColor}18 0%, transparent 70%)`,
                }}
              />
              <div style={{ animation: isLegendary || isMythic ? 'iconPulse 2s ease-in-out infinite' : undefined }}>
                <ElementIcon element={card.element} size={80} className="drop-shadow-lg" style={{ color: card.elementColor } as any} />
              </div>
            </div>

            {/* Bottom: stats */}
            <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-foreground/10">
              <div className="flex items-center gap-1.5">
                <Swords size={16} style={{ color: '#F87171' }} />
                <span className="font-display font-bold text-sm text-foreground">{card.attack}</span>
              </div>
              <div className="w-px h-5 bg-foreground/20" />
              <div className="flex items-center gap-1.5">
                <Shield size={16} style={{ color: '#60A5FA' }} />
                <span className="font-display font-bold text-sm text-foreground">{card.defense}</span>
              </div>
            </div>
          </div>

          {/* Holographic foil overlay */}
          {tilt.isHovering && (
            <div
              className="absolute inset-0 pointer-events-none z-10 rounded-xl"
              style={{
                background: `linear-gradient(${foilAngle}deg, rgba(255,0,0,${foilOpacity}), rgba(255,127,0,${foilOpacity}), rgba(255,255,0,${foilOpacity}), rgba(0,255,0,${foilOpacity}), rgba(0,127,255,${foilOpacity}), rgba(127,0,255,${foilOpacity}), rgba(255,0,127,${foilOpacity}))`,
                backgroundSize: '200% 200%',
                backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                mixBlendMode: blendMode as any,
              }}
            />
          )}

          {/* Light reflection */}
          {tilt.isHovering && (
            <div
              className="absolute inset-0 pointer-events-none z-20 rounded-xl"
              style={{
                background: `radial-gradient(circle at ${tilt.mouseXPercent}% ${tilt.mouseYPercent}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 30%, transparent 60%)`,
              }}
            />
          )}

          {/* Sparkles */}
          {tilt.isHovering && sparkles.map((s, i) => (
            <div
              key={i}
              className="absolute pointer-events-none z-20 rounded-full bg-white"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: s.size,
                height: s.size,
                animation: `sparkle 1.5s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Highlighted glow */}
        {highlighted && (
          <div
            className="absolute -inset-2 rounded-2xl pointer-events-none"
            style={{ animation: 'goldenPulse 1s ease-in-out 3' }}
          />
        )}
      </div>
    </div>
  );
}
