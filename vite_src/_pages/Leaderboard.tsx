import { useState, useEffect } from "react";
import { Crown, Medal, Award, Search, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProfileModal from "@/components/ProfileModal";
import { getLevel, type User } from "@/lib/mockData";
import { supabase } from "@/lib/supabaseClient";

const rankIcons = [
  <Crown key="1" className="w-5 h-5 text-neon-orange" />,
  <Medal key="2" className="w-5 h-5 text-muted-foreground" />,
  <Award key="3" className="w-5 h-5 text-neon-orange/60" />,
];

const Leaderboard = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
    
    // Get current user ID
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
    });
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("xp", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-up">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-neon-orange" />
            <h1 className="font-display text-3xl font-black tracking-wider">LEADERBOARD</h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 border border-border/50 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground font-display tracking-widest text-sm">FETCHING DATA...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, i) => {
                const level = getLevel(user.xp);
                const isCurrentUser = user.id === currentUserId;

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
                      {i < 3 && searchQuery === "" ? (
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
                        <span className={`font-display text-sm font-bold tracking-wide truncate ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                          {user.username}
                        </span>
                        <span className={`text-[10px] font-display font-bold tracking-widest px-2 py-0.5 rounded-full bg-${level.color}/10 text-${level.color} border border-${level.color}/20 whitespace-nowrap`}>
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
              })
            ) : (
              <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed border-border">
                <p className="text-muted-foreground">No users found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </main>

      {selectedUser && (
        <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

export default Leaderboard;
