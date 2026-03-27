import { Zap } from "lucide-react";
import { currentUser, getLevel, getXpProgress } from "@/lib/mockData";

const XpCard = () => {
  const level = getLevel(currentUser.xp);
  const progress = getXpProgress(currentUser.xp);

  return (
    <div className="glass-panel rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Experience
        </h3>
        <Zap className="w-5 h-5 text-primary" />
      </div>
      <p className="font-display text-4xl font-black text-primary text-glow-green animate-count-up">
        {currentUser.xp}
        <span className="text-base font-medium text-muted-foreground ml-1">XP</span>
      </p>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{level.name}</span>
          <span>{currentUser.xp} / {level.max} XP</span>
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
        {currentUser.current_streak >= 10 && (
          <span className="ml-2 text-neon-orange font-semibold">+10 bonus (10+ streak!)</span>
        )}
        {currentUser.current_streak >= 5 && currentUser.current_streak < 10 && (
          <span className="ml-2 text-neon-cyan font-semibold">+5 bonus (5+ streak!)</span>
        )}
      </div>
    </div>
  );
};

export default XpCard;
