import { Zap, Loader2 } from "lucide-react";
import { getLevel, getXpProgress } from "@/lib/mockData";
import { useProfile } from "@/hooks/useProfile";

const XpCard = () => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-6 flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const level = getLevel(profile.xp);
  const progress = getXpProgress(profile.xp);

  return (
    <div className="glass-panel rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Experience
        </h3>
        <Zap className="w-5 h-5 text-primary" />
      </div>
      <p className="font-display text-4xl font-black text-primary text-glow-green animate-count-up">
        {profile.xp}
        <span className="text-base font-medium text-muted-foreground ml-1">XP</span>
      </p>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{level.name}</span>
          <span>{profile.xp} / {level.max} XP</span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-neon-cyan rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        <span className="text-primary font-semibold">+10 XP</span> per day committed
        {profile.current_streak >= 10 && (
          <span className="ml-2 text-neon-orange font-semibold">+10 bonus (10+ streak!)</span>
        )}
        {profile.current_streak >= 5 && profile.current_streak < 10 && (
          <span className="ml-2 text-neon-cyan font-semibold">+5 bonus (5+ streak!)</span>
        )}
      </div>
    </div>
  );
};

export default XpCard;
