import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cards, Card, Element, Rarity, ELEMENT_COLORS, RARITY_COLORS, RARITY_ORDER, RARITY_STARS } from '@/data/cards';
import HoloCard from '@/components/HoloCard';
import CardDetail from '@/components/CardDetail';
import PackOpening from '@/components/PackOpening';
import DeckBuilder from '@/components/DeckBuilder';
import PlayerHeader from '@/components/PlayerHeader';
import { ElementIcon } from '@/components/ElementIcon';
import { Star, Package, Volume2, VolumeX, ArrowUp, Layers, ChevronDown, ArrowLeftRight, Lock, ShoppingBag, Swords, Gift } from 'lucide-react';
import BattleArena from '@/components/BattleArena';
import CardShop from '@/components/CardShop';
import RewardsPanel from '@/components/RewardsPanel';
import { supabase } from '@/integrations/supabase/client';
import CardComparison from '@/components/CardComparison';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCollection } from '@/hooks/useCollection';
import { useDecks } from '@/hooks/useDecks';
import { useRewards } from '@/hooks/useRewards';
import { AchievementStats } from '@/data/achievements';

const ELEMENTS: Element[] = ['fire', 'water', 'earth', 'air', 'light', 'dark'];
const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];

type SortOption = 'default' | 'name-asc' | 'name-desc' | 'atk' | 'def' | 'rarity-asc' | 'rarity-desc';

const SORT_LABELS: Record<SortOption, string> = {
  default: 'Default',
  'name-asc': 'Name A-Z',
  'name-desc': 'Name Z-A',
  atk: 'Highest Attack',
  def: 'Highest Defense',
  'rarity-asc': 'Rarity ↑',
  'rarity-desc': 'Rarity ↓',
};

export default function Index() {
  const { user, profile, fetchProfile } = useAuthContext();
  const { collection, ownsCard, addCards } = useCollection(user?.id);
  const { decks, createDeck, saveDeck } = useDecks(user?.id);
  const { dailyLogin, claimDailyLogin, unlockedAchievements, checkAndUnlockAchievements, claimAchievementGold, refetchRewards } = useRewards(user?.id);

  const [elementFilter, setElementFilter] = useState<Element | 'all'>('all');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'all'>('all');
  const [sort, setSort] = useState<SortOption>('default');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [packOpen, setPackOpen] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('holo-sound') === 'true');
  const [loaded, setLoaded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [deck, setDeck] = useState<Card[]>([]);
  const [deckOpen, setDeckOpen] = useState(false);
  const MAX_DECK_SIZE = 10;
  const [compareMode, setCompareMode] = useState(false);
  const [compareCards, setCompareCards] = useState<[Card | null, Card | null]>([null, null]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [showOwned, setShowOwned] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [battleOpen, setBattleOpen] = useState(false);

  const handleSpendGold = useCallback(async (amount: number) => {
    if (!user || !profile) return false;
    const newGold = profile.gold - amount;
    if (newGold < 0) return false;
    const { error } = await supabase
      .from('profiles')
      .update({ gold: newGold })
      .eq('user_id', user.id);
    if (error) return false;
    await fetchProfile(user.id);
    return true;
  }, [user, profile, fetchProfile]);

  const handleCardClick = useCallback((card: Card) => {
    if (compareMode) {
      setCompareCards(prev => {
        if (prev[0]?.id === card.id || prev[1]?.id === card.id) {
          toast.info('Card already selected for comparison', { duration: 1500 });
          return prev;
        }
        if (!prev[0]) return [card, prev[1]];
        if (!prev[1]) {
          setTimeout(() => setCompareOpen(true), 200);
          return [prev[0], card];
        }
        return [card, prev[1]];
      });
      return;
    }

    // Only allow adding owned cards to deck
    if (!ownsCard(card.id)) {
      setSelectedCard(card);
      return;
    }

    if (deck.find(c => c.id === card.id)) {
      setSelectedCard(card);
      return;
    }
    if (deck.length >= MAX_DECK_SIZE) {
      toast.error('Deck is full! Remove a card first.', { duration: 2000 });
      setSelectedCard(card);
      return;
    }
    setDeck(prev => [...prev, card]);
    toast.success(`${card.name} added to deck!`, { duration: 1500 });
  }, [deck, compareMode, ownsCard]);

  const handleToggleCompare = useCallback(() => {
    setCompareMode(prev => {
      if (prev) {
        setCompareCards([null, null]);
        setCompareOpen(false);
      } else {
        toast.info('Click two cards to compare them', { duration: 2000 });
      }
      return !prev;
    });
  }, []);

  const handleClearCompareSlot = useCallback((index: 0 | 1) => {
    setCompareCards(prev => {
      const next: [Card | null, Card | null] = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  const handleRemoveFromDeck = useCallback((cardId: number) => {
    setDeck(prev => prev.filter(c => c.id !== cardId));
  }, []);

  const handleClearDeck = useCallback(() => {
    setDeck([]);
    toast.info('Deck cleared', { duration: 1500 });
  }, []);

  const handleSaveDeck = useCallback(async () => {
    if (deck.length === 0) {
      toast.error('Add cards to your deck first');
      return;
    }
    const cardIds = deck.map(c => c.id);
    const activeDeck = decks.find(d => d.is_active);
    if (activeDeck) {
      await saveDeck(activeDeck.id, cardIds);
      toast.success('Deck saved!');
    } else {
      await createDeck('My Deck', cardIds);
      toast.success('Deck created!');
    }
  }, [deck, decks, saveDeck, createDeck]);

  const handleStartBattle = useCallback(() => {
    if (deck.length < 3) {
      toast.error('You need at least 3 cards in your deck to battle!');
      return;
    }
    setBattleOpen(true);
  }, [deck]);

  const handleBattleEnd = useCallback(async (won: boolean) => {
    if (!user || !profile) return;
    const xpGain = won ? 50 : 10;
    const goldGain = won ? 100 : 0;
    const updates: Record<string, number> = {
      xp: profile.xp + xpGain,
      gold: profile.gold + goldGain,
    };
    if (won) updates.wins = profile.wins + 1;
    else updates.losses = profile.losses + 1;

    // Level up check (every 100 XP)
    const newXp = profile.xp + xpGain;
    const newLevel = Math.floor(newXp / 100) + 1;
    if (newLevel > profile.level) {
      updates.level = newLevel;
      toast.success(`Level Up! You are now level ${newLevel}!`);
    }

    await supabase.from('profiles').update(updates).eq('user_id', user.id);
    await fetchProfile(user.id);
  }, [user, profile, fetchProfile]);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    localStorage.setItem('holo-sound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filtered = useMemo(() => {
    let result = [...cards];
    if (elementFilter !== 'all') result = result.filter(c => c.element === elementFilter);
    if (rarityFilter !== 'all') result = result.filter(c => c.rarity === rarityFilter);
    if (showOwned) result = result.filter(c => ownsCard(c.id));

    switch (sort) {
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'atk': result.sort((a, b) => b.attack - a.attack); break;
      case 'def': result.sort((a, b) => b.defense - a.defense); break;
      case 'rarity-asc': result.sort((a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]); break;
      case 'rarity-desc': result.sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]); break;
    }
    return result;
  }, [elementFilter, rarityFilter, sort, showOwned, ownsCard]);

  const ownedCount = collection.length;

  const elementCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ELEMENTS.forEach(e => { counts[e] = filtered.filter(c => c.element === e).length; });
    return counts;
  }, [filtered]);

  const rarityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    RARITIES.forEach(r => { counts[r] = filtered.filter(c => c.rarity === r).length; });
    return counts;
  }, [filtered]);

  const handlePackClose = async (revealedIds: number[]) => {
    setPackOpen(false);
    if (revealedIds.length) {
      await addCards(revealedIds);
      setHighlightedIds(revealedIds);
      setTimeout(() => setHighlightedIds([]), 3000);
      toast.success(`${revealedIds.length} cards added to your collection!`);
    }
  };

  return (
    <div className="min-h-screen grid-bg animate-bg-shift">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground" style={{ textShadow: '0 0 30px rgba(234,179,8,0.3)' }}>
                HoloCards
              </h1>
              <p className="text-muted-foreground mt-1 font-body text-lg">
                Collection: {ownedCount}/{cards.length} cards
              </p>
            </div>
            <PlayerHeader />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleToggleCompare}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-display font-semibold text-sm transition-all ${compareMode ? 'bg-primary text-primary-foreground ring-2 ring-primary/50' : 'bg-secondary hover:bg-secondary/80 text-foreground'}`}
            >
              <ArrowLeftRight size={18} />
              <span className="hidden sm:inline">Compare</span>
            </button>
            <button
              onClick={() => setShowOwned(!showOwned)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-display font-semibold text-sm transition-all ${showOwned ? 'bg-primary text-primary-foreground ring-2 ring-primary/50' : 'bg-secondary hover:bg-secondary/80 text-foreground'}`}
            >
              <Layers size={18} />
              <span className="hidden sm:inline">{showOwned ? 'Owned' : 'All Cards'}</span>
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              {soundEnabled ? <Volume2 size={20} className="text-foreground" /> : <VolumeX size={20} className="text-muted-foreground" />}
            </button>
            <button
              onClick={() => { setPackOpen(true); if (soundEnabled) import('@/lib/sounds').then(m => m.playPopSound()); }}
              className="flex items-center gap-2 px-5 py-2.5 font-display font-bold text-primary-foreground rounded-lg relative overflow-hidden shine-sweep"
              style={{ background: 'linear-gradient(135deg, #EAB308, #F97316)' }}
            >
              <Package size={20} />
              Open Pack
            </button>
            <button
              onClick={() => setShopOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 font-display font-bold text-primary-foreground rounded-lg relative overflow-hidden shine-sweep"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
            >
              <ShoppingBag size={20} />
              Shop
            </button>
            <button
              onClick={handleStartBattle}
              className="flex items-center gap-2 px-5 py-2.5 font-display font-bold text-primary-foreground rounded-lg relative overflow-hidden shine-sweep"
              style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)' }}
            >
              <Swords size={20} />
              Battle
            </button>
            {deck.length > 0 && (
              <button
                onClick={handleSaveDeck}
                className="flex items-center gap-2 px-4 py-2 font-display font-bold text-sm text-foreground rounded-lg bg-accent hover:bg-accent/80 transition-all"
              >
                Save Deck
              </button>
            )}
          </div>
        </div>

        {/* Compare mode banner */}
        <AnimatePresence>
          {compareMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between"
            >
              <span className="text-sm font-body text-foreground">
                <strong>Compare Mode:</strong> Select {!compareCards[0] ? 'first' : 'second'} card to compare
              </span>
              {(compareCards[0] || compareCards[1]) && (
                <button
                  onClick={() => setCompareOpen(true)}
                  className="text-sm font-display font-semibold text-primary hover:underline"
                >
                  View Comparison
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setElementFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-body font-semibold transition-all ${elementFilter === 'all' ? 'bg-foreground/20 text-foreground ring-2 ring-foreground/30' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
            >
              All
            </button>
            {ELEMENTS.map(el => (
              <button
                key={el}
                onClick={() => setElementFilter(el === elementFilter ? 'all' : el)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body font-semibold transition-all ${elementFilter === el ? 'text-foreground ring-2' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
                style={elementFilter === el ? { backgroundColor: `${ELEMENT_COLORS[el]}20`, boxShadow: `0 0 0 2px ${ELEMENT_COLORS[el]}` } : undefined}
              >
                <ElementIcon element={el} size={14} style={{ color: ELEMENT_COLORS[el] }} />
                <span className="capitalize hidden sm:inline">{el}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setRarityFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-body font-semibold transition-all ${rarityFilter === 'all' ? 'bg-foreground/20 text-foreground ring-2 ring-foreground/30' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
            >
              All Rarities
            </button>
            {RARITIES.map(r => (
              <button
                key={r}
                onClick={() => setRarityFilter(r === rarityFilter ? 'all' : r)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-body font-semibold transition-all ${rarityFilter === r ? 'text-foreground ring-2' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
                style={rarityFilter === r ? { backgroundColor: `${RARITY_COLORS[r]}20`, boxShadow: `0 0 0 2px ${RARITY_COLORS[r]}` } : undefined}
              >
                <Star size={12} fill={RARITY_COLORS[r]} color={RARITY_COLORS[r]} />
                <span className="capitalize hidden sm:inline">{r}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-body">Showing {filtered.length} of {cards.length} cards</span>
            <div className="relative">
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm font-body text-foreground hover:bg-secondary/80 transition-colors"
              >
                {SORT_LABELS[sort]}
                <ChevronDown size={14} />
              </button>
              {sortDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-30 py-1">
                  {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setSort(opt); setSortDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm font-body hover:bg-secondary transition-colors ${sort === opt ? 'text-primary' : 'text-foreground'}`}
                    >
                      {SORT_LABELS[opt]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 mb-8 p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-muted-foreground" />
            <span className="font-display text-sm text-foreground">{ownedCount} / {cards.length}</span>
          </div>
          <div className="w-px h-6 bg-border" />
          {ELEMENTS.map(el => (
            <div key={el} className="flex items-center gap-1">
              <ElementIcon element={el} size={14} style={{ color: ELEMENT_COLORS[el] }} />
              <span className="text-xs font-body text-muted-foreground">{elementCounts[el]}</span>
            </div>
          ))}
          <div className="w-px h-6 bg-border" />
          {RARITIES.map(r => (
            <div key={r} className="flex items-center gap-1">
              <Star size={10} fill={RARITY_COLORS[r]} color={RARITY_COLORS[r]} />
              <span className="text-xs font-body text-muted-foreground">{rarityCounts[r]}</span>
            </div>
          ))}
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
          <AnimatePresence mode="popLayout">
            {!loaded
              ? Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    className="rounded-xl"
                    style={{
                      width: 250,
                      height: 350,
                      background: 'linear-gradient(180deg, hsl(220 20% 12%), hsl(220 25% 5%))',
                      animation: 'skeletonPulse 1.5s ease-in-out infinite',
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                ))
              : filtered.map((card, i) => {
                  const owned = ownsCard(card.id);
                  return (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, layout: { duration: 0.4 } }}
                      className="relative"
                    >
                      <div className={!owned ? 'opacity-50 grayscale' : ''}>
                        <HoloCard
                          card={card}
                          onClick={() => handleCardClick(card)}
                          flipDelay={i * 50}
                          highlighted={highlightedIds.includes(card.id) || deck.some(d => d.id === card.id)}
                        />
                      </div>
                      {!owned && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="p-2 rounded-full bg-background/80 backdrop-blur-sm">
                            <Lock size={24} className="text-muted-foreground" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })
            }
          </AnimatePresence>
        </div>
      </div>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-secondary border border-border shadow-lg hover:bg-secondary/80 transition-colors z-40"
          >
            <ArrowUp size={20} className="text-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Detail view */}
      <AnimatePresence>
        {selectedCard && <CardDetail card={selectedCard} onClose={() => setSelectedCard(null)} />}
      </AnimatePresence>

      {/* Deck Builder */}
      <DeckBuilder
        deck={deck}
        onRemove={handleRemoveFromDeck}
        onClear={handleClearDeck}
        isOpen={deckOpen}
        onToggle={() => setDeckOpen(!deckOpen)}
        maxSize={MAX_DECK_SIZE}
      />

      {/* Card Comparison */}
      <CardComparison
        cards={compareCards}
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        onClearSlot={handleClearCompareSlot}
      />

      {/* Pack opening */}
      <AnimatePresence>
        <PackOpening isOpen={packOpen} onClose={handlePackClose} soundEnabled={soundEnabled} />
      </AnimatePresence>

      {/* Card Shop */}
      <AnimatePresence>
        <CardShop
          isOpen={shopOpen}
          onClose={() => setShopOpen(false)}
          gold={profile?.gold ?? 0}
          onSpendGold={handleSpendGold}
          onAddCards={addCards}
          ownsCard={ownsCard}
        />
      </AnimatePresence>

      {/* Battle Arena */}
      <AnimatePresence>
        <BattleArena
          isOpen={battleOpen}
          onClose={() => setBattleOpen(false)}
          playerDeck={deck}
          playerLevel={profile?.level ?? 1}
          onBattleEnd={handleBattleEnd}
        />
      </AnimatePresence>
    </div>
  );
}
