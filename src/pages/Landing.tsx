import { useRef, useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Flame, Zap, Star, ChevronDown, Package, Trophy, Users, Crown, Skull, Target, Loader2, Box } from 'lucide-react';
import { cards, RARITY_COLORS } from '@/data/cards';
import { CARD_IMAGES } from '@/data/cardImages';

import heroBg from '@/assets/landing/hero-bg.jpg';
import arenaBg from '@/assets/landing/arena-bg.jpg';
import lineupBg from '@/assets/landing/characters-lineup.jpg';

const Card3DShowcase = lazy(() => import('@/components/Card3DShowcase'));

const FEATURED_CARDS = [18, 19, 20, 17, 13, 14, 15, 16];
const ALL_CARDS_SORTED = [...cards].sort((a, b) => {
  const order = { mythic: 0, legendary: 1, rare: 2, uncommon: 3, common: 4 };
  return order[a.rarity] - order[b.rarity];
});

/* ====== EMBER PARTICLES — used sparingly ====== */
function EmberParticles({ count = 12 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full ember"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            background: `hsl(var(--primary) / ${0.2 + Math.random() * 0.3})`,
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 20}%`,
            '--drift': `${(Math.random() - 0.5) * 60}px`,
            '--duration': `${3 + Math.random() * 4}s`,
            '--delay': `${Math.random() * 5}s`,
          } as React.CSSProperties}
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
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-border/30"
          style={{ background: 'hsl(var(--background) / 0.9)' }}
        >
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Swords size={20} className="text-primary" />
              <span className="font-display text-2xl text-foreground">PRISMARA</span>
            </div>
            <div className="hidden md:flex items-center gap-10">
              {['Warriors', 'Arena', 'Features'].map(item => (
                <button
                  key={item}
                  onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                  className="font-condensed text-sm font-600 text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2.5 font-display text-lg text-primary-foreground rounded relative overflow-hidden shine-sweep"
              style={{ background: 'hsl(var(--primary))' }}
            >
              PLAY NOW
            </button>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

/* ====== CHARACTER SPOTLIGHT ====== */
function CharacterSpotlight({ card, index }: { card: typeof cards[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex items-center gap-10 lg:gap-20 ${isEven ? 'flex-row' : 'flex-row-reverse'} max-w-6xl mx-auto`}
    >
      {/* Character image */}
      <motion.div
        className="relative w-64 h-80 lg:w-80 lg:h-[420px] flex-shrink-0 overflow-hidden group"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <img src={CARD_IMAGES[card.id]} alt={card.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        {/* Rarity indicator */}
        <div className="absolute top-4 right-4 flex gap-0.5">
          {Array.from({ length: { common: 1, uncommon: 2, rare: 3, legendary: 4, mythic: 5 }[card.rarity] }).map((_, i) => (
            <Star key={i} size={12} fill={RARITY_COLORS[card.rarity]} color={RARITY_COLORS[card.rarity]} />
          ))}
        </div>
        {/* Bottom stats */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Swords size={14} className="text-destructive" />
            <span className="font-condensed text-sm font-bold text-foreground">{card.attack}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-blue-400" />
            <span className="font-condensed text-sm font-bold text-foreground">{card.defense}</span>
          </div>
        </div>
        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ boxShadow: `inset 0 0 40px ${card.elementColor}20` }}
        />
      </motion.div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="font-condensed text-sm font-semibold uppercase tracking-[0.2em] mb-3 block" style={{ color: card.elementColor }}>
            {card.element} · {card.rarity}
          </span>
          <h3 className="font-display text-5xl lg:text-6xl text-foreground mb-4">{card.name}</h3>
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">{card.description}</p>

          {/* Power bars */}
          <div className="space-y-4 mb-8">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="font-condensed text-sm text-muted-foreground uppercase tracking-wider">Attack</span>
                <span className="font-condensed text-sm font-bold text-destructive">{card.attack}</span>
              </div>
              <div className="h-1 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${(card.attack / 20) * 100}%` } : {}}
                  transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                  className="h-full rounded-full bg-destructive"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="font-condensed text-sm text-muted-foreground uppercase tracking-wider">Defense</span>
                <span className="font-condensed text-sm font-bold" style={{ color: 'hsl(var(--holo-water))' }}>{card.defense}</span>
              </div>
              <div className="h-1 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${(card.defense / 20) * 100}%` } : {}}
                  transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'hsl(var(--holo-water))' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ====== CARD ROSTER ====== */
function CardRoster() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2">
      {ALL_CARDS_SORTED.map((card, i) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: i * 0.03 }}
          className="relative aspect-[2.5/3.5] overflow-hidden group cursor-pointer"
          whileHover={{ scale: 1.15, zIndex: 10, y: -10 }}
        >
          <img src={CARD_IMAGES[card.id]} alt={card.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute bottom-1 left-1 right-1">
            <p className="font-condensed text-[9px] font-semibold text-foreground truncate text-center">{card.name}</p>
          </div>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ boxShadow: `inset 0 0 15px ${card.elementColor}30` }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ====== FEATURE CARD ====== */
function FeatureCard({ icon: Icon, title, desc, delay, accentColor }: { icon: any; title: string; desc: string; delay: number; accentColor: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -6 }}
      className="relative p-8 border border-border/50 bg-card overflow-hidden group"
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: accentColor }}
      />
      <div className="mb-5">
        <Icon size={28} style={{ color: accentColor }} />
      </div>
      <h3 className="font-display text-2xl text-foreground mb-3">{title}</h3>
      <p className="font-body text-muted-foreground leading-relaxed text-[15px]">{desc}</p>
    </motion.div>
  );
}

/* ====== BATTLE STATS MARQUEE ====== */
function BattleMarquee() {
  const items = [
    '⚔️ WORLD TITAN destroyed SHADOW WISP',
    '🔥 INFERNO DRAGON used HELLFIRE BLAST',
    '💀 VOID STALKER eliminated BREEZE DANCER',
    '🛡️ IRON GOLEM blocked 18 damage',
    '⚡ TEMPEST ARCHON unleashed STORM SURGE',
    '🏆 Player XK47 won 5 battles in a row',
    '✨ CELESTIAL PHOENIX revived from ashes',
    '💎 Mythic card pulled: PRIMORDIAL FLAME',
  ];

  return (
    <div className="relative overflow-hidden py-3" style={{ background: 'hsl(var(--card))' }}>
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-card to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-card to-transparent z-10" />
      <div className="flex whitespace-nowrap marquee-scroll">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="font-condensed text-xs text-muted-foreground mx-10 uppercase tracking-wider">
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
    { name: 'Fire', icon: Flame, color: 'hsl(var(--holo-fire))', desc: 'Burns with relentless fury', power: 85 },
    { name: 'Water', icon: Shield, color: 'hsl(var(--holo-water))', desc: 'Flows and adapts endlessly', power: 80 },
    { name: 'Earth', icon: Target, color: 'hsl(var(--holo-earth))', desc: 'Unbreakable. Immovable.', power: 90 },
    { name: 'Air', icon: Zap, color: 'hsl(var(--holo-air))', desc: 'Strikes before you blink', power: 75 },
    { name: 'Light', icon: Crown, color: 'hsl(var(--holo-light))', desc: 'Divine purifying force', power: 95 },
    { name: 'Dark', icon: Skull, color: 'hsl(var(--holo-dark))', desc: 'Corrupts and devours all', power: 88 },
  ];

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {elements.map((el, i) => (
        <motion.div
          key={el.name}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          whileHover={{ y: -4 }}
          className="relative p-6 border border-border/40 bg-card overflow-hidden group"
        >
          <el.icon size={28} style={{ color: el.color }} className="mb-3" />
          <h4 className="font-display text-2xl text-foreground mb-1">{el.name}</h4>
          <p className="font-body text-sm text-muted-foreground mb-4">{el.desc}</p>
          <div className="h-1 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: `${el.power}%` } : {}}
              transition={{ duration: 1, delay: 0.2 + i * 0.08, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: el.color }}
            />
          </div>
          <span className="font-condensed text-xs text-muted-foreground mt-1.5 block text-right">{el.power}</span>
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
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const spotlightCards = FEATURED_CARDS.map(id => cards.find(c => c.id === id)!).filter(Boolean);

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      <StickyNav />

      {/* ===================== HERO ===================== */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/20 to-background" />
        </motion.div>

        <EmberParticles count={10} />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block font-condensed text-sm font-semibold text-primary uppercase tracking-[0.3em] mb-6">
              Season 1 — The War Begins
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="font-display text-[clamp(4rem,12vw,11rem)] text-foreground leading-[0.85] mb-8"
            style={{ textShadow: '0 0 80px rgba(234,179,8,0.2)' }}
          >
            HOLO<span className="text-primary">CARDS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="font-body text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed font-light"
          >
            Collect legendary warriors. Build unstoppable decks.
            <span className="text-foreground font-medium"> Dominate the arena.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex items-center justify-center gap-5 flex-wrap"
          >
            <button
              onClick={() => navigate('/auth')}
              className="px-12 py-4 font-display text-2xl text-primary-foreground relative overflow-hidden shine-sweep transition-all hover:scale-105 bg-primary"
            >
              ENTER THE ARENA
            </button>
            <button
              onClick={() => document.getElementById('warriors')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-12 py-4 font-display text-2xl text-foreground border border-border hover:border-foreground/30 transition-all hover:scale-105 bg-background/30 backdrop-blur-sm"
            >
              VIEW ROSTER
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="flex items-center justify-center gap-12 sm:gap-16 mt-20"
          >
            {[
              { label: 'Warriors', value: 20, suffix: '+' },
              { label: 'Elements', value: 6, suffix: '' },
              { label: 'Active Players', value: 10, suffix: 'K+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-4xl text-primary">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="font-condensed text-xs text-muted-foreground uppercase tracking-[0.2em] mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <ChevronDown size={24} className="text-foreground/30" />
        </motion.div>
      </section>

      {/* ===================== MARQUEE ===================== */}
      <BattleMarquee />

      {/* ===================== 3D SHOWCASE ===================== */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <span className="font-condensed text-sm font-semibold text-accent uppercase tracking-[0.2em] mb-3 block">
              Interactive Experience
            </span>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-foreground">
              3D CARD <span className="text-primary">SHOWCASE</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Suspense
              fallback={
                <div className="w-full h-[600px] border border-border/20 flex items-center justify-center bg-card">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="font-condensed text-sm text-muted-foreground uppercase tracking-wider">
                      Loading 3D...
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

      <div className="divider-glow max-w-4xl mx-auto" />

      {/* ===================== WARRIORS ===================== */}
      <section id="warriors" className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={lineupBg} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="font-condensed text-sm font-semibold text-destructive uppercase tracking-[0.2em] mb-3 block">
              Choose Your Champion
            </span>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-foreground">
              LEGENDARY <span className="text-primary">WARRIORS</span>
            </h2>
          </motion.div>

          {/* Horizontal scrolling cards */}
          <div className="relative mb-24">
            <div
              className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory px-2"
              style={{ scrollbarWidth: 'none' }}
            >
              {spotlightCards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{
                    y: -15,
                    scale: 1.04,
                    transition: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                  className="relative flex-shrink-0 w-52 h-72 overflow-hidden cursor-pointer snap-center group"
                  style={{
                    border: `1px solid ${card.elementColor}25`,
                  }}
                >
                  <img src={CARD_IMAGES[card.id]} alt={card.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

                  {card.rarity === 'mythic' && (
                    <div className="absolute inset-0 mythic-shimmer opacity-15 mix-blend-overlay" />
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({ length: { common: 1, uncommon: 2, rare: 3, legendary: 4, mythic: 5 }[card.rarity] }).map((_, i) => (
                        <Star key={i} size={9} fill={RARITY_COLORS[card.rarity]} color={RARITY_COLORS[card.rarity]} />
                      ))}
                    </div>
                    <h4 className="font-display text-xl text-foreground">{card.name}</h4>
                    <p className="font-condensed text-xs text-muted-foreground capitalize">{card.element} · {card.rarity}</p>
                  </div>

                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 30px ${card.elementColor}20` }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== ELEMENTS ===================== */}
      <section className="relative py-28">
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <span className="font-condensed text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-3 block">
              Master The Elements
            </span>
            <h2 className="font-display text-5xl sm:text-6xl text-foreground">
              SIX ELEMENTS <span className="text-primary">OF WAR</span>
            </h2>
          </motion.div>
          <ElementShowdown />
        </div>
      </section>

      <div className="divider-glow max-w-4xl mx-auto" />

      {/* ===================== CHARACTER SPOTLIGHTS ===================== */}
      <section id="characters" className="relative py-28">
        <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <span className="font-condensed text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-3 block">
              Meet The Champions
            </span>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-foreground">
              ELITE <span className="text-primary">ROSTER</span>
            </h2>
          </motion.div>

          {spotlightCards.slice(0, 4).map((card, i) => (
            <CharacterSpotlight key={card.id} card={card} index={i} />
          ))}
        </div>
      </section>

      {/* ===================== FULL ROSTER ===================== */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-5xl sm:text-6xl text-foreground mb-3">
              ALL <span className="text-primary">WARRIORS</span>
            </h2>
            <p className="font-body text-muted-foreground max-w-md mx-auto font-light">
              20 unique characters across 6 elements. From footsoldiers to mythic gods.
            </p>
          </motion.div>
          <CardRoster />
        </div>
      </section>

      <BattleMarquee />

      {/* ===================== ARENA ===================== */}
      <section id="arena" className="relative py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img src={arenaBg} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>
        <EmberParticles count={8} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-condensed text-sm font-semibold text-destructive uppercase tracking-[0.2em] mb-4 block">
              Prove Your Worth
            </span>
            <h2 className="font-display text-6xl sm:text-7xl lg:text-8xl text-foreground mb-6">
              THE <span className="text-destructive">ARENA</span> AWAITS
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed font-light">
              Turn-based elemental combat. Exploit weaknesses. Build your strategy. <span className="text-foreground font-medium">Dominate or be destroyed.</span>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-14">
              {[
                { icon: Swords, label: 'Strategic Combat', color: 'hsl(var(--destructive))' },
                { icon: Zap, label: 'Element System', color: 'hsl(var(--primary))' },
                { icon: Shield, label: 'Deck Building', color: 'hsl(var(--holo-water))' },
                { icon: Trophy, label: 'Rank Up', color: '#10B981' },
              ].map(({ icon: Icon, label, color }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -4 }}
                  className="flex flex-col items-center gap-3 p-5 bg-card border border-border/30"
                >
                  <Icon size={24} style={{ color }} />
                  <span className="font-condensed text-xs font-semibold text-foreground uppercase tracking-wider">{label}</span>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => navigate('/auth')}
              className="px-14 py-5 font-display text-2xl text-primary-foreground relative overflow-hidden shine-sweep transition-all hover:scale-105 bg-destructive"
            >
              START BATTLING
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section id="features" className="relative py-28">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-5xl sm:text-6xl text-foreground">
              WHY <span className="text-primary">HOLOCARDS</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard icon={Package} title="OPEN PACKS" desc="Rip open holographic card packs with stunning reveal animations. Chase mythic rarities." delay={0} accentColor="#EAB308" />
            <FeatureCard icon={Swords} title="BATTLE AI" desc="Tactical turn-based combat with mana, elements, and field positioning strategy." delay={0.08} accentColor="#EF4444" />
            <FeatureCard icon={Trophy} title="EARN REWARDS" desc="Daily login streaks, achievements, and battle rewards to grow your collection." delay={0.16} accentColor="#10B981" />
            <FeatureCard icon={Users} title="BUILD DECKS" desc="Craft the perfect deck from your collection. Master the element advantage system." delay={0.24} accentColor="#3B82F6" />
          </div>
        </div>
      </section>

      <div className="divider-glow max-w-4xl mx-auto" />

      {/* ===================== FINAL CTA ===================== */}
      <section className="relative py-36 overflow-hidden">
        <EmberParticles count={8} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className="font-display text-6xl sm:text-7xl lg:text-9xl text-foreground mb-8"
              style={{ textShadow: '0 0 60px rgba(234,179,8,0.15)' }}
            >
              YOUR <span className="text-primary">LEGEND</span> BEGINS
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-md mx-auto mb-12 font-light">
              Join the battle. Collect every card. Become the ultimate champion.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-16 py-5 font-display text-2xl text-primary-foreground relative overflow-hidden shine-sweep transition-all hover:scale-105 breathing-glow bg-primary"
            >
              PLAY FREE NOW
            </button>
            <p className="font-condensed text-sm text-muted-foreground mt-6 tracking-wider">
              Free to play · 5 starter cards · No credit card needed
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords size={18} className="text-primary" />
            <span className="font-display text-xl text-foreground">HOLOCARDS</span>
          </div>
          <p className="font-body text-xs text-muted-foreground">© 2026 HoloCards. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
