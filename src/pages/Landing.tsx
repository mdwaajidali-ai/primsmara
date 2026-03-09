import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Swords, Shield, Flame, Zap, Star, ChevronDown, Package, Trophy, Users } from 'lucide-react';
import { cards, RARITY_COLORS } from '@/data/cards';
import { CARD_IMAGES } from '@/data/cardImages';

import heroBg from '@/assets/landing/hero-bg.jpg';
import arenaBg from '@/assets/landing/arena-bg.jpg';
import lineupBg from '@/assets/landing/characters-lineup.jpg';

const FEATURED_CARDS = [18, 19, 20, 17, 13, 14, 15, 16]; // mythic + legendary
const ALL_CARDS_SORTED = [...cards].sort((a, b) => {
  const order = { mythic: 0, legendary: 1, rare: 2, uncommon: 3, common: 4 };
  return order[a.rarity] - order[b.rarity];
});

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/30"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 5}s ease-in-out ${Math.random() * 3}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

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
        <img
          src={CARD_IMAGES[card.id]}
          alt={card.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {/* Glow border */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            boxShadow: `inset 0 0 30px ${card.elementColor}40, 0 0 40px ${card.elementColor}30`,
          }}
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
            <Swords size={16} className="text-red-400" />
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
          <span
            className="font-display text-xs font-bold uppercase tracking-[0.3em] mb-2 block"
            style={{ color: card.elementColor }}
          >
            {card.element} • {card.rarity}
          </span>
          <h3 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {card.name}
          </h3>
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
            {card.description}
          </p>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-red-400">{card.attack}</div>
              <div className="font-body text-xs text-muted-foreground uppercase tracking-wider">Attack</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-blue-400">{card.defense}</div>
              <div className="font-body text-xs text-muted-foreground uppercase tracking-wider">Defense</div>
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
          transition={{ duration: 0.5, delay: i * 0.05, ease: 'backOut' }}
          className="relative aspect-[2.5/3.5] rounded-lg overflow-hidden group cursor-pointer"
          whileHover={{ scale: 1.15, zIndex: 10, y: -10 }}
        >
          <img src={CARD_IMAGES[card.id]} alt={card.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: `inset 0 0 20px ${card.elementColor}50` }}
          />
          <div className="absolute bottom-1 left-1 right-1">
            <p className="font-display text-[9px] font-bold text-foreground truncate text-center drop-shadow-md">
              {card.name}
            </p>
          </div>
          {/* Border based on rarity */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{ border: `2px solid ${RARITY_COLORS[card.rarity]}40` }}
          />
        </motion.div>
      ))}
    </div>
  );
}

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
      className="relative rounded-2xl border border-border p-8 overflow-hidden group"
      style={{ background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon size={28} style={{ color }} />
      </div>
      <h3 className="font-display text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="font-body text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}

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
      {/* ===================== HERO ===================== */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ y: heroY, scale: heroScale }}
        >
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        </motion.div>

        <FloatingParticles />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-8">
              <Flame size={14} className="text-primary" />
              <span className="font-display text-xs font-bold text-primary tracking-wider uppercase">Season 1 — Now Live</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="font-display text-6xl sm:text-7xl lg:text-8xl font-black text-foreground mb-6 leading-[0.95]"
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
            Collect legendary warriors. Build unstoppable decks. Dominate the arena.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <button
              onClick={() => navigate('/auth')}
              className="px-10 py-4 font-display font-bold text-lg text-primary-foreground rounded-xl relative overflow-hidden shine-sweep transition-transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), #F97316)' }}
            >
              ENTER THE ARENA
            </button>
            <button
              onClick={() => document.getElementById('characters')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 font-display font-bold text-lg text-foreground rounded-xl border-2 border-border hover:border-primary/50 transition-all hover:scale-105 bg-background/50 backdrop-blur-sm"
            >
              VIEW ROSTER
            </button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex items-center justify-center gap-8 sm:gap-12 mt-16"
          >
            {[
              { label: 'Warriors', value: '20+' },
              { label: 'Elements', value: '6' },
              { label: 'Rarities', value: '5' },
              { label: 'Battles', value: '∞' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="font-body text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <ChevronDown size={32} className="text-primary/60" />
        </motion.div>
      </section>

      {/* ===================== CHARACTER LINEUP ===================== */}
      <section className="relative py-24 overflow-hidden">
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
            <span className="font-display text-xs font-bold text-primary tracking-[0.3em] uppercase mb-4 block">
              Choose Your Champion
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-foreground">
              LEGENDARY <span className="text-primary">WARRIORS</span>
            </h2>
          </motion.div>

          {/* Horizontal scrolling featured cards */}
          <div className="relative mb-20">
            <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide px-4"
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

                  {/* Mythic shimmer overlay */}
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

                  {/* Hover glow */}
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

      {/* ===================== CHARACTER SPOTLIGHTS ===================== */}
      <section id="characters" className="relative py-24">
        <FloatingParticles />
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

          {/* Spotlight cards — alternating layout */}
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

      {/* ===================== ARENA PREVIEW ===================== */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={arenaBg} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="font-display text-xs font-bold text-primary tracking-[0.3em] uppercase mb-4 block">
              Prove Your Worth
            </span>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-foreground mb-6">
              THE <span className="text-primary">ARENA</span> AWAITS
            </h2>
            <p className="font-body text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Turn-based elemental combat. Exploit weaknesses. Build your strategy. Dominate the battlefield and rise through the ranks.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto mb-12">
              {[
                { icon: Swords, label: 'Strategic Combat', color: '#EF4444' },
                { icon: Zap, label: 'Element System', color: '#EAB308' },
                { icon: Shield, label: 'Deck Building', color: '#3B82F6' },
                { icon: Trophy, label: 'Rank Up', color: '#10B981' },
              ].map(({ icon: Icon, label, color }) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.08, y: -5 }}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border"
                >
                  <Icon size={28} style={{ color }} />
                  <span className="font-display text-xs font-bold text-foreground">{label}</span>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => navigate('/auth')}
              className="px-12 py-5 font-display font-bold text-xl text-primary-foreground rounded-xl relative overflow-hidden shine-sweep transition-transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)' }}
            >
              START BATTLING
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="relative py-24">
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
        <FloatingParticles />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-foreground mb-6"
              style={{ textShadow: '0 0 60px rgba(234,179,8,0.3)' }}
            >
              YOUR <span className="text-primary">LEGEND</span> BEGINS
            </h2>
            <p className="font-body text-xl text-muted-foreground max-w-xl mx-auto mb-10">
              Join the battle. Collect every card. Become the ultimate HoloCards champion.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-14 py-5 font-display font-black text-xl text-primary-foreground rounded-xl relative overflow-hidden shine-sweep transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), #F97316)',
                boxShadow: '0 0 40px rgba(234,179,8,0.3)',
              }}
            >
              PLAY FREE NOW
            </button>
            <p className="font-body text-sm text-muted-foreground mt-4">
              Free to play • 5 starter cards included • No credit card needed
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
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
