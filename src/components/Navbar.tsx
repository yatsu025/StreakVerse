import { Link, useLocation, useNavigate } from "react-router-dom";
import { Flame, Trophy, LayoutDashboard, LogOut } from "lucide-react";

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("streakverse_logged_in");
    localStorage.removeItem("streakverse_avatar");
    localStorage.removeItem("streakverse_character");
    navigate("/login");
  };

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <Flame className="w-7 h-7 text-neon-green animate-pulse-glow" />
          <span className="font-display text-xl font-bold tracking-wider text-foreground">
            STREAK<span className="text-primary">VERSE</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === to
                  ? "bg-primary/10 text-primary glow-green"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all ml-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
