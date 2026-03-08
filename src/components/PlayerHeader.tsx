import { useAuthContext } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, User, Trophy, Coins, Sparkles, Swords } from 'lucide-react';

export default function PlayerHeader() {
  const { profile, signOut } = useAuthContext();

  if (!profile) return null;

  const xpForNextLevel = profile.level * 100;
  const xpPercent = Math.min((profile.xp / xpForNextLevel) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 flex-wrap"
    >
      {/* Avatar / Level */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <User size={16} className="text-primary" />
        </div>
        <div>
          <p className="font-display text-xs font-bold text-foreground leading-tight">{profile.username}</p>
          <div className="flex items-center gap-1">
            <Sparkles size={10} className="text-primary" />
            <span className="text-[10px] font-body text-muted-foreground">Lv.{profile.level}</span>
            <div className="w-12 h-1 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border">
        <Coins size={14} className="text-primary" />
        <span className="font-display text-xs font-bold text-foreground">{profile.gold}</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border">
        <Trophy size={14} className="text-primary" />
        <span className="font-display text-xs font-bold text-foreground">
          {profile.wins}W / {profile.losses}L
        </span>
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="p-2 rounded-lg bg-secondary hover:bg-destructive/20 transition-colors border border-border"
        title="Sign out"
      >
        <LogOut size={16} className="text-muted-foreground" />
      </button>
    </motion.div>
  );
}
