import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, CalendarCheck, Trophy, Sparkles, Star, Swords, Shield, Layers, Crown, Flame, Zap } from 'lucide-react';
import { ACHIEVEMENTS, Achievement, AchievementStats } from '@/data/achievements';
import { DailyLoginInfo, UnlockedAchievement } from '@/hooks/useRewards';
import { toast } from 'sonner';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles, Layers, Crown, Trophy, Swords, Shield, Star, Flame, Zap, Coins, CalendarCheck,
  Library: Layers,
  Medal: Trophy,
  CalendarHeart: CalendarCheck,
};

const STREAK_REWARDS = [25, 50, 75, 100, 150, 200, 300];

interface RewardsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  dailyLogin: DailyLoginInfo;
  onClaimDaily: () => Promise<number>;
  unlockedAchievements: UnlockedAchievement[];
  onClaimAchievement: (id: string) => Promise<number>;
  onRefreshProfile: () => void;
  stats: AchievementStats;
  onCheckAchievements: (stats: AchievementStats) => Promise<string[]>;
}

type Tab = 'daily' | 'achievements';

export default function RewardsPanel({
  isOpen,
  onClose,
  dailyLogin,
  onClaimDaily,
  unlockedAchievements,
  onClaimAchievement,
  onRefreshProfile,
  stats,
  onCheckAchievements,
}: RewardsPanelProps) {
  const [tab, setTab] = useState<Tab>('daily');
  const [claiming, setClaiming] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Check for new achievements when panel opens
  useEffect(() => {
    if (isOpen) {
      onCheckAchievements(stats);
    }
  }, [isOpen, stats, onCheckAchievements]);

  const handleClaimDaily = async () => {
    setClaiming(true);
    const gold = await onClaimDaily();
    if (gold > 0) {
      toast.success(`+${gold} gold! Day ${dailyLogin.streak + 1} streak bonus!`, { duration: 3000 });
      onRefreshProfile();
    }
    setClaiming(false);
  };

  const handleClaimAchievement = async (id: string) => {
    setClaimingId(id);
    const gold = await onClaimAchievement(id);
    if (gold > 0) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      toast.success(`+${gold} gold from "${ach?.name}"!`, { duration: 3000 });
      onRefreshProfile();
    }
    setClaimingId(null);
  };

  if (!isOpen) return null;

  const unlockedSet = new Set(unlockedAchievements.map(a => a.achievement_id));
  const claimedSet = new Set(unlockedAchievements.filter(a => a.gold_claimed).map(a => a.achievement_id));

  const categories = ['collection', 'battle', 'progression'] as const;
  const categoryLabels = { collection: '📚 Collection', battle: '⚔️ Battle', progression: '📈 Progression' };

  const unclaimedCount = unlockedAchievements.filter(a => !a.gold_claimed).length + (dailyLogin.canClaim ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">Rewards</h2>
            {unclaimedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {unclaimedCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(['daily', 'achievements'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-display font-semibold transition-all ${
                tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'daily' ? '📅 Daily Login' : '🏆 Achievements'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'daily' ? (
            <div className="space-y-4">
              {/* Streak display */}
              <div className="text-center p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CalendarCheck size={24} className="text-primary" />
                  <span className="font-display text-2xl font-bold text-foreground">
                    {dailyLogin.canClaim ? dailyLogin.streak + 1 : dailyLogin.streak} Day Streak
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-body">
                  {dailyLogin.canClaim
                    ? 'Your daily reward is ready!'
                    : 'Come back tomorrow for more rewards!'}
                </p>
              </div>

              {/* Claim button */}
              <button
                onClick={handleClaimDaily}
                disabled={!dailyLogin.canClaim || claiming}
                className={`w-full py-4 rounded-xl font-display font-bold text-lg transition-all ${
                  dailyLogin.canClaim
                    ? 'text-primary-foreground shine-sweep'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed'
                }`}
                style={dailyLogin.canClaim ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(48 96% 53%))' } : undefined}
              >
                {claiming ? (
                  'Claiming...'
                ) : dailyLogin.canClaim ? (
                  <span className="flex items-center justify-center gap-2">
                    <Coins size={20} />
                    Claim +{dailyLogin.todayReward} Gold
                  </span>
                ) : (
                  '✓ Already Claimed Today'
                )}
              </button>

              {/* Weekly preview */}
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground mb-3">Weekly Streak Rewards</h3>
                <div className="grid grid-cols-7 gap-1.5">
                  {STREAK_REWARDS.map((reward, i) => {
                    const dayNum = i + 1;
                    const currentStreak = dailyLogin.canClaim ? dailyLogin.streak + 1 : dailyLogin.streak;
                    const completed = dayNum <= (dailyLogin.canClaim ? dailyLogin.streak : currentStreak);
                    const isToday = dayNum === currentStreak && !dailyLogin.canClaim;
                    const isNext = dayNum === (dailyLogin.canClaim ? dailyLogin.streak + 1 : currentStreak + 1);

                    return (
                      <div
                        key={i}
                        className={`flex flex-col items-center p-2 rounded-lg border text-center ${
                          completed
                            ? 'bg-primary/20 border-primary/40'
                            : isToday
                            ? 'bg-primary/10 border-primary ring-2 ring-primary/30'
                            : isNext
                            ? 'bg-secondary border-primary/30'
                            : 'bg-secondary/50 border-border'
                        }`}
                      >
                        <span className="text-[10px] font-body text-muted-foreground">D{dayNum}</span>
                        <Coins size={12} className={completed ? 'text-primary' : 'text-muted-foreground'} />
                        <span className={`text-[10px] font-display font-bold ${completed ? 'text-primary' : 'text-muted-foreground'}`}>
                          {reward}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                <Trophy size={18} className="text-primary" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-display font-semibold text-foreground">
                      {unlockedAchievements.length}/{ACHIEVEMENTS.length}
                    </span>
                  </div>
                  <div className="h-2 mt-1 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              {categories.map(cat => (
                <div key={cat}>
                  <h3 className="font-display text-sm font-semibold text-foreground mb-2">{categoryLabels[cat]}</h3>
                  <div className="space-y-2">
                    {ACHIEVEMENTS.filter(a => a.category === cat).map(ach => {
                      const unlocked = unlockedSet.has(ach.id);
                      const claimed = claimedSet.has(ach.id);
                      const IconComp = ICON_MAP[ach.icon] || Star;

                      return (
                        <div
                          key={ach.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            unlocked
                              ? 'bg-primary/5 border-primary/30'
                              : 'bg-secondary/30 border-border opacity-60'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            unlocked ? 'bg-primary/20' : 'bg-secondary'
                          }`}>
                            <IconComp size={18} className={unlocked ? 'text-primary' : 'text-muted-foreground'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-display text-sm font-bold ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {ach.name}
                            </p>
                            <p className="text-xs font-body text-muted-foreground">{ach.description}</p>
                          </div>
                          {unlocked && !claimed ? (
                            <button
                              onClick={() => handleClaimAchievement(ach.id)}
                              disabled={claimingId === ach.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-display font-bold text-xs text-primary-foreground shine-sweep"
                              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(48 96% 53%))' }}
                            >
                              <Coins size={12} />
                              {ach.goldReward}
                            </button>
                          ) : claimed ? (
                            <span className="text-xs font-display text-muted-foreground">✓ Claimed</span>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Coins size={12} />
                              <span>{ach.goldReward}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
