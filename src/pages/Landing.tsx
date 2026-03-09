import { useRef, useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Flame, Zap, Star, ChevronDown, Package, Trophy, Users, Crosshair, Skull, Crown, Target, Volume2, VolumeX, Loader2, Box } from 'lucide-react';
import { cards, RARITY_COLORS } from '@/data/cards';
import { CARD_IMAGES } from '@/data/cardImages';

import heroBg from '@/assets/landing/hero-bg.jpg';
import arenaBg from '@/assets/landing/arena-bg.jpg';
import lineupBg from '@/assets/landing/characters-lineup.jpg';

// Lazy load 3D component for performance
const Card3DShowcase = lazy(() => import('@/components/Card3DShowcase'));

const FEATURED_CARDS = [18, 19, 20, 17, 13, 14, 15, 16];
const ALL_CARDS_SORTED = [...cards].sort((a, b) => {
  const order = { mythic: 0, legendary: 1, rare: 2, uncommon: 3, common: 4 };
  return order[a.rarity] - order[b.rarity];
});

/* ====== EMBER PARTICLES ====== */
function EmberParticles({ count = 25, color = 'hsl(var(--primary))' }: { count?: number; color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full ember"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: color,
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 20}%`,
            '--drift': `${(Math.random() - 0.5) * 80}px`,
            '--duration': `${2 + Math.random() * 3}s`,
            '--delay': `${Math.random() * 4}s`,
            filter: 'blur(0.5px)',
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ====== FLOATING WAR PARTICLES ====== */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            background: i % 3 === 0 ? 'hsl(var(--primary) / 0.4)' : i % 3 === 1 ? 'hsl(var(--destructive) / 0.3)' : 'hsl(var(--accent) / 0.3)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 5}s ease-in-out ${Math.random() * 3}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ====== ANIMATED COUNTER ====== */
function AnimatedCounter({ value, suffix = '', duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = value / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ====== STICKY NAV ====== */
function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <AnimatePresence>
      {scrolled && (
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-border/50"
          style={{ background: 'hsl(var(--background) / 0.85)' }}
        >
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Swords size={22} className="text-primary" />
              <span className="font-display text-lg font-bold text-foreground">HOLOCARDS</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {['Warriors', 'Arena', 'Features'].map(item => (
                <button
                  key={item}
                  onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                  className="font-display text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2 font-display text-xs font-bold text-primary-foreground rounded-lg relative overflow-hidden shine-sweep"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--destructive)))' }}
            >
              PLAY NOW
            </button>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

/* ====== CHARACTER SPOTLIGHT (Enhanced) ====== */
function CharacterSpotlight({ card, index }: { card: typeof cards[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -120 : 120 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex items-center gap-8 lg:gap-16 ${isEven ? 'flex-row' : 'flex-row-reverse'} max-w-6xl mx-auto`}
    >
      {/* Character image */}
      <motion.div
        className="relative w-64 h-80 lg:w-80 lg:h-[420px] flex-shrink-0 rounded-2xl overflow-hidden group"
        whileHover={{ scale: 1.03, rotateY: isEven ? 5 : -5 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ perspective: 800 }}
      >
        <img src={CARD_IMAGES[card.id]} alt={card.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {/* Scan line effect */}
        <div className="absolute inset-0 scan-lines opacity-30" />
        {/* Horizontal scanner */}
        <div className="absolute left-0 right-0 h-px h-scan-line opacity-40" style={{ background: card.elementColor }} />
        {/* Glow border */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: `inset 0 0 30px ${card.elementColor}40, 0 0 40px ${card.elementColor}30` }}
        />
        {/* Rarity badge */}
        <div className="absolute top-4 right-4 flex gap-0.5">
          {Array.from({ length: { common: 1, uncommon: 2, rare: 3, legendary: 4, mythic: 5 }[card.rarity] }).map((_, i) => (
            <Star key={i} size={14} fill={RARITY_COLORS[card.rarity]} color={RARITY_COLORS[card.rarity]} />
          ))}
        </div>
        {/* Stats overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Swords size={16} className="text-destructive" />
            <span className="font-display text-sm font-bold text-foreground">{card.attack}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield size={16} className="text-blue-400" />
            <span className="font-display text-sm font-bold text-foreground">{card.defense}</span>
          </div>
        </div>
      </motion.div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span className="font-display text-xs font-bold uppercase tracking-[0.3em] mb-2 block" style={{ color: card.elementColor }}>
            {card.element} • {card.rarity}
          </span>
          <h3 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3">{card.name}</h3>
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">{card.description}</p>

          {/* Power bars */}
          <div className="space-y-3 mb-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-display text-xs text-muted-foreground uppercase tracking-wider">Attack Power</span>
                <span className="font-display text-xs font-bold text-destructive">{card.attack}/20</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${(card.attack / 20) * 100}%` } : {}}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, hsl(var(--destructive)), #F97316)' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-display text-xs text-muted-foreground uppercase tracking-wider">Defense Power</span>
                <span className="font-display text-xs font-bold text-blue-400">{card.defense}/20</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${(card.defense / 20) * 100}%` } : {}}
                  transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #3B82F6, #06B6D4)' }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-destructive">{card.attack}</div>
              <div className="font-body text-xs text-muted-foreground uppercase tracking-wider">ATK</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-blue-400">{card.defense}</div>
              <div className="font-body text-xs text-muted-foreground uppercase tracking-wider">DEF</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-bold" style={{ color: card.elementColor }}>{card.element.toUpperCase()}</div>
              <div className="font-body text-xs text-muted-foreground uppercase tracking-wider">Element</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ====== CARD ROSTER (Enhanced) ====== */
function CardRoster() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-3">
      {ALL_CARDS_SORTED.map((card, i) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
          animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
          transition={{ duration: 0.5, delay: i * 0.04, ease: 'backOut' }}
          className="relative aspect-[2.5/3.5] rounded-lg overflow-hidden group cursor-pointer"
          whileHover={{ scale: 1.2, zIndex: 10, y: -15 }}
        >
          <img src={CARD_IMAGES[card.id]} alt={card.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: `inset 0 0 20px ${card.elementColor}50` }}
          />
          <div className="absolute bottom-1 left-1 right-1">
            <p className="font-display text-[9px] font-bold text-foreground truncate text-center drop-shadow-md">{card.name}</p>
          </div>
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{ border: `2px solid ${RARITY_COLORS[card.rarity]}40` }}
          />
          {/* Scan lines */}
          <div className="absolute inset-0 scan-lines opacity-0 group-hover:opacity-30 transition-opacity" />
        </motion.div>
      ))}
    </div>
  );
}

/* ====== FEATURE CARD (Enhanced) ====== */
function FeatureCard({ icon: Icon, title, desc, delay, color }: { icon: any; title: string; desc: string; delay: number; color: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative rounded-2xl border border-border p-8 overflow-hidden group breathing-glow"
      style={{ background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
      {/* Scan line on hover */}
      <div className="absolute inset-0 scan-lines opacity-0 group-hover:opacity-20 transition-opacity" />
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 relative"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon size={28} style={{ color }} />
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-xl pulse-ring" style={{ border: `2px solid ${color}40` }} />
      </div>
      <h3 className="font-display text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="font-body text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ====== BATTLE STATS MARQUEE ====== */
function BattleMarquee() {
  const items = [
    '⚔️ WORLD_TITAN destroyed SHADOW_WISP',
    '🔥 INFERNO_DRAGON used HELLFIRE BLAST',
    '💀 VOID_STALKER eliminated BREEZE_DANCER',
    '🛡️ IRON_GOLEM blocked 18 damage',
    '⚡ TEMPEST_ARCHON unleashed STORM SURGE',
    '🏆 Player_XK47 won 5 battles in a row',
    '✨ CELESTIAL_PHOENIX revived from ashes',
    '💎 Mythic card pulled: PRIMORDIAL_FLAME',
    '🌊 TSUNAMI_LORD swept the battlefield',
    '👑 New champion crowned in Arena',
  ];

  return (
    <div className="relative overflow-hidden py-4 border-y border-border/30" style={{ background: 'hsl(var(--background) / 0.9)' }}>
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
      <div className="flex whitespace-nowrap marquee-scroll">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="font-display text-xs text-muted-foreground mx-8 uppercase tracking-wider">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ====== ELEMENT COMPARISON ====== */
function ElementShowdown() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const elements = [
    { name: 'FIRE', icon: Flame, color: 'hsl(var(--holo-fire))', desc: 'Burns with relentless fury. Melts defenses.', power: 85 },
    { name: 'WATER', icon: Shield, color: 'hsl(var(--holo-water))', desc: 'Flows and adapts. Extinguishes all flames.', power: 80 },
    { name: 'EARTH', icon: Target, color: 'hsl(var(--holo-earth))', desc: 'Unbreakable defense. Immovable force.', power: 90 },
    { name: 'AIR', icon: Zap, color: 'hsl(var(--holo-air))', desc: 'Lightning speed. Strikes before you blink.', power: 75 },
    { name: 'LIGHT', icon: Crown, color: 'hsl(var(--holo-light))', desc: 'Divine power. Purifies all darkness.', power: 95 },
    { name: 'DARK', icon: Skull, color: 'hsl(var(--holo-dark))', desc: 'Corrupts and devours. Feeds on fear.', power: 88 },
  ];

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {elements.map((el, i) => (
        <motion.div
          key={el.name}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative p-6 rounded-2xl border border-border overflow-hidden group cursor-crosshair"
          style={{ background: 'hsl(var(--card))' }}
        >
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
            <div className="absolute -top-8 -right-8 w-16 h-16 rotate-45" style={{ background: `${el.color}20` }} />
          </div>
          <el.icon size={32} style={{ color: el.color }} className="mb-3" />
          <h4 className="font-display text-lg font-bold text-foreground mb-1">{el.name}</h4>
          <p className="font-body text-sm text-muted-foreground mb-4">{el.desc}</p>
          {/* Power bar */}
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: `${el.power}%` } : {}}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: el.color }}
            />
          </div>
          <span className="font-display text-xs text-muted-foreground mt-1 block text-right">{el.power}/100</span>
          {/* Glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ boxShadow: `inset 0 0 30px ${el.color}15, 0 0 30px ${el.color}10` }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ====== MAIN LANDING ====== */
export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const spotlightCards = FEATURED_CARDS.map(id => cards.find(c => c.id === id)!).filter(Boolean);

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      <StickyNav />

      {/* ===================== HERO ===================== */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        </motion.div>

        {/* Scan lines over hero */}
        <div className="absolute inset-0 scan-lines opacity-20 pointer-events-none z-[1]" />

        {/* War flash */}
        <div className="absolute inset-0 bg-primary/10 war-flash pointer-events-none z-[1]" />

        <FloatingParticles />
        <EmberParticles count={15} color="hsl(var(--destructive) / 0.6)" />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 border border-destructive/30 mb-8">
              <Crosshair size={14} className="text-destructive animate-pulse" />
              <span className="font-display text-xs font-bold text-destructive tracking-wider uppercase">
                Season 1 — War Has Begun
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="font-display text-6xl sm:text-7xl lg:text-9xl font-black text-foreground mb-6 leading-[0.9] glitch-text"
            data-text="HOLOCARDS"
            style={{ textShadow: '0 0 60px rgba(234,179,8,0.4), 0 0 120px rgba(234,179,8,0.15)' }}
          >
            HOLO<span className="text-primary">CARDS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="font-body text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Collect legendary warriors. Build unstoppable decks.
            <span className="text-destructive font-bold"> Dominate the arena.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <button
              onClick={() => navigate('/auth')}
              className="px-10 py-4 font-display font-bold text-lg text-primary-foreground rounded-xl relative overflow-hidden shine-sweep transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(234,179,8,0.4)]"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--destructive)))' }}
            >
              ⚔️ ENTER THE ARENA
            </button>
            <button
              onClick={() => document.getElementById('warriors')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 font-display font-bold text-lg text-foreground rounded-xl border-2 border-border hover:border-primary/50 transition-all hover:scale-105 bg-background/50 backdrop-blur-sm"
            >
              VIEW ROSTER
            </button>
          </motion.div>

          {/* War stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex items-center justify-center gap-8 sm:gap-12 mt-16"
          >
            {[
              { label: 'Warriors', value: 20, suffix: '+' },
              { label: 'Elements', value: 6, suffix: '' },
              { label: 'Rarities', value: 5, suffix: '' },
              { label: 'Active Players', value: 10, suffix: 'K+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl sm:text-3xl font-bold text-primary">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="font-body text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="font-display text-[10px] text-primary/60 uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown size={28} className="text-primary/60" />
        </motion.div>
      </section>

      {/* ===================== BATTLE MARQUEE ===================== */}
      <BattleMarquee />

      {/* ===================== 3D CARD SHOWCASE ===================== */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <FloatingParticles />
        <EmberParticles count={15} color="hsl(var(--accent) / 0.3)" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <span className="font-display text-xs font-bold text-accent tracking-[0.3em] uppercase mb-4 block">
              <Box className="inline-block mr-2 mb-1" size={14} /> Experience The Future
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-foreground mb-4">
              INTERACTIVE <span className="text-primary">3D</span> SHOWCASE
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Get up close with the most powerful warriors. Drag to rotate, hover to see them come alive in stunning 3D detail.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <Suspense
              fallback={
                <div className="w-full h-[600px] rounded-2xl border border-border/30 flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)' }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <p className="font-display text-sm text-muted-foreground uppercase tracking-wider">
                      Loading 3D Experience...
                    </p>
                  </div>
                </div>
              }
            >
              <Card3DShowcase />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* ===================== CHARACTER LINEUP ===================== */}
      <section id="warriors" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src={lineupBg} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="font-display text-xs font-bold text-destructive tracking-[0.3em] uppercase mb-4 block">
              ☠️ Choose Your Champion
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-foreground">
              LEGENDARY <span className="text-primary">WARRIORS</span>
            </h2>
          </motion.div>

          {/* Horizontal scrolling featured cards */}
          <div className="relative mb-20">
            <div
              className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory px-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {spotlightCards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{
                    y: -20,
                    rotateY: 8,
                    scale: 1.05,
                    transition: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                  className="relative flex-shrink-0 w-56 h-80 rounded-2xl overflow-hidden cursor-pointer snap-center group"
                  style={{
                    perspective: 1000,
                    boxShadow: `0 0 30px ${card.elementColor}20`,
                    border: `2px solid ${card.elementColor}40`,
                  }}
                >
                  <img src={CARD_IMAGES[card.id]} alt={card.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-0 scan-lines opacity-20" />

                  {card.rarity === 'mythic' && (
                    <div className="absolute inset-0 mythic-shimmer opacity-20 mix-blend-overlay" />
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({ length: { common: 1, uncommon: 2, rare: 3, legendary: 4, mythic: 5 }[card.rarity] }).map((_, i) => (
                        <Star key={i} size={10} fill={RARITY_COLORS[card.rarity]} color={RARITY_COLORS[card.rarity]} />
                      ))}
                    </div>
                    <h4 className="font-display text-sm font-bold text-foreground">{card.name}</h4>
                    <p className="font-body text-xs text-muted-foreground capitalize">{card.element} • {card.rarity}</p>
                  </div>

                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 40px ${card.elementColor}30, 0 0 60px ${card.elementColor}20` }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== ELEMENTS SHOWDOWN ===================== */}
      <section className="relative py-24">
        <FloatingParticles />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <span className="font-display text-xs font-bold text-primary tracking-[0.3em] uppercase mb-4 block">
              Master The Elements
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-foreground mb-4">
              SIX <span className="text-primary">ELEMENTS</span> OF WAR
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto">
              Each element dominates another. Choose wisely or face total annihilation.
            </p>
          </motion.div>
          <ElementShowdown />
        </div>
      </section>

      {/* ===================== CHARACTER SPOTLIGHTS ===================== */}
      <section id="characters" className="relative py-24">
        <EmberParticles count={10} color="hsl(var(--primary) / 0.4)" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <span className="font-display text-xs font-bold text-primary tracking-[0.3em] uppercase mb-4 block">
              Meet The Champions
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-foreground">
              ELITE <span className="text-primary">ROSTER</span>
            </h2>
          </motion.div>

          {spotlightCards.slice(0, 5).map((card, i) => (
            <CharacterSpotlight key={card.id} card={card} index={i} />
          ))}
        </div>
      </section>

      {/* ===================== FULL ROSTER GRID ===================== */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <span className="font-display text-xs font-bold text-primary tracking-[0.3em] uppercase mb-4 block">
              Full Collection
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-foreground mb-4">
              ALL <span className="text-primary">WARRIORS</span>
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto">
              20 unique characters across 6 elements. From common footsoldiers to mythic gods of destruction.
            </p>
          </motion.div>
          <CardRoster />
        </div>
      </section>

      {/* ===================== BATTLE MARQUEE 2 ===================== */}
      <BattleMarquee />

      {/* ===================== ARENA PREVIEW ===================== */}
      <section id="arena" className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={arenaBg} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>
        {/* War flash */}
        <div className="absolute inset-0 bg-destructive/5 war-flash pointer-events-none" />
        <EmberParticles count={20} color="hsl(var(--destructive) / 0.5)" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="font-display text-xs font-bold text-destructive tracking-[0.3em] uppercase mb-4 block">
              ☠️ Prove Your Worth
            </span>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-foreground mb-6">
              THE <span className="text-destructive">ARENA</span> AWAITS
            </h2>
            <p className="font-body text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Turn-based elemental combat. Exploit weaknesses. Build your strategy. <span className="text-foreground font-bold">Dominate or be destroyed.</span>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto mb-12">
              {[
                { icon: Swords, label: 'Strategic Combat', color: 'hsl(var(--destructive))' },
                { icon: Zap, label: 'Element System', color: 'hsl(var(--primary))' },
                { icon: Shield, label: 'Deck Building', color: 'hsl(var(--holo-water))' },
                { icon: Trophy, label: 'Rank Up', color: '#10B981' },
              ].map(({ icon: Icon, label, color }) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.08, y: -5 }}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border relative overflow-hidden group"
                >
                  <div className="absolute inset-0 scan-lines opacity-0 group-hover:opacity-20 transition-opacity" />
                  <Icon size={28} style={{ color }} />
                  <span className="font-display text-xs font-bold text-foreground">{label}</span>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => navigate('/auth')}
              className="px-12 py-5 font-display font-bold text-xl text-primary-foreground rounded-xl relative overflow-hidden shine-sweep transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(239,68,68,0.3)]"
              style={{ background: 'linear-gradient(135deg, hsl(var(--destructive)), #F97316)' }}
            >
              ⚔️ START BATTLING
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section id="features" className="relative py-24">
        <FloatingParticles />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl sm:text-5xl font-black text-foreground mb-4">
              WHY <span className="text-primary">HOLOCARDS</span>?
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={Package} title="Open Packs" desc="Rip open holographic card packs with stunning reveal animations. Chase mythic rarities!" delay={0} color="#EAB308" />
            <FeatureCard icon={Swords} title="Battle AI" desc="Tactical turn-based combat with mana, elements, and field positioning." delay={0.1} color="#EF4444" />
            <FeatureCard icon={Trophy} title="Earn Rewards" desc="Daily login streaks, achievements, and battle rewards to grow your collection." delay={0.2} color="#10B981" />
            <FeatureCard icon={Users} title="Build Decks" desc="Craft the perfect deck from your collection. Master the element advantage system." delay={0.3} color="#3B82F6" />
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background" />
        <EmberParticles count={30} color="hsl(var(--primary) / 0.5)" />
        <FloatingParticles />
        {/* Spinning border accent line */}
        <div className="absolute top-0 left-0 right-0 h-px spinning-border opacity-60" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className="font-display text-5xl sm:text-6xl lg:text-8xl font-black text-foreground mb-6 glitch-text"
              data-text="YOUR LEGEND BEGINS"
              style={{ textShadow: '0 0 60px rgba(234,179,8,0.3)' }}
            >
              YOUR <span className="text-primary">LEGEND</span> BEGINS
            </h2>
            <p className="font-body text-xl text-muted-foreground max-w-xl mx-auto mb-10">
              Join the battle. Collect every card. Become the ultimate HoloCards champion.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-14 py-5 font-display font-black text-xl text-primary-foreground rounded-xl relative overflow-hidden shine-sweep transition-all hover:scale-105 breathing-glow"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--destructive)))',
              }}
            >
              ⚔️ PLAY FREE NOW
            </button>
            <p className="font-body text-sm text-muted-foreground mt-4">
              Free to play • 5 starter cards included • No credit card needed
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 relative">
        <div className="absolute top-0 left-0 right-0 h-px spinning-border opacity-30" />
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords size={20} className="text-primary" />
            <span className="font-display text-sm font-bold text-foreground">HOLOCARDS</span>
          </div>
          <p className="font-body text-xs text-muted-foreground">© 2026 HoloCards. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
