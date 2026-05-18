import { Flame, Trophy, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const StreakCard = () => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-6 flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="glass-panel rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Streak
        </h3>
        <Flame className="w-5 h-5 text-neon-orange animate-pulse-glow" />
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current Streak</p>
          <p className="font-display text-4xl font-black text-neon-orange text-glow-cyan">
            {profile.current_streak}
            <span className="text-base font-medium text-muted-foreground ml-1">days</span>
          </p>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <Trophy className="w-4 h-4 text-neon-cyan" />
          <span className="text-sm text-muted-foreground">Best:</span>
          <span className="font-display text-sm font-bold text-neon-cyan">
            {profile.longest_streak} days
          </span>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
