import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Check, ChevronRight } from "lucide-react";

const characterSeeds = [
  "warrior", "mage", "rogue", "knight", "ninja", "samurai",
  "wizard", "archer", "monk", "pirate", "cyborg", "druid",
];

const CharacterSelect = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleConfirm = () => {
    if (!selected) return;
    localStorage.setItem("streakverse_avatar", `https://api.dicebear.com/9.x/pixel-art/svg?seed=${selected}`);
    localStorage.setItem("streakverse_character", selected);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 opacity-5" style={{
        backgroundImage: "linear-gradient(hsl(var(--neon-green) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--neon-green) / 0.3) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="relative w-full max-w-2xl animate-slide-up">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Flame className="w-8 h-8 text-primary animate-pulse-glow" />
          <h1 className="font-display text-2xl font-black tracking-wider text-foreground">
            CHOOSE YOUR <span className="text-primary">CHARACTER</span>
          </h1>
        </div>
        <p className="text-center text-muted-foreground text-sm mb-8">
          Pick your avatar for the StreakVerse
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-8">
          {characterSeeds.map((seed) => (
            <button
              key={seed}
              onClick={() => setSelected(seed)}
              className={`relative group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                selected === seed
                  ? "border-primary bg-primary/10 glow-green scale-105"
                  : "border-border/50 bg-card/40 hover:border-primary/40 hover:bg-card/80"
              }`}
            >
              {selected === seed && (
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <img
                src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`}
                alt={seed}
                className="w-14 h-14 rounded-lg"
              />
              <span className="text-xs font-display font-semibold tracking-wider capitalize text-muted-foreground group-hover:text-foreground">
                {seed}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected}
          className={`w-full flex items-center justify-center gap-2 h-12 rounded-xl font-display font-bold text-sm tracking-wider transition-all ${
            selected
              ? "bg-primary text-primary-foreground glow-green hover:opacity-90"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          }`}
        >
          ENTER THE VERSE
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CharacterSelect;
