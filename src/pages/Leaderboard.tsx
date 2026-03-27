import { useState } from "react";
import { Crown, Medal, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProfileModal from "@/components/ProfileModal";
import { leaderboardUsers, getLevel, type User } from "@/lib/mockData";

const rankIcons = [
  <Crown key="1" className="w-5 h-5 text-neon-orange" />,
  <Medal key="2" className="w-5 h-5 text-muted-foreground" />,
  <Award key="3" className="w-5 h-5 text-neon-orange/60" />,
];

const Leaderboard = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-8">
        <div className="flex items-center gap-3 mb-8 animate-slide-up">
          <Crown className="w-8 h-8 text-neon-orange" />
          <h1 className="font-display text-3xl font-black tracking-wider">LEADERBOARD</h1>
        </div>

        <div className="space-y-3">
          {leaderboardUsers.map((user, i) => {
            const level = getLevel(user.xp);
            const isCurrentUser = user.id === "1";

            return (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full glass-panel rounded-xl p-4 flex items-center gap-4 animate-slide-up transition-all hover:border-primary/30 cursor-pointer text-left ${
                  isCurrentUser ? "border-primary/40 glow-green" : ""
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-8 flex justify-center">
                  {i < 3 ? (
                    rankIcons[i]
                  ) : (
                    <span className="font-display text-sm font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                  )}
                </div>

                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-10 h-10 rounded-lg border border-border/50"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-display text-sm font-bold tracking-wide ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                      {user.username}
                    </span>
                    <span className={`text-[10px] font-display font-bold tracking-widest px-2 py-0.5 rounded-full bg-${level.color}/10 text-${level.color} border border-${level.color}/20`}>
                      {level.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    🔥 {user.current_streak} day streak
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-display text-lg font-black text-primary">
                    {user.xp}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">XP</p>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {selectedUser && (
        <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

export default Leaderboard;
