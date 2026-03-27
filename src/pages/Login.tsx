import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Github, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGitHubLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
    });
    if (error) {
      console.error("Error logging in with GitHub:", error);
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
          <Flame className="w-10 h-10 text-primary animate-pulse-glow" />
          <h1 className="font-display text-3xl font-black tracking-wider text-foreground">
            STREAK<span className="text-primary">VERSE</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm mb-10">
          Track your coding streaks. Climb the leaderboard.
        </p>

        {/* GitHub Login Button */}
        <button
          onClick={handleGitHubLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-foreground text-background font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Github className="w-5 h-5" />
          )}
          {loading ? "Connecting..." : "Sign in with GitHub"}
        </button>

        <p className="text-muted-foreground text-xs mt-6">
          We only access your public commit data.
        </p>
      </div>
    </div>
  );
};

export default Login;
