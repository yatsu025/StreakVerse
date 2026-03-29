import { GitCommit, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const ActivityGrid = () => {
  const { commits, loading } = useProfile();

  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-6 flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const maxCommits = Math.max(...commits.map((c) => c.commit_count), 1);

  return (
    <div className="glass-panel rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Recent Activity
        </h3>
        <GitCommit className="w-5 h-5 text-neon-cyan" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {commits.map((day) => {
          const intensity = day.commit_count / maxCommits;
          return (
            <div key={day.date} className="group relative">
              <div
                className="aspect-square rounded-md border border-border/30 transition-all hover:scale-110"
                style={{
                  backgroundColor:
                    day.commit_count === 0
                      ? "hsl(220 15% 12%)"
                      : `hsl(150 100% ${50 - intensity * 25}% / ${0.2 + intensity * 0.8})`,
                  boxShadow:
                    day.commit_count > 0
                      ? `0 0 ${intensity * 12}px hsl(150 100% 50% / ${intensity * 0.3})`
                      : "none",
                }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-card border border-border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                {day.date}: {day.commit_count} commits
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <div
            key={v}
            className="w-3 h-3 rounded-sm"
            style={{
              backgroundColor:
                v === 0
                  ? "hsl(220 15% 12%)"
                  : `hsl(150 100% ${50 - v * 25}% / ${0.2 + v * 0.8})`,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityGrid;
