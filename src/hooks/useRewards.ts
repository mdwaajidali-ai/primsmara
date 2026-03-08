import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENTS, AchievementStats } from '@/data/achievements';

export interface DailyLoginInfo {
  canClaim: boolean;
  streak: number;
  lastLoginDate: string | null;
  todayReward: number;
}

export interface UnlockedAchievement {
  achievement_id: string;
  unlocked_at: string;
  gold_claimed: boolean;
}

const STREAK_REWARDS = [25, 50, 75, 100, 150, 200, 300]; // day 1-7+

function getStreakReward(streak: number): number {
  return STREAK_REWARDS[Math.min(streak - 1, STREAK_REWARDS.length - 1)];
}

export function useRewards(userId: string | undefined) {
  const [dailyLogin, setDailyLogin] = useState<DailyLoginInfo>({
    canClaim: false,
    streak: 0,
    lastLoginDate: null,
    todayReward: 25,
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDailyLogin = useCallback(async () => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('daily_logins')
      .select('*')
      .eq('user_id', userId)
      .order('login_date', { ascending: false })
      .limit(2);

    if (!data || data.length === 0) {
      setDailyLogin({ canClaim: true, streak: 0, lastLoginDate: null, todayReward: getStreakReward(1) });
      return;
    }

    const latest = data[0];
    if (latest.login_date === today) {
      setDailyLogin({
        canClaim: false,
        streak: latest.streak,
        lastLoginDate: latest.login_date,
        todayReward: 0,
      });
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const isConsecutive = latest.login_date === yesterdayStr;
    const newStreak = isConsecutive ? latest.streak + 1 : 1;

    setDailyLogin({
      canClaim: true,
      streak: isConsecutive ? latest.streak : 0,
      lastLoginDate: latest.login_date,
      todayReward: getStreakReward(newStreak),
    });
  }, [userId]);

  const claimDailyLogin = useCallback(async (): Promise<number> => {
    if (!userId || !dailyLogin.canClaim) return 0;

    const today = new Date().toISOString().split('T')[0];
    const newStreak = dailyLogin.streak + 1;
    const reward = getStreakReward(newStreak);

    const { error } = await supabase.from('daily_logins').insert({
      user_id: userId,
      login_date: today,
      streak: newStreak,
      gold_earned: reward,
    });

    if (error) return 0;

    // Add gold to profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('gold')
      .eq('user_id', userId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ gold: profile.gold + reward })
        .eq('user_id', userId);
    }

    setDailyLogin({
      canClaim: false,
      streak: newStreak,
      lastLoginDate: today,
      todayReward: 0,
    });

    return reward;
  }, [userId, dailyLogin]);

  const fetchAchievements = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('player_achievements')
      .select('achievement_id, unlocked_at, gold_claimed')
      .eq('user_id', userId);
    if (data) setUnlockedAchievements(data);
  }, [userId]);

  const checkAndUnlockAchievements = useCallback(async (stats: AchievementStats): Promise<string[]> => {
    if (!userId) return [];
    const newlyUnlocked: string[] = [];
    const alreadyUnlocked = new Set(unlockedAchievements.map(a => a.achievement_id));

    for (const achievement of ACHIEVEMENTS) {
      if (alreadyUnlocked.has(achievement.id)) continue;
      if (achievement.condition(stats)) {
        const { error } = await supabase.from('player_achievements').insert({
          user_id: userId,
          achievement_id: achievement.id,
        });
        if (!error) newlyUnlocked.push(achievement.id);
      }
    }

    if (newlyUnlocked.length > 0) {
      await fetchAchievements();
    }
    return newlyUnlocked;
  }, [userId, unlockedAchievements, fetchAchievements]);

  const claimAchievementGold = useCallback(async (achievementId: string): Promise<number> => {
    if (!userId) return 0;
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return 0;

    const entry = unlockedAchievements.find(a => a.achievement_id === achievementId);
    if (!entry || entry.gold_claimed) return 0;

    // Mark as claimed
    await supabase
      .from('player_achievements')
      .update({ gold_claimed: true })
      .eq('user_id', userId)
      .eq('achievement_id', achievementId);

    // Add gold
    const { data: profile } = await supabase
      .from('profiles')
      .select('gold')
      .eq('user_id', userId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ gold: profile.gold + achievement.goldReward })
        .eq('user_id', userId);
    }

    await fetchAchievements();
    return achievement.goldReward;
  }, [userId, unlockedAchievements, fetchAchievements]);

  useEffect(() => {
    if (userId) {
      Promise.all([fetchDailyLogin(), fetchAchievements()]).then(() => setLoading(false));
    }
  }, [userId, fetchDailyLogin, fetchAchievements]);

  return {
    dailyLogin,
    claimDailyLogin,
    unlockedAchievements,
    checkAndUnlockAchievements,
    claimAchievementGold,
    loading,
    refetchRewards: () => Promise.all([fetchDailyLogin(), fetchAchievements()]),
  };
}
