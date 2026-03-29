import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Github, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      console.log("Session found in Login, navigating...");
      if (localStorage.getItem("streakverse_character")) {
        navigate("/", { replace: true });
      } else {
        navigate("/choose-character", { replace: true });
      }
    }
  }, [session, navigate]);

  const handleGitHubLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background grid effect */}
      <div className="fixed inset-0 opacity-5" style={{
        backgroundImage: "linear-gradient(hsl(var(--neon-green) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--neon-green) / 0.3) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="relative glass-panel rounded-2xl p-10 w-full max-w-md text-center animate-slide-up glow-green">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <Flame className="w-12 h-12 text-primary animate-pulse-glow" />
          <h1 className="font-display text-4xl font-black tracking-wider text-foreground">
            STREAK<span className="text-primary">VERSE</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm mb-12">
          Track your coding streaks. Climb the leaderboard.
        </p>

        {/* GitHub Login Button - The Only Login Method */}
        <button
          onClick={handleGitHubLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 h-14 rounded-xl bg-foreground text-background font-bold text-lg transition-all hover:opacity-90 disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98] glow-green"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm uppercase tracking-widest">Verifying Account...</span>
            </div>
          ) : (
            <>
              <Github className="w-6 h-6" />
              <span>VERIFY WITH GITHUB</span>
            </>
          )}
        </button>

        <p className="text-muted-foreground text-xs mt-10 max-w-[280px] mx-auto leading-relaxed italic">
          One person, one account. We verify your GitHub identity to ensure fair play on the leaderboard.
        </p>
      </div>
    </div>
  );
};

export default Login;
