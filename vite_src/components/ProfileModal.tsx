import { User, getLevel, getXpProgress } from "@/lib/mockData";
import { X, Flame, Trophy, Zap, ExternalLink } from "lucide-react";

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

const ProfileModal = ({ user, onClose }: ProfileModalProps) => {
  const level = getLevel(user.xp);
  const progress = getXpProgress(user.xp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative glass-panel rounded-2xl p-8 w-full max-w-sm animate-slide-up glow-green"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Avatar & Name */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-20 h-20 rounded-xl border-2 border-primary/50 mb-3"
          />
          <h2 className="font-display text-xl font-black tracking-wider text-foreground">
            {user.username}
          </h2>
          <span className={`inline-block mt-1.5 px-3 py-0.5 rounded-full text-xs font-display font-bold tracking-widest bg-${level.color}/10 text-${level.color} border border-${level.color}/30`}>
            {level.name}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <Zap className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="font-display text-lg font-black text-primary">{user.xp}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">XP</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <Flame className="w-4 h-4 text-neon-orange mx-auto mb-1" />
            <p className="font-display text-lg font-black text-neon-orange">{user.current_streak}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Streak</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <Trophy className="w-4 h-4 text-neon-cyan mx-auto mb-1" />
            <p className="font-display text-lg font-black text-neon-cyan">{user.longest_streak}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Best</p>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{level.name}</span>
            <span>{user.xp} / {level.max} XP</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-neon-cyan rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* GitHub Link */}
        <a
          href={`https://github.com/${user.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-foreground text-background font-semibold text-sm transition-all hover:opacity-90"
        >
          <ExternalLink className="w-4 h-4" />
          View GitHub Profile
        </a>
      </div>
    </div>
  );
};

export default ProfileModal;
