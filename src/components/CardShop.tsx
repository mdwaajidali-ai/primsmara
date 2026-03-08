import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cards, Card, RARITY_COLORS, RARITY_STARS, ELEMENT_COLORS } from '@/data/cards';
import { CARD_IMAGES } from '@/data/cardImages';
import { PACK_TIERS, CARD_PRICES, PackTier, rollPackCards } from '@/data/shop';
import { ElementIcon } from '@/components/ElementIcon';
import { X, Coins, Package, Star, Swords, Shield, ShoppingBag, Sparkles, Lock, Check } from 'lucide-react';
import basicPackImg from '@/assets/packs/basic-pack.png';
import premiumPackImg from '@/assets/packs/premium-pack.png';
import legendaryPackImg from '@/assets/packs/legendary-pack.png';
import mythicPackImg from '@/assets/packs/mythic-pack.png';

const PACK_IMAGES: Record<string, string> = {
  basic: basicPackImg,
  premium: premiumPackImg,
  legendary: legendaryPackImg,
  mythic: mythicPackImg,
};
import { toast } from 'sonner';

interface CardShopProps {
  isOpen: boolean;
  onClose: () => void;
  gold: number;
  onSpendGold: (amount: number) => Promise<boolean>;
  onAddCards: (cardIds: number[]) => Promise<void>;
  ownsCard: (cardId: number) => boolean;
}

type ShopTab = 'packs' | 'singles';

export default function CardShop({ isOpen, onClose, gold, onSpendGold, onAddCards, ownsCard }: CardShopProps) {
  const [tab, setTab] = useState<ShopTab>('packs');
  const [purchasing, setPurchasing] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Card[] | null>(null);

  const handleBuyPack = useCallback(async (tier: PackTier) => {
    if (gold < tier.cost) {
      toast.error(`Not enough gold! You need ${tier.cost - gold} more.`);
      return;
    }
    setPurchasing(true);
    const success = await onSpendGold(tier.cost);
    if (!success) {
      toast.error('Purchase failed');
      setPurchasing(false);
      return;
    }
    const rolled = rollPackCards(tier);
    await onAddCards(rolled.map(c => c.id));
    setRevealedCards(rolled);
    setPurchasing(false);
  }, [gold, onSpendGold, onAddCards]);

  const handleBuyCard = useCallback(async (card: Card) => {
    const price = CARD_PRICES[card.rarity];
    if (gold < price) {
      toast.error(`Not enough gold! You need ${price - gold} more.`);
      return;
    }
    setPurchasing(true);
    const success = await onSpendGold(price);
    if (!success) {
      toast.error('Purchase failed');
      setPurchasing(false);
      return;
    }
    await onAddCards([card.id]);
    toast.success(`${card.name} added to your collection!`);
    setPurchasing(false);
  }, [gold, onSpendGold, onAddCards]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative z-10 w-full max-w-5xl max-h-[90vh] mx-4 rounded-2xl border border-border overflow-hidden flex flex-col"
        style={{ background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(222 47% 5%) 100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} className="text-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground">Card Shop</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30">
              <Coins size={18} className="text-primary" />
              <span className="font-display font-bold text-foreground">{gold}</span>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => { setTab('packs'); setRevealedCards(null); }}
            className={`flex-1 py-3 font-display text-sm font-bold transition-all ${tab === 'packs' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Package size={16} className="inline mr-2" />
            Card Packs
          </button>
          <button
            onClick={() => { setTab('singles'); setRevealedCards(null); }}
            className={`flex-1 py-3 font-display text-sm font-bold transition-all ${tab === 'singles' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Star size={16} className="inline mr-2" />
            Buy Singles
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Pack reveal overlay */}
            {revealedCards && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <h3 className="font-display text-xl font-bold text-primary">You got these cards!</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {revealedCards.map((card, i) => (
                    <motion.div
                      key={`${card.id}-${i}`}
                      initial={{ y: -30, opacity: 0, rotateY: 180 }}
                      animate={{ y: 0, opacity: 1, rotateY: 0 }}
                      transition={{ delay: i * 0.15, type: 'spring', bounce: 0.3 }}
                      className="w-36 rounded-xl overflow-hidden border-2"
                      style={{ borderColor: card.elementColor, boxShadow: `0 0 15px ${card.elementColor}40` }}
                    >
                      <div className="relative h-48">
                        <img src={CARD_IMAGES[card.id]} alt={card.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.8) 85%)' }} />
                        <div className="absolute top-2 left-2 right-2">
                          <p className="font-display text-[10px] font-bold text-foreground drop-shadow-md truncate">{card.name}</p>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                          <div className="flex gap-0.5">
                            {Array.from({ length: RARITY_STARS[card.rarity] }).map((_, j) => (
                              <Star key={j} size={8} fill={RARITY_COLORS[card.rarity]} color={RARITY_COLORS[card.rarity]} />
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-display font-bold text-foreground drop-shadow-md">{card.attack}⚔</span>
                            <span className="text-[10px] font-display font-bold text-foreground drop-shadow-md">{card.defense}🛡</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <button
                  onClick={() => setRevealedCards(null)}
                  className="px-6 py-2 rounded-lg font-display font-bold text-primary-foreground shine-sweep relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #EAB308, #F97316)' }}
                >
                  Continue Shopping
                </button>
              </motion.div>
            )}

            {/* Packs tab */}
            {tab === 'packs' && !revealedCards && (
              <motion.div
                key="packs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {PACK_TIERS.map((tier) => {
                  const canAfford = gold >= tier.cost;
                  return (
                    <motion.div
                      key={tier.id}
                      whileHover={{ scale: 1.02 }}
                      className="rounded-xl border border-border overflow-hidden flex flex-col"
                      style={{ background: 'hsl(var(--card))' }}
                    >
                      {/* Pack visual */}
                      <div
                        className="h-40 relative overflow-hidden"
                        style={{ boxShadow: `inset 0 -20px 40px rgba(0,0,0,0.3)` }}
                      >
                        <img src={PACK_IMAGES[tier.id]} alt={tier.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)' }} />
                        <div className="absolute bottom-2 left-0 right-0 text-center">
                          <span className="font-display text-xs font-bold text-foreground/70 drop-shadow-md">{tier.cardCount} Cards</span>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-display text-sm font-bold text-foreground mb-1">{tier.name}</h3>
                        <p className="text-xs font-body text-muted-foreground mb-3">{tier.description}</p>

                        {/* Drop rates */}
                        <div className="space-y-1 mb-4">
                          {(['common', 'uncommon', 'rare', 'legendary', 'mythic'] as const).map(r => {
                            if (tier.dropRates[r] === 0) return null;
                            return (
                              <div key={r} className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Star size={8} fill={RARITY_COLORS[r]} color={RARITY_COLORS[r]} />
                                  <span className="text-[10px] font-body text-muted-foreground capitalize">{r}</span>
                                </div>
                                <span className="text-[10px] font-display font-bold text-foreground">{tier.dropRates[r]}%</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-auto">
                          <button
                            onClick={() => handleBuyPack(tier)}
                            disabled={!canAfford || purchasing}
                            className={`w-full py-2.5 rounded-lg font-display font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                              canAfford
                                ? 'text-primary-foreground hover:brightness-110'
                                : 'bg-secondary text-muted-foreground cursor-not-allowed'
                            }`}
                            style={canAfford ? { background: tier.gradient } : undefined}
                          >
                            <Coins size={14} />
                            {tier.cost}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Singles tab */}
            {tab === 'singles' && !revealedCards && (
              <motion.div
                key="singles"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
              >
                {cards.map((card) => {
                  const price = CARD_PRICES[card.rarity];
                  const owned = ownsCard(card.id);
                  const canAfford = gold >= price;

                  return (
                    <motion.div
                      key={card.id}
                      whileHover={{ scale: 1.03 }}
                      className="rounded-xl border border-border overflow-hidden flex flex-col"
                      style={{ background: 'hsl(var(--card))' }}
                    >
                      <div className="relative h-32">
                        <img src={CARD_IMAGES[card.id]} alt={card.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 50%, rgba(0,0,0,0.8) 80%)' }} />
                        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
                          <ElementIcon element={card.element} size={12} style={{ color: card.elementColor }} />
                          <div className="flex gap-0.5">
                            {Array.from({ length: RARITY_STARS[card.rarity] }).map((_, j) => (
                              <Star key={j} size={7} fill={RARITY_COLORS[card.rarity]} color={RARITY_COLORS[card.rarity]} />
                            ))}
                          </div>
                        </div>
                        <div className="absolute bottom-1.5 left-1.5 right-1.5">
                          <p className="font-display text-[10px] font-bold text-foreground drop-shadow-md truncate">{card.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-0.5">
                              <Swords size={9} style={{ color: '#F87171' }} />
                              <span className="text-[9px] font-display font-bold text-foreground drop-shadow-md">{card.attack}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Shield size={9} style={{ color: '#60A5FA' }} />
                              <span className="text-[9px] font-display font-bold text-foreground drop-shadow-md">{card.defense}</span>
                            </div>
                          </div>
                        </div>
                        {owned && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="p-1.5 rounded-full bg-green-500/80">
                              <Check size={14} className="text-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => handleBuyCard(card)}
                          disabled={!canAfford || purchasing}
                          className={`w-full py-1.5 rounded-lg font-display font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                            canAfford
                              ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30'
                              : 'bg-secondary text-muted-foreground cursor-not-allowed'
                          }`}
                        >
                          <Coins size={11} />
                          {price}
                          {owned && <span className="text-[9px] text-muted-foreground ml-1">(+1)</span>}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
