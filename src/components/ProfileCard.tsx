import { currentUser, getLevel } from "@/lib/mockData";

const ProfileCard = () => {
  const level = getLevel(currentUser.xp);
  const chosenAvatar = localStorage.getItem("streakverse_avatar") || currentUser.avatar_url;

  return (
    <div className="glass-panel rounded-xl p-6 glow-green animate-slide-up">
      <div className="flex items-center gap-4">
        <img
          src={chosenAvatar}
          alt={currentUser.username}
          className="w-16 h-16 rounded-xl border-2 border-primary/50"
        />
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold text-foreground tracking-wide">
            {currentUser.username}
          </h2>
          <span
            className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-display font-bold tracking-widest bg-${level.color}/10 text-${level.color} border border-${level.color}/30`}
          >
            {level.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
