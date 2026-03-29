import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getLevel } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";

const ProfileCard = () => {
  const [userData, setUserData] = useState<{ username: string; avatar_url: string; xp: number } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata;
      setUserData({
        username: metadata.user_name || metadata.full_name || "Coder",
        avatar_url: localStorage.getItem("streakverse_avatar") || metadata.avatar_url || "https://api.dicebear.com/9.x/pixel-art/svg?seed=default",
        xp: 0, // In future, fetch from profile table
      });
    }
  }, [user]);

  if (!userData) return null;

  const level = getLevel(userData.xp);

  return (
    <div className="glass-panel rounded-xl p-6 glow-green animate-slide-up">
      <div className="flex items-center gap-4">
        <img
          src={userData.avatar_url}
          alt={userData.username}
          className="w-16 h-16 rounded-xl border-2 border-primary/50"
        />
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold text-foreground tracking-wide">
            @{userData.username}
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
